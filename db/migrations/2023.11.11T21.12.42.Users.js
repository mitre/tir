import { DataTypes } from "sequelize";

export const up = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable("Users", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    UserRoleId: {
      type: DataTypes.INTEGER,
      references: {
        model: "UserRoles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    lastUpdate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });
};
export const down = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable("Users");
};
