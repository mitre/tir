import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
  type NonAttribute,
  Association,
  type BelongsToManyAddAssociationMixin,
  type BelongsToManyRemoveAssociationMixin,
} from "sequelize";
import type { Theme, Timezone, User, Tier, Boundary } from ".";

export class UserConfig extends Model<
  InferAttributes<UserConfig>,
  InferCreationAttributes<UserConfig>
> {
  declare id: CreationOptional<number>;
  declare UserId: ForeignKey<User["id"]>;
  declare ThemeId: ForeignKey<Theme["id"]> | null;
  declare TimezoneId: ForeignKey<Timezone["id"]> | null;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare User?: NonAttribute<User>;
  declare Theme?: NonAttribute<Theme>;
  declare Timezone?: NonAttribute<Timezone>;
  declare FavoriteTiers?: NonAttribute<Tier[]>;
  declare FavoriteBoundaries?: NonAttribute<Boundary[]>;

  declare addFavoriteTier: BelongsToManyAddAssociationMixin<Tier, number>;
  declare removeFavoriteTier: BelongsToManyRemoveAssociationMixin<Tier, number>;

  declare addFavoriteBoundary: BelongsToManyAddAssociationMixin<Boundary, number>;
  declare removeFavoriteBoundary: BelongsToManyRemoveAssociationMixin<Boundary, number>;

  declare static associations: {
    User: Association<UserConfig, User>;
    Theme: Association<UserConfig, Theme>;
    Timezone: Association<UserConfig, Timezone>;
    FavoriteTiers: Association<UserConfig, Tier>;
    FavoriteBoundaries: Association<UserConfig, Boundary>;
  };
}

UserConfig.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    ThemeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    TimezoneId: {
      type: DataTypes.INTEGER,
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
    modelName: "UserConfig",
    timestamps: false,
  },
);