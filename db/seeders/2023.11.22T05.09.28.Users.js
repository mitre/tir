import * as dotenv from "dotenv";
import { DateTime } from "luxon";
import { generateSalt, hashPassword } from "../../server/utils/hash.js";
dotenv.config();
const now = DateTime.now().toISO();
if (!process.env.INIT_PASSWORD) {
  throw new Error("INIT_PASSWORD environment variable not set.");
}
const secretKey = process.env.SECRET_KEY || process.env.NUXT_SECRET_KEY;
if (!secretKey) {
  throw new Error("SECRET_KEY environment variable not set.");
}
const userSalt = generateSalt();
const adminSalt = generateSalt();
const userPassword = hashPassword(process.env.INIT_PASSWORD, userSalt, secretKey);
const adminPassword = hashPassword(process.env.INIT_PASSWORD, adminSalt, secretKey);
const users = [
  {
    id: 1,
    firstName: "Tir",
    lastName: "Admin",
    email: "admin@tir.local",
    password: adminPassword,
    UserRoleId: 1,
    creationDate: now,
    lastUpdate: now,
    salt: adminSalt,
  },
  {
    id: 2,
    firstName: "Tir",
    lastName: "User",
    email: "user@tir.local",
    password: userPassword,
    UserRoleId: 2,
    creationDate: now,
    lastUpdate: now,
    salt: userSalt,
  },
];
export const up = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkInsert("Users", users);

  if (sequelize.getDialect() === "postgres") {
    await sequelize.query(`
      SELECT setval(
        pg_get_serial_sequence('"Users"', 'id'),
        (SELECT MAX(id) FROM "Users")
      );
    `);
  }
};
export const down = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkDelete("Users", { id: users.map((s) => s.id) });
};
