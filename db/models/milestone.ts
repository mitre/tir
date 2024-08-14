/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type NonAttribute,
  type BelongsToManyAddAssociationMixin,
  Association,
} from "sequelize";
import type { User } from ".";

export class Milestone extends Model<
  InferAttributes<Milestone>,
  InferCreationAttributes<Milestone>
> {
  declare id: CreationOptional<number>;
  declare item: string;
  declare completion_date: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
  declare Users?: NonAttribute<User[]>;

  declare addUser: BelongsToManyAddAssociationMixin<User, number>;

  declare static associations: {
    Users: Association<Milestone, User>;
  };
}

Milestone.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    item: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    completion_date: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
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
    modelName: "Milestone",
    timestamps: false,
  },
);
