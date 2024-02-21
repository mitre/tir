/* eslint-disable no-use-before-define */
import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional,
  NonAttribute,
  Association,
} from "sequelize";
import type { StigData } from ".";

export class Stig extends Model<InferAttributes<Stig>, InferCreationAttributes<Stig>> {
  declare id: CreationOptional<number>;
  declare dc: string;
  declare xsi: string;
  declare cpe: string;
  declare xhtml: string;
  declare dsig: string;
  declare schemaLocation: string;
  declare stigid: string;
  declare lang: string;
  declare xmlns: string;
  declare status: string;
  declare status__date: string;
  declare title: string;
  declare description: string;
  declare notice__id: string;
  declare notice__lang: string;
  declare front_matter: string;
  declare rear_matter: string;
  declare reference__href: string;
  declare reference__publisher: string;
  declare reference__source: string;
  declare plain_text__release_info: string;
  declare plain_text__generator: string;
  declare plain_text__conventionsVersion: string;
  declare version: string;
  declare stigRelease: number;
  declare stigDate: string;
  declare filename: string;
  declare MAC1C: boolean;
  declare MAC1P: boolean;
  declare MAC1S: boolean;
  declare MAC2C: boolean;
  declare MAC2P: boolean;
  declare MAC2S: boolean;
  declare MAC3C: boolean;
  declare MAC3P: boolean;
  declare MAC3S: boolean;
  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare StigData?: NonAttribute<StigData[]>;

  declare static associations: {
    StigData: Association<Stig, StigData>;
  };
}

Stig.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    dc: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    xsi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cpe: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    xhtml: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dsig: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    schemaLocation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stigid: {
      // Same as Benchmark.id in XML
      type: DataTypes.STRING,
      allowNull: false,
    },
    lang: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    xmlns: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status__date: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(2000),
      allowNull: true,
    },
    notice__id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notice__lang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    front_matter: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rear_matter: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reference__href: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reference__publisher: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reference__source: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plain_text__release_info: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plain_text__generator: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plain_text__conventionsVersion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stigRelease: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    stigDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    MAC1C: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    MAC1P: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    MAC1S: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    MAC2C: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    MAC2P: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    MAC2S: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    MAC3C: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    MAC3P: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    MAC3S: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    modelName: "Stig",
    timestamps: false,
  },
);
