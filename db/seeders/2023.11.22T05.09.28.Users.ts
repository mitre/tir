import * as dotenv from "dotenv";
import { hash } from "bcryptjs";
import { DateTime } from "luxon";
import type { Seeder } from "../umzug";

dotenv.config();

const now = DateTime.now().toISO();

const users = [
  {
    id: 1,
    firstName: "Tir",
    lastName: "Admin",
    email: "admin@tir.local",
    password: "",
    UserRoleId: 1,
    creationDate: now,
    lastUpdate: now,
  },
];

export const up: Seeder = async ({ context: sequelize }) => {
  if (!process.env.INIT_PASSWORD) {
    throw new Error("INIT_PASSWORD environment variable not set.");
  }

  const initialPassword = await hash(process.env.INIT_PASSWORD, 10);

  users[0].password = initialPassword;

  await sequelize.getQueryInterface().bulkInsert("Users", users);
};

export const down: Seeder = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().bulkDelete("Users", { id: users.map((s) => s.id) });
};
