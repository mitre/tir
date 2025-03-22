export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const cookieName = "tirtoken"; //config.cookieName;
  deleteCookie(event, cookieName, {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
    secure: false, //process.env.NODE_ENV === "production",
  });
  const findCookie = getCookie(event, "current-user");
  console.log(findCookie);
  const token = getCookie(event, "tirtoken");
  console.log(token);
  deleteCookie(event, "tirtoken");

  return { error: "false" };
});
