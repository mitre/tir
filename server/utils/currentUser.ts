import jwt from "jsonwebtoken";

export function decodeToken(token: string): number {
  const config = useRuntimeConfig();
  const decodedToken = jwt.verify(token, config.jwt_key) as { [key: string]: any };

  const userId = decodedToken.userId;
  // isNaN(userId) ? undefined : userId,

  return userId;
}
