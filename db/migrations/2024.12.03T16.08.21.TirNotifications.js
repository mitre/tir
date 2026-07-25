import { DataTypes } from "sequelize";

export const up = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable("NotificationCategories", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      unique: true,
      autoIncrement: true,
    },
    category: {
      type: DataTypes.TEXT,
      allowNull: false,
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
      type: DataTypes.TEXT,
      allowNull: false,
    },

    dueDate: {
      type: DataTypes.TEXT,
    },
    daysLeft: {
      type: DataTypes.INTEGER,
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

export const down = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable("TirNotifications_Users");
  await sequelize.getQueryInterface().dropTable("TirNotifications");
  await sequelize.getQueryInterface().dropTable("NotificationCategories");
};
