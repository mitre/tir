import { DataTypes } from "sequelize";
export const up = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable("BoundaryRoles", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      unique: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
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
  await sequelize.getQueryInterface().createTable("Boundary_Users", {
    UserId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    BoundaryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Boundaries",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    BoundaryRoleId: {
      type: DataTypes.INTEGER,
      references: {
        model: "BoundaryRoles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  });
};
export const down = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable("BoundaryRoles");
  await sequelize.getQueryInterface().dropTable("Boundary_Users");
};
