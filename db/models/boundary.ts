/* eslint-disable no-use-before-define */
import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional,
  NonAttribute,
  Association,
  ForeignKey,
} from "sequelize";
import { System } from "./system";
import { StigLibrary } from "./stigLibrary";
import { PolicyDocument } from "./policyDocument";
import { User } from "./user";
import { Classification } from "./classification";
import { Tier } from "./tier";

export class Boundary extends Model<InferAttributes<Boundary>, InferCreationAttributes<Boundary>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare caveats: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare StigLibraryId: ForeignKey<StigLibrary["id"]>;
  declare PolicyDocumentId: ForeignKey<PolicyDocument["id"]>;
  declare ClassificationId: ForeignKey<Classification["id"]>;
  declare TierId: ForeignKey<Tier["id"]>;
  declare ownerId: ForeignKey<User["id"]>;

  declare Systems?: NonAttribute<System[]>;
  declare StigLibrary?: NonAttribute<StigLibrary>;

  declare static associations: {
    Systems: Association<Boundary, System>;
    StigLibrary: Association<Boundary, StigLibrary>;
    ownerId: Association<Boundary, User>;
    ClassificationId: Association<Boundary, Classification>;
    TierId: Association<Boundary, Tier>;
  };
}

Boundary.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      unique: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    caveats: {
      type: DataTypes.STRING(50),
      allowNull: true,
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
    modelName: "Boundary",
    timestamps: false,
  },
);
