/* eslint-disable camelcase */
import {
  type BelongsToManyAddAssociationMixin,
  type BelongsToManyRemoveAssociationMixin,
  type BelongsToManyHasAssociationMixin,
} from "sequelize";

import { User } from "./user";
import { Timezone } from "./timezone";
import { Boundary } from "./boundary";
import { System } from "./system";
import { Tier } from "./tier";
import { UserRole } from "./userRole";
import { BoundaryRole } from "./boundaryRole";
import { TierRole } from "./tierRole";
import { Stig } from "./stig";
import { StigData } from "./stigData";
import { StigLibrary } from "./stigLibrary";
import { Assessment } from "./assessment";
import { AssessmentItem } from "./assessmentItem";
import { Evaluation } from "./evaluation";
import { EvaluationItem } from "./evaluationItem";
import { StigResponsibility } from "./stigResponsibility";
import { Milestone } from "./milestone";
import { Override } from "./override";
import { StigReference } from "./stigReference";
import { Theme } from "./theme";
import { Token } from "./token";
import { CciList } from "./cciList";
import { CciItem } from "./cciItem";
import { CciReference } from "./cciReferences";
import { PolicyDocument } from "./policyDocument";
import { StigIdent } from "./stigIdent";
import { Classification } from "./classification";
import { StigAlias } from "./stigAlias";
import { TirAlias } from "./tirAlias";

Boundary.belongsTo(User, {
  as: "owner",
  onDelete: "SET NULL",
});

User.belongsTo(UserRole);
UserRole.hasOne(User);

User.belongsTo(Timezone);
Timezone.hasOne(User);

