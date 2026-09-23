import { DataTypes } from "sequelize";
import { sequelize } from "../umzug.js";

export const up = async () => {
  const transaction = await sequelize.transaction();
  const queryInterface = sequelize.getQueryInterface();

  try {
    await queryInterface.createTable(
      "User_FavoriteTiers",
      {
        UserId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: "Users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        TierId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: "Tiers",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
      },
      { transaction },
    );

    await queryInterface.createTable(
      "User_FavoriteBoundaries",
      {
        UserId: {
          type: DataTypes.INTEGER,
          allowNull: false,
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
          allowNull: false,
          primaryKey: true,
          references: {
            model: "Boundaries",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
      },
      { transaction },
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const down = async () => {
  const transaction = await sequelize.transaction();
  const queryInterface = sequelize.getQueryInterface();

  try {
    await queryInterface.dropTable("User_FavoriteBoundaries", {
      transaction,
    });

    await queryInterface.dropTable("User_FavoriteTiers", {
      transaction,
    });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};