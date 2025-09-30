import { DataTypes } from "sequelize";
import { sequelize, DATETIME_LENGTH } from "../umzug.js";

export const up = async () => {
  await sequelize.getQueryInterface().createTable("NotificationCategories", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      unique: true,
      autoIncrement: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastUpdate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  await sequelize.getQueryInterface().createTable("TirNotifications", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    NotificationCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "NotificationCategories",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    dueDate: {
      type: DataTypes.STRING,
    },
    daysLeft: {
      type: DataTypes.INTEGER,
    },
    lastUpdate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
  });

  await sequelize.getQueryInterface().createTable("TirNotifications_Users", {
    TirNotificationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "TirNotifications",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
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
    read: {
      type: DataTypes.BOOLEAN,
    },
  });
};

export const down = async () => {
  await sequelize.getQueryInterface().dropTable("TirNotifications_Users");
  await sequelize.getQueryInterface().dropTable("TirNotifications");
  await sequelize.getQueryInterface().dropTable("NotificationCategories");
};
