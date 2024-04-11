import fs from "fs";
import ldap from "ldapjs";
import jwt from "jsonwebtoken";
import { User } from "../../../../db/models";

const config = useRuntimeConfig();

if (!config.jwt_key) {
  throw new Error("jwt_key is not set.");
}

const ldapEnabled = config.public.ldap_enabled === "true" || config.public.ldap_enabled === true;
const ldapSSL = config.ldap_ssl_insecure === "true" || config.ldap_ssl_insecure === true;

const SECRET_KEY = config.jwt_key as string;

function getSSLConfig(): false | { rejectUnauthorized: boolean; ca: string | Buffer } {
  if (config.ldap_ssl !== "true") {
    return false;
  }
  let sslCA: string | Buffer | undefined = config.ldap_ssl_ca;
  if (!sslCA) {
    throw new Error("SSL CA file or path to file not provided");
  }
  if (sslCA.includes("-BEGIN")) {
    if (fs.statSync(sslCA).isFile()) {
      sslCA = fs.readFileSync(sslCA);
      if (sslCA.includes("-BEGIN")) {
        throw new Error("SSL CA file at given path was not a certificate");
      }
    } else {
      throw new Error("SSL CA file is neither a certificate nor is it a path to one");
    }
  }

  return {
    rejectUnauthorized: !ldapSSL,
    ca: sslCA,
  };
}

