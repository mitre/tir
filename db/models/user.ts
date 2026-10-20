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
  type BelongsToManyAddAssociationMixin,
  type BelongsToManyRemoveAssociationMixin,
} from "sequelize";
import type { Boundary, EvaluationItem, Milestone, Theme, Tier, Timezone, UserRole } from ".";

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
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;
  declare UserRoleId: ForeignKey<UserRole["id"]>;
  declare TimezoneId: ForeignKey<Timezone["id"]>;
  declare ThemeId: ForeignKey<Theme["id"]>;
  declare Boundaries?: NonAttribute<Boundary[]>;
  declare EvaluationItems?: NonAttribute<EvaluationItem[]>;
  declare Milestones?: NonAttribute<Milestone[]>;
  declare addEvaluationItem: HasManyAddAssociationMixin<EvaluationItem, number>;
  
  declare addFavoriteTier: BelongsToManyAddAssociationMixin<Tier, number>;
  declare removeFavoriteTier: BelongsToManyRemoveAssociationMixin<Tier, number>;

  declare addFavoriteBoundary: BelongsToManyAddAssociationMixin<Boundary, number>;
  declare removeFavoriteBoundary: BelongsToManyRemoveAssociationMixin<Boundary, number>;

  declare UserRole: NonAttribute<UserRole>;

  comparePassword = (inputPassword: string): Promise<boolean> => {
    return bcrypt.compare(inputPassword, this.password);
  };

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
    organization: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    passwordChangedAt: {
      type: DataTypes.TEXT,
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
      type: DataTypes.TEXT,
      allowNull: true,
    },
    creationMethod: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "local",
    },
    salt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lastUpdate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    timestamps: false,
  },
);
