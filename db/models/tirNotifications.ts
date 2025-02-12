/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  Association,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type IntegerDataType,
  type NonAttribute,
  type ForeignKey,
  type BelongsToManyAddAssociationMixin,
} from "sequelize";
import { User } from "./user";
import type { NotificationCategory } from "./notificationCategory";
export class TirNotification extends Model<
  InferAttributes<TirNotification>,
  InferCreationAttributes<TirNotification>
> {
  declare id: CreationOptional<number>;
  declare message: string;
  // declare read: boolean;
  declare dueDate: string;
  declare daysLeft: number;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare UserId: ForeignKey<User["id"]>;
  declare NotificationCategoryId: ForeignKey<NotificationCategory["id"]>;
  declare Users?: NonAttribute<User[]>;
  // declare read: ForeignKey<boolean>;
  declare addUser: BelongsToManyAddAssociationMixin<User, number>;
  declare static associations: {
    Users: Association<TirNotification, User>;
  };
}

TirNotification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
  },
  {
    sequelize,
    modelName: "TirNotification",
    timestamps: false,
  },
);