export default defineEventHandler(async (event) => {
  logger.debug({ service: "auth", message: `entering ldap flow` });
  const body = await readBody(event);
  const username = body.username;
  const password = body.password;

  let propagatedError = null;
  // let user: User | null = null;
  let userFound = false;

  let inLDAPCallbacks = ldapEnabled;
  const inLDAPCallbacksPromise = new Promise<void>((resolve) => {
    const intervalTimeout = setInterval(() => {
      if (!inLDAPCallbacks) {
        logger.debug({ service: "auth", message: `Out of ldap callbacks` });
        clearInterval(intervalTimeout);
        resolve();
      } else {
        logger.debug({ service: "auth", message: `Still in ldap callbacks` });
      }
    }, 1000);
  });
  logger.debug({
    service: "auth",
    message: `initial state of inldapcallbacks: ${inLDAPCallbacks}`,
  });

  let userPromiseResolve: (value: User | PromiseLike<User> | null) => void;
  const userPromise = new Promise<User | null>((resolve) => {
    userPromiseResolve = resolve;
  });

  if (ldapEnabled) {
    logger.debug({ service: "auth", message: `entering ldap enabled flow` });
    let sslConfig;
    try {
      sslConfig = getSSLConfig();
    } catch (e) {
      propagatedError ??= createError({
        statusCode: 500,
        statusMessage: e instanceof Error ? e.message : `LDAP SSL configuration failed: ${e}`,
      });
      inLDAPCallbacks = false;
    }
    console.log("created sslconfig");

    const searchClient = ldap.createClient({
      url: `${sslConfig ? "ldaps" : "ldap"}://${config.ldap_host}:${config.ldap_port}`,
      ...(sslConfig && { tlsOptions: { ...sslConfig } }),
    });
    const userClient = ldap.createClient({
      url: `${sslConfig ? "ldaps" : "ldap"}://${config.ldap_host}:${config.ldap_port}`,
      ...(sslConfig && { tlsOptions: { ...sslConfig } }),
    });
    console.log("attempted to create clients");

    searchClient.on("error", (err) => {
      propagatedError ??= createError({
        statusCode: 500,
        statusMessage: err instanceof Error ? err.message : `Search client errored out: ${err}`,
      });
      searchClient.unbind();
      userClient.unbind();
      console.log(`Search client errored out: ${err}`);
      inLDAPCallbacks = false;
    });
    userClient.on("error", (err) => {
      propagatedError ??= createError({
        statusCode: 500,
        statusMessage: err instanceof Error ? err.message : `User client errored out: ${err}`,
      });
      searchClient.unbind();
      userClient.unbind();
      console.log(`User client errored out: ${err}`);
      inLDAPCallbacks = false;
    });

    searchClient.on("close", () => {
      console.log(`Search server connection closed`);
      inLDAPCallbacks = false;
    });
    userClient.on("close", () => {
      console.log(`User server connection closed`);
      inLDAPCallbacks = false;
    });

    searchClient.on("connect", () => {
      console.log("Search client connected to the server");

      searchClient.bind(config.ldap_binddn, config.ldap_password, (err) => {
        if (err) {
          propagatedError ??= createError({
            statusCode: 500,
            statusMessage: err instanceof Error ? err.message : `Search client bind failed: ${err}`,
          });
          searchClient.unbind();
          userClient.unbind();
          console.log(`Search client bind err: ${err}`);
        }

        searchClient.search(
          config.ldap_searchbase,
          { scope: "sub", filter: config.ldap_searchfilter.replace("{{username}}", username) },
          (err, res) => {
            console.log("Attempted to do a search");
            if (err) {
              propagatedError ??= createError({
                statusCode: 500,
                statusMessage:
                  err instanceof Error ? err.message : `Search client search failed: ${err}`,
              });
              searchClient.unbind();
              userClient.unbind();
              console.log(`Search client bind err: ${err}`);
            }
            console.log(`res on search: ${res}`);

            res.on("searchEntry", (entry) => {
              userFound = true;
              console.log("entry: " + entry.pojo);
              console.log("entry bindproperty: " + entry.dn);
              console.log("entry id: " + entry.id);

              userClient.bind(entry.dn.toString(), password, async (err) => {
                console.log("in interior bind");
                if (err) {
                  userPromiseResolve(null);
                  console.log(`LDAP user password validation err: ${err}`);
                  // should be valid to throw an error here for the try ldap -> local auth here so that we can say that found an ldap user but they got the password wrong
                  throw createError({
                    statusCode: 401,
                    statusMessage: `LDAP user password validation err: ${err}`,
                  });
                }

                // you're a real ~~wizard~~ ldap user so we should login
                const userEmail = entry.attributes.find(
                  (attr) => attr.type === config.ldap_mailfield,
                )?.values[0]; // assuming that everyone has at least one email but should probs throw an error if this assumption is false

                console.log(`useremail: ${userEmail}`);
                const user = await User.findOne({ where: { email: userEmail } });
                console.log(`user exists? ${user}`);
                if (!user) {
                  console.log("entered user creation process");
                  const names = entry.attributes
                    .find((attr) => attr.type === config.ldap_namefield)
                    ?.values[0].split(" ") ?? [""];
                  const userData = {
                    firstName: names[0],
                    lastName: names.splice(1).join(" "),
                    email: userEmail,
                    UserRoleId: 2, // normal user - should replace this with api call probably?
                    TimezoneName: "America/New_York",
                  };
                  const user: User | null = await $fetch("/api/users/create", {
                    method: "POST",
                    body: userData,
                  });
                  console.log("attempted to create user");
                  if (user) {
                    userPromiseResolve(user);
                  } else {
                    console.log("failed at creating user");
                    throw createError({
                      statusCode: 401,
                      statusMessage: "Couldn't create TIR user based off of LDAP user",
                    });
                  }
                } else {
                  userPromiseResolve(user);
                }
              });
            });
            res.on("error", (err) => {
              console.error("error: " + err.message);
              // presumably handle this error
              searchClient.unbind((err) => {
                if (err) {
                  console.log(`LDAP server unbind err: ${err}`);
                  // throw createError({statusCode: 401, statusMessage: `LDAP server unbind err: ${err}`});
                }
              });
              userClient.unbind((err) => {
                if (err) {
                  console.log(`LDAP server unbind err: ${err}`);
                  // throw createError({statusCode: 401, statusMessage: `LDAP server unbind err: ${err}`});
                }
              });
            });
            res.on("end", (result) => {
              // will need to add logic here for if we end without having found any search results
              // doesnt' seem to be a way to get that information from result.
              console.log("status: " + result?.status);
              console.log(`result: ${result}`);
              if (!userFound) {
                logger.info({
                  service: "auth",
                  message: `Non-existing ldap user login attempt.  Username: ${username}`,
                });
                userPromiseResolve(null);
              }
              searchClient.unbind((err) => {
                if (err) {
                  console.log(`LDAP server unbind err: ${err}`);
                  // throw createError({statusCode: 401, statusMessage: `LDAP server unbind err: ${err}`});
                }
              });
              userClient.unbind((err) => {
                if (err) {
                  console.log(`LDAP server unbind err: ${err}`);
                  // throw createError({statusCode: 401, statusMessage: `LDAP server unbind err: ${err}`});
                }
              });
            });
          },
        );
      });
    });
  }

  await inLDAPCallbacksPromise;

  const user = await userPromise;

  if (!user) {
    if (user === null) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid Username or Password",
      });
    }
  }

  if (propagatedError !== null) {
    throw propagatedError;
  }

  const cookieName = "tirtoken";
  setCookie(event, cookieName, jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "2h" }), {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
    secure: false, // process.env.NODE_ENV === "production",
    // expires: new Date(Date.now() + '2h'),
  });

  const results = {
    token: jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "2h" }),
    userId: user.id,
  };
  return results;
});
