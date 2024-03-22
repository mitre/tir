import fs from "fs";
import ldap from "ldapjs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../../../db/models";

const config = useRuntimeConfig();

if (!config.jwt_key) {
  throw new Error("jwt_key is not set.");
}

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
    rejectUnauthorized: config.ldap_ssl_insecure !== "true",
    ca: sslCA,
  };
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const email = body.email;
  const password = body.password;

  let user: User | null = null;

  let inLDAPCallbacks = config.ldap_enabled === "true" && email !== "admin@tir.local";
  const inLDAPCallbacksPromise = new Promise<void>((resolve) => {
    const intervalTimeout = setInterval(() => {
      if (!inLDAPCallbacks) {
        console.log("Out of ldap callbacks");
        clearInterval(intervalTimeout);
        resolve();
      } else {
        console.log("Still in ldap callbacks");
      }
    }, 1000);
  });
  console.log(`initial state of inldapcallbacks: ${inLDAPCallbacks}`);

  if (config.ldap_enabled === "true" && email !== "admin@tir.local") {
    console.log("entering ldap flow");
    const sslConfig = getSSLConfig();
    console.log("created sslconfig");
    const client = ldap.createClient({
      url: `${sslConfig ? "ldaps" : "ldap"}://${config.ldap_host}:${config.ldap_port}`,
      ...(sslConfig && { tlsOptions: { ...sslConfig } }),
    });
    const client2 = ldap.createClient({
      url: `${sslConfig ? "ldaps" : "ldap"}://${config.ldap_host}:${config.ldap_port}`,
      ...(sslConfig && { tlsOptions: { ...sslConfig } }),
    });
    console.log("attempted to create client");

    client.on("error", (err) => {
      inLDAPCallbacks = false;
      console.log(`LDAP server err: ${err}`);
      client.unbind((err) => {
        if (err) {
          console.log(`LDAP server unbind err: ${err}`);
          // throw createError({statusCode: 401, statusMessage: `LDAP server unbind err: ${err}`});
        }
      });
      // throw createError({statusCode: 401, statusMessage: `LDAP server connection err: ${err}`});
    });
    client2.on("error", (err) => {
      console.log(`LDAP server err: ${err}`);
      client2.unbind((err) => {
        if (err) {
          console.log(`LDAP server unbind err: ${err}`);
          // throw createError({statusCode: 401, statusMessage: `LDAP server unbind err: ${err}`});
        }
      });
      // throw createError({statusCode: 401, statusMessage: `LDAP server connection err: ${err}`});
    });

    client.on("close", () => {
      inLDAPCallbacks = false;
      console.log(`LDAP server connection closed`);
    });

    client.on("connect", () => {
      console.log("in connected event ");
      client.bind(config.ldap_binddn, config.ldap_password, (err) => {
        if (err) {
          console.log(`LDAP server bind err: ${err}`);
          // throw createError({statusCode: 401, statusMessage: `LDAP server bind err: ${err}`});
        }
        client.search(
          config.ldap_searchbase,
          { scope: "sub", filter: config.ldap_searchfilter.replace("{{username}}", email) },
          (err, res) => {
            console.log("attempted to do a search");
            if (err) {
              console.log(`LDAP server search err: ${err}`);
              // throw createError({statusCode: 401, statusMessage: `LDAP server search err: ${err}`});
            }

            console.log(JSON.stringify(res, null, 2));

            res.on("searchEntry", (entry) => {
              console.log("entry: " + entry.json);
              console.log("entryv2: " + entry);
              console.log("entry bindproperty: " + entry.dn);
              console.log("entry id: " + entry.id);

              console.log("entry.dn.tostring typeof: " + typeof entry.dn.toString());
              console.log("typeof password: " + typeof password);
              // console.log("password: " + password);

              client2.bind(entry.dn.toString(), password, async (err) => {
                console.log("in interior bind");
                if (err) {
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
                user = await User.findOne({ where: { email: userEmail } });
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
                  user = await $fetch("/api/users/create", { method: "POST", body: userData });
                  console.log("attempted to create user");
                  if (!user) {
                    console.log("failed at creating user");
                    throw createError({
                      statusCode: 401,
                      statusMessage: "Couldn't create TIR user based off of LDAP user",
                    });
                  }
                }
              });
            });
            res.on("error", (err) => {
              console.error("error: " + err.message);
              // presumably handle this error
              client.unbind((err) => {
                if (err) {
                  console.log(`LDAP server unbind err: ${err}`);
                  // throw createError({statusCode: 401, statusMessage: `LDAP server unbind err: ${err}`});
                }
              });
              client2.unbind((err) => {
                if (err) {
                  console.log(`LDAP server unbind err: ${err}`);
                  // throw createError({statusCode: 401, statusMessage: `LDAP server unbind err: ${err}`});
                }
              });
            });
            res.on("end", (result) => {
              // will need to add logic here for if we end without having found any search results
              console.log("status: " + result?.status);
              client.unbind((err) => {
                if (err) {
                  console.log(`LDAP server unbind err: ${err}`);
                  // throw createError({statusCode: 401, statusMessage: `LDAP server unbind err: ${err}`});
                }
              });
              client2.unbind((err) => {
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

  if (user === null) {
    console.log("entered local flow");
    user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("couldn't find user");
      throw createError({
        statusCode: 401,
        statusMessage: "Unknown User.",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log("invalid password");
      throw createError({
        statusCode: 401,
        statusMessage: "Bad Password",
      });
    }
  }

  if (user === null) {
    console.log("last minute user check - can probs delete this block");
    throw createError({
      statusCode: 401,
      statusMessage: "Login Failed",
    });
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
