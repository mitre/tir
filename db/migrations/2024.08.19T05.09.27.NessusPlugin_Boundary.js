import { DataTypes } from "sequelize";

export const up = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable("NessusPlugin_Boundaries", {
    NessusPluginId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "NessusPlugins",
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
    EvaluationItemId: {
      type: DataTypes.INTEGER,
      references: {
        model: "EvaluationItems",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  });
};
export const down = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable("NessusPlugin_Boundaries");
};
