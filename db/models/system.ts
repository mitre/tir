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

import { Boundary } from "~/db/models/boundary";
import { Stig } from "~/db/models/stig";
import type { Assessment } from "~/db/models/assessment";
import { SystemRoles } from "~/types/system";
import type { StigOverride } from "~/db/models/stigOverride";

export class System extends Model<InferAttributes<System>, InferCreationAttributes<System>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare role: SystemRoles;
  declare assetType: string;
  declare marking: string;
  declare hostName: string;
  declare hostIP: string;
  declare hostMAC: string;
  declare hostGUID: string;
  declare hostFQDN: string;
  declare targetComment: string;
  declare techArea: string;
  declare targetKey: string;
  declare stigGUID: string;
  declare webOrDatabase: boolean;
  declare webDBSite: string;
  declare webDBInstance: string;

  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare BoundaryId: ForeignKey<Boundary["id"]>;
  declare Stigs?: NonAttribute<Stig[]>;
  declare Boundary?: NonAttribute<Boundary>;
  declare Assessments?: NonAttribute<Assessment[]>;
  declare StigOverrides?: NonAttribute<StigOverride[]>;

  declare addStig: BelongsToManyAddAssociationMixin<Stig, number>;
  declare removeStig: BelongsToManyRemoveAssociationMixin<Stig, number>;

  declare static associations: {
    BoundaryId: Association<System, Boundary>;
    Boundary: Association<System, Boundary>;
    Stigs: Association<System, Stig>;
    Assessments: Association<System, Assessment>;
    StigOverrides?: Association<System, StigOverride>;
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
      type: DataTypes.TEXT,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM,
      values: Object.values(SystemRoles),
      allowNull: false,
      defaultValue: "None",
    },
    assetType: {
      type: DataTypes.ENUM,
      values: ["Computing", "Non-Computing"],
      allowNull: false,
      defaultValue: "Computing",
    },
    marking: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hostName: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    hostIP: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    hostMAC: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    hostGUID: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hostFQDN: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    targetComment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    techArea: {
      type: DataTypes.ENUM,
      values: [
        "",
        "Application Review",
        "Boundary Security",
        "CDS Admin Review",
        "CDS Technical Review",
        "Database Review",
        "Domain Name System (DNS)",
        "Exchange Server",
        "Host Based System Security (HBSS)",
        "Internal Network",
        "Mobility",
        "Releasable Networks (REL)",
        "Releaseable Networks (REL)",
        "Traditional Security",
        "UNIX OS",
        "VVOIP Review",
        "Web Review",
        "Windows OS",
        "Other Review",
      ],
      allowNull: false,
      defaultValue: "",
    },
    targetKey: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    stigGUID: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    webOrDatabase: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    webDBSite: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    webDBInstance: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
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
    modelName: "System",
    timestamps: false,
  },
);
