import jwt from "jsonwebtoken";
import { User, UserRole, Theme } from "../../../db/models";

// import TokenExpiredError from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const rawToken = getCookie(event, "tirtoken");
  const config = useRuntimeConfig();

  if (rawToken) {
    try {
      const decodedToken = jwt.verify(rawToken, config.jwt_key) as { [key: string]: any };

      const user = await User.findByPk(decodedToken.userId, {
        attributes: ["id", "firstName", "lastName", "email", "TimezoneId", "ThemeId"],
        include: [
          {
            model: UserRole,
            attributes: ["id", "name"],
          },
          {
            model: Theme,
            attributes: ["id", "name"],
          },
        ],
      });
      return user;
    } catch (error) {
      if (error?.name === "TokenExpiredError") {
        return {
          statusCode: 401,
          body: {
            message: "Unathorized Access - Expired",
          },
        };
      } else {
        return {
          statusCode: 401,
          body: {
            message: "Unathorized Access",
          },
        };
      }
    }
  } else {
    return {
      statusCode: 401,
      body: {
        message: "Unathorized Access - No Token",
      },
    };
  }
});
