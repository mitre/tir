/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  Association,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type ForeignKey,
  type NonAttribute,
  type BelongsToManyAddAssociationMixin,
  type BelongsToManyRemoveAssociationMixin,
} from "sequelize";

import { Boundary } from "./boundary";
import { Stig } from "./stig";
import type { Assessment } from ".";

export class System extends Model<InferAttributes<System>, InferCreationAttributes<System>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare hostname: string;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare BoundaryId: ForeignKey<Boundary["id"]>;
  declare Stigs?: NonAttribute<Stig[]>;
  declare Boundary?: NonAttribute<Boundary>;
  declare Assessments?: NonAttribute<Assessment[]>;

  declare addStig: BelongsToManyAddAssociationMixin<Stig, number>;
  declare removeStig: BelongsToManyRemoveAssociationMixin<Stig, number>;

  declare static associations: {
    BoundaryId: Association<System, Boundary>;
    Boundary: Association<System, Boundary>;
    Stigs: Association<System, Stig>;
    Assessments: Association<System, Assessment>;
  };
}

System.init(
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
      allowNull: false,
    },
    hostname: DataTypes.STRING,
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
    modelName: "System",
    timestamps: false,
  },
);
