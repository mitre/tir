/* eslint-disable no-use-before-define */
import {
  Model,
  DataTypes,
  type InferAttributes,
  type BelongsToManyAddAssociationMixin,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";
import { NessusPlugin, System } from "~/db/models";

//   const cvss3VectorMappings: { [key: string]: keyof Cve } = {
//     CVSS: "cvss3Version",
//     AV: "cvss3AttackVector",
//     AC: "cvss3AttackComplexity",
//     PR: "cvss3PrivilegesRequired",
//     UI: "cvss3UserInteraction",
//     S: "cvss3Scope",
//     C: "cvss3ConfidentialityImpact",
//     I: "cvss3IntegrityImpact",
//     A: "cvss3AvailabilityImpact",
//   };

enum cvss3AttackComplexity {
  L = "LOW",
  H = "HIGH",
}

enum cvss3AttackVector {
  N = "NETWORK",
  A = "ADJACENT_NETWORK",
  L = "LOCAL",
  P = "PHYSICAL",
}
enum cvss3AvailabilityImpact {
  N = "NONE",
  L = "LOW",
  H = "HIGH",
}
enum cvss3ConfidentialityImpact {
  N = "NONE",
  L = "LOW",
  H = "HIGH",
}
enum cvss3IntegrityImpact {
  N = "NONE",
  L = "LOW",
  H = "HIGH",
}
enum cvss3PrivilegesRequired {
  N = "NONE",
  L = "LOW",
  H = "HIGH",
}

enum cvss3Scope {
  U = "UNCHANGED",
  C = "CHANGED",
}

enum cvss3UserInteraction {
  N = "NONE",
  R = "REQUIRED",
}

const cvss3VectorMappings: { [key: string]: { property: keyof Cve; enumType?: any } } = {
  CVSS: { property: "cvss3Version" },
  AV: { property: "cvss3AttackVector", enumType: cvss3AttackVector },
  AC: { property: "cvss3AttackComplexity", enumType: cvss3AttackComplexity },
  PR: { property: "cvss3PrivilegesRequired", enumType: cvss3PrivilegesRequired },
  UI: { property: "cvss3UserInteraction", enumType: cvss3UserInteraction },
  S: { property: "cvss3Scope", enumType: cvss3Scope },
  C: { property: "cvss3ConfidentialityImpact", enumType: cvss3ConfidentialityImpact },
  I: { property: "cvss3IntegrityImpact", enumType: cvss3IntegrityImpact },
  A: { property: "cvss3AvailabilityImpact", enumType: cvss3AvailabilityImpact },
};

export class Cve extends Model<InferAttributes<Cve>, InferCreationAttributes<Cve>> {
  declare id: CreationOptional<number>;
  declare cveId: string;
  declare cvss3AttackComplexity: string;
  declare cvss3AttackVector: string;
  declare cvss3AvailabilityImpact: string;
  declare cvss3ConfidentialityImpact: string;
  declare cvss3IntegrityImpact: string;
  declare cvss3PrivilegesRequired: string;
  declare cvss3Scope: string;
  declare cvss3UserInteraction: string;
  declare cvss3Version: string;

  declare lastUpdate: CreationOptional<string>;
  declare creationDate: CreationOptional<string>;

  declare addSystem: BelongsToManyAddAssociationMixin<System, number>;
  declare addNessusPlugin: BelongsToManyAddAssociationMixin<NessusPlugin, number>;

  // updateByCvss3Vector(cvss3String: string) {
  //   const cvss3VectorParts = cvss3String.split("/");
  //   for (const part of cvss3VectorParts) {
  //     const [key, value] = part.split(":");
  //     if (cvss3VectorMappings[key]) {
  //       (this as any)[cvss3VectorMappings[key]] = value;
  //     }
  //   }
  // }
  updateByCvss3Vector(cvss3String: string) {
    const cvss3VectorParts = cvss3String.split("/");

    for (const part of cvss3VectorParts) {
      const [key, value] = part.split(":");

      if (cvss3VectorMappings[key]) {
        const { property, enumType } = cvss3VectorMappings[key];

        // If an enumType is defined, use it to map the value, otherwise use the value directly
        if (enumType) {
          (this as any)[property] = enumType[value as keyof typeof enumType];
        } else {
          (this as any)[property] = value;
        }
      }
    }
  }
}

Cve.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    cveId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cvss3AttackComplexity: {
      type: DataTypes.ENUM,
      values: Object.values(cvss3AttackComplexity),
    },
    cvss3AttackVector: {
      type: DataTypes.ENUM,
      values: Object.values(cvss3AttackVector),
    },
    cvss3AvailabilityImpact: {
      type: DataTypes.ENUM,
      values: Object.values(cvss3AvailabilityImpact),
    },
    cvss3ConfidentialityImpact: {
      type: DataTypes.ENUM,
      values: Object.values(cvss3ConfidentialityImpact),
    },
    cvss3IntegrityImpact: {
      type: DataTypes.ENUM,
      values: Object.values(cvss3IntegrityImpact),
    },
    cvss3PrivilegesRequired: {
      type: DataTypes.ENUM,
      values: Object.values(cvss3PrivilegesRequired),
    },
    cvss3Scope: {
      type: DataTypes.ENUM,
      values: Object.values(cvss3Scope),
    },
    cvss3UserInteraction: {
      type: DataTypes.ENUM,
      values: Object.values(cvss3UserInteraction),
    },
    cvss3Version: {
      type: DataTypes.STRING,
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
    modelName: "Cve",
    timestamps: false,
  },
);
