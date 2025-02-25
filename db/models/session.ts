/* eslint-disable no-use-before-define */
// server/db/models/Session.ts
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
  Association,
} from "sequelize";
import { User } from "./user";

export class Session extends Model<InferAttributes<Session>, InferCreationAttributes<Session>> {
  declare id: string;
  declare expiresAt: string; // ISO date string
  declare authMethod: string;
  declare ipAddress?: string;
  declare userAgent?: string;
  declare loginTime?: string; // ISO date string

  declare UserId: ForeignKey<User["id"]>;

  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare static associations: {
    UserId: Association<Session, User>;
  };
}

Session.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    expiresAt: {
      type: DataTypes.STRING, // Store as ISO string
      allowNull: false,
    },
    authMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    loginTime: {
      type: DataTypes.STRING, // Store as ISO string
      allowNull: true,
    },
    lastUpdate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Session",
    timestamps: false,
  },
);
