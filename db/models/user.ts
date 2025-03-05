/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type NonAttribute,
  Association,
  type HasManyAddAssociationMixin,
  type ForeignKey,
} from "sequelize";
import type { Boundary, EvaluationItem, Milestone, Theme, Timezone, UserRole } from ".";

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: number;
  declare email: string;
  declare password: string;
  declare firstName: string;
  declare lastName: string;
  declare organization: string;
  declare passwordChangedAt: string;
  declare forcePasswordChange: boolean;
  declare loginCount: number;
  declare lastLogin: string;
  declare creationMethod: string;
  declare salt: string;
  declare providerId: CreationOptional<string>;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
  declare UserRoleId: ForeignKey<UserRole["id"]>;
  declare TimezoneId: ForeignKey<Timezone["id"]>;
  declare ThemeId: ForeignKey<Theme["id"]>;
  declare Boundaries?: NonAttribute<Boundary[]>;
  declare EvaluationItems?: NonAttribute<EvaluationItem[]>;
  declare Milestones?: NonAttribute<Milestone[]>;
  declare addEvaluationItem: HasManyAddAssociationMixin<EvaluationItem, number>;

  declare UserRole: NonAttribute<UserRole>;

  declare static associations: {
    Boundaries: Association<User, Boundary>;
    EvaluationItems: Association<User, EvaluationItem>;
    Milestones: Association<User, Milestone>;
  };
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    organization: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordChangedAt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    forcePasswordChange: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    loginCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lastLogin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    creationMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "local",
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    providerId: {
      type: DataTypes.STRING,
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
    modelName: "User",
    timestamps: false,
  },
);