Tier.belongsTo(User, {
  as: "owner",
  foreignKey: { allowNull: true },
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

Tier.belongsTo(Tier, {
  as: "parent",
  foreignKey: "parentId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Boundary.belongsTo(Tier, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Tier.hasMany(Boundary);

export const Boundary_User = sequelize.define("Boundary_User", {}, { timestamps: false });
User.belongsToMany(Boundary, { through: Boundary_User });
Boundary.belongsToMany(User, { through: Boundary_User });
Boundary.hasMany(Boundary_User);
User.hasMany(Boundary_User);
BoundaryRole.hasOne(Boundary_User);
Boundary_User.belongsTo(BoundaryRole);
Boundary_User.belongsTo(User);

export interface BoundaryInterface extends Boundary {
  addUser: BelongsToManyAddAssociationMixin<User, number>;
  removeUser: BelongsToManyRemoveAssociationMixin<User, number>;
}

export interface TierInterface extends Tier {
  addUser: BelongsToManyAddAssociationMixin<User, number>;
  removeUser: BelongsToManyRemoveAssociationMixin<User, number>;
}

export const Tier_User = sequelize.define("Tier_User", {}, { timestamps: false });
User.belongsToMany(Tier, { through: Tier_User });
Tier.belongsToMany(User, { through: Tier_User });
Tier.hasMany(Tier_User);
TierRole.hasOne(Tier_User);
Tier_User.belongsTo(TierRole);
Tier_User.belongsTo(User);

export const EvalDates_User = sequelize.define("EvalDates_User", {}, { timestamps: false });
EvaluationItem.belongsToMany(User, { through: EvalDates_User });
User.belongsToMany(EvaluationItem, { through: EvalDates_User });

export const MilestoneDates_User = sequelize.define(
  "MilestoneDates_User",
  {},
  { timestamps: false },
);
Milestone.belongsToMany(User, { through: MilestoneDates_User });
User.belongsToMany(Milestone, { through: MilestoneDates_User });

const Stig_StigData = sequelize.define("Stig_StigData", {}, { timestamps: false });
StigData.belongsToMany(Stig, { through: Stig_StigData });
Stig.belongsToMany(StigData, { through: Stig_StigData });

Boundary.belongsTo(StigLibrary, { onDelete: "RESTRICT", onUpdate: "CASCADE" });

System.belongsTo(Boundary, { onDelete: "CASCADE", onUpdate: "CASCADE" });
Boundary.hasMany(System, { onDelete: "CASCADE", onUpdate: "CASCADE" });

const Stig_System = sequelize.define("Stig_System", {}, { timestamps: false });
Stig.belongsToMany(System, { through: Stig_System });
System.belongsToMany(Stig, { through: Stig_System });

export interface SystemInterface extends System {
  addStig: BelongsToManyAddAssociationMixin<Stig, number>;
  removeStig: BelongsToManyRemoveAssociationMixin<Stig, number>;
  hasStig: BelongsToManyHasAssociationMixin<Stig, number>;
}

export interface SystemWithStigs extends System {
  Stigs: Stig[];
}

const StigData_StigResponsibility = sequelize.define(
  "StigData_StigResponsibility",
  {},
  { timestamps: false },
);
StigResponsibility.belongsToMany(StigData, { through: StigData_StigResponsibility });
StigData.belongsToMany(StigResponsibility, { through: StigData_StigResponsibility });

const StigLibrary_Stig = sequelize.define("StigLibrary_Stig", {}, { timestamps: false });
Stig.belongsToMany(StigLibrary, { through: StigLibrary_Stig });
StigLibrary.belongsToMany(Stig, { through: StigLibrary_Stig });

// export interface StigLibraryInterface extends StigLibrary {
//   addStig: BelongsToManyAddAssociationMixin<Stig, number>;
//   removeStig: BelongsToManyRemoveAssociationMixin<Stig, number>;
//   getStigs: () => Promise<Stig[]>;
// }

// export interface StigInterface extends Stig {
//   addStigData: BelongsToManyAddAssociationMixin<StigData, number>;
//   removeStigData: BelongsToManyRemoveAssociationMixin<StigData, number>;
//   getStigDatum: () => Promise<StigData[]>;
// }

export interface StigLibraryWithStigs extends StigLibrary {
  Stigs: Stig[];
}

const StigData_StigReference = sequelize.define(
  "StigData_StigReference",
  {},
  { timestamps: false },
);
StigReference.belongsToMany(StigData, { through: StigData_StigReference });
StigData.belongsToMany(StigReference, { through: StigData_StigReference });

AssessmentItem.belongsTo(Assessment, {
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Assessment.hasMany(AssessmentItem, {
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
AssessmentItem.belongsTo(StigData, {
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
StigData.hasMany(AssessmentItem, { onDelete: "RESTRICT", onUpdate: "CASCADE" });

Assessment.belongsTo(System, { onDelete: "CASCADE", onUpdate: "CASCADE" });
System.hasMany(Assessment, { onDelete: "CASCADE", onUpdate: "CASCADE" });
Assessment.belongsTo(Stig, { onDelete: "RESTRICT", onUpdate: "CASCADE" });
Stig.hasMany(Assessment, { onDelete: "RESTRICT", onUpdate: "CASCADE" });

EvaluationItem.belongsTo(Evaluation, {
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Evaluation.hasMany(EvaluationItem, {
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
EvaluationItem.belongsTo(StigData, {
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
StigData.hasMany(EvaluationItem, { onDelete: "RESTRICT", onUpdate: "CASCADE" });

export const EvaluationItem_Milestone = sequelize.define(
  "EvaluationItem_Milestone",
  {},
  { timestamps: false },
);
EvaluationItem.belongsToMany(Milestone, { through: EvaluationItem_Milestone });
Milestone.belongsToMany(EvaluationItem, { through: EvaluationItem_Milestone });

EvaluationItem.hasMany(Milestone, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export interface MilestoneInterface extends Milestone {
  addEvaluationItem: BelongsToManyAddAssociationMixin<EvaluationItem, number>;
  removeEvaluationItem: BelongsToManyRemoveAssociationMixin<EvaluationItem, number>;
}

Evaluation.belongsTo(Boundary, { onDelete: "CASCADE", onUpdate: "CASCADE" });
Boundary.hasMany(Evaluation, { onDelete: "CASCADE", onUpdate: "CASCADE" });
Evaluation.belongsTo(Stig, { onDelete: "RESTRICT", onUpdate: "CASCADE" });
Stig.hasMany(Evaluation, { onDelete: "RESTRICT", onUpdate: "CASCADE" });

Override.belongsTo(System, { onDelete: "CASCADE", onUpdate: "CASCADE" });
System.hasMany(Override, { onDelete: "NO ACTION", onUpdate: "CASCADE" });
Override.belongsTo(StigData, { onDelete: "CASCADE", onUpdate: "CASCADE" });
StigData.hasMany(Override, { onDelete: "NO ACTION", onUpdate: "CASCADE" });

User.belongsTo(Theme, { onDelete: "SET NULL", onUpdate: "CASCADE" });
Theme.hasOne(User, { onDelete: "NO ACTION", onUpdate: "CASCADE" });

Token.belongsTo(User, { onDelete: "CASCADE", onUpdate: "CASCADE" });
User.hasMany(Token, { onDelete: "NO ACTION", onUpdate: "CASCADE" });

CciItem.belongsTo(CciList, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
CciList.hasMany(CciItem, {
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export const CciItem_CciReference = sequelize.define(
  "CciItem_CciReference",
  {},
  { timestamps: false },
);

CciItem.belongsToMany(CciReference, { through: CciItem_CciReference });
CciReference.belongsToMany(CciItem, { through: CciItem_CciReference });

PolicyDocument.hasMany(CciReference, {
  foreignKey: { allowNull: false },
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
CciReference.belongsTo(PolicyDocument, {
  foreignKey: { allowNull: false },
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

PolicyDocument.hasOne(Boundary, {
  foreignKey: { allowNull: true, defaultValue: 2 },
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
Boundary.belongsTo(PolicyDocument, {
  foreignKey: { allowNull: true, defaultValue: 2 },
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

export const StigData_StigIdent = sequelize.define("StigData_StigIdent", {}, { timestamps: false });
StigData.belongsToMany(StigIdent, { through: StigData_StigIdent });
StigIdent.belongsToMany(StigData, { through: StigData_StigIdent });

// export interface StigDataInterface extends StigData {
//   addStigResponsibility: BelongsToManyAddAssociationMixin<StigResponsibility, number>;
//   removeStigResponsibility: BelongsToManyRemoveAssociationMixin<StigResponsibility, number>;
//   getStigResponsibility: () => Promise<StigResponsibility[]>;
//   addStigReference: BelongsToManyAddAssociationMixin<StigReference, number>;
//   removeStigReference: BelongsToManyRemoveAssociationMixin<StigReference, number>;
//   getStigReference: () => Promise<StigReference[]>;
//   addStigIdent: BelongsToManyAddAssociationMixin<StigIdent, number>;
//   removeStigIdent: BelongsToManyRemoveAssociationMixin<StigIdent, number>;
// }

Classification.hasOne(Boundary, { onDelete: "RESTRICT", onUpdate: "CASCADE" });
Boundary.belongsTo(Classification, { onDelete: "RESTRICT", onUpdate: "CASCADE" });

Assessment.belongsTo(Assessment, {
  as: "previousAssessment",
  foreignKey: { name: "succeededByAssessmentId", allowNull: true },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export {
  User,
  Boundary,
  System,
  Tier,
  UserRole,
  BoundaryRole,
  TierRole,
  Stig,
  StigData,
  StigResponsibility,
  StigLibrary,
  Assessment,
  AssessmentItem,
  Evaluation,
  EvaluationItem,
  Milestone,
  Timezone,
  Override,
  StigReference,
  Theme,
  Token,
  CciList,
  CciItem,
  CciReference,
  PolicyDocument,
  StigIdent,
  Classification,
  StigAlias,
  TirAlias,
};
