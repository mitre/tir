import * as dotenv from "dotenv";
import { DateTime } from "luxon";
import type { Seeder } from "../umzug";
import { generateSalt, hashPassword } from "../../server/utils/hash";

dotenv.config();

const now = DateTime.now().toISO();
if (!process.env.INIT_PASSWORD) {
  throw new Error("INIT_PASSWORD environment variable not set.");
}
if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY environment variable not set.");
}
const userSalt = generateSalt();
const adminSalt = generateSalt();

const userPassword = hashPassword(process.env.INIT_PASSWORD, userSalt, process.env.SECRET_KEY);
const adminPassword = hashPassword(process.env.INIT_PASSWORD, adminSalt, process.env.SECRET_KEY);

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

export const up: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkInsert("Users", users);
};

export const down: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkDelete("Users", { id: users.map((s) => s.id) });
};
