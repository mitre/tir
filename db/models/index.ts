/* eslint-disable camelcase */
import {
  type BelongsToManyAddAssociationMixin,
  type BelongsToManyRemoveAssociationMixin,
  type BelongsToManyHasAssociationMixin,
} from "sequelize";

import { DataTypes } from "sequelize";
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
import { Protocol } from "./protocols";
import { NessusPluginFamily } from "./nessusPluginFamily";
import { NessusServiceName } from "./nessusServiceName";
import { NessusPlugin } from "./nessusPlugin";
import { NessusReport } from "./nessusReport";
import { NessusReportItem } from "./nessusReportItem";
import { Cve } from "./cve";
import { CveOverride } from "./cveOverride";
import { NessusOverride } from "./nessusOverride";
import { TirNotification } from "./tirNotifications";
import { NotificationCategory } from "./notificationCategory";
import { StigOverride } from "./stigOverride";
import { Session } from "./session";

User.belongsTo(UserRole);
UserRole.hasOne(User);

User.belongsTo(Timezone);
Timezone.hasOne(User);

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

export const Stig_StigData = sequelize.define("Stig_StigData", {}, { timestamps: false });
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

EvaluationItem.hasMany(Milestone, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Milestone.belongsTo(EvaluationItem, {
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

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

Classification.hasOne(Boundary, { onDelete: "RESTRICT", onUpdate: "CASCADE" });
Boundary.belongsTo(Classification, { onDelete: "RESTRICT", onUpdate: "CASCADE" });

Assessment.belongsTo(Assessment, {
  as: "previousAssessment",
  foreignKey: { name: "succeededByAssessmentId", allowNull: true },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Protocol.hasOne(NessusReportItem, { onDelete: "RESTRICT", onUpdate: "CASCADE" });
NessusServiceName.hasOne(NessusReportItem, { onDelete: "RESTRICT", onUpdate: "CASCADE" });

System.hasOne(NessusReport, { onDelete: "CASCADE", onUpdate: "CASCADE" });
NessusReport.belongsTo(System, { onDelete: "CASCADE", onUpdate: "CASCADE" });

NessusReport.hasMany(NessusReportItem, { onDelete: "CASCADE", onUpdate: "CASCADE" });
NessusReportItem.belongsTo(NessusReport, { onDelete: "CASCADE", onUpdate: "CASCADE" });

NessusPlugin.hasMany(NessusReportItem, { onDelete: "CASCADE", onUpdate: "CASCADE" });
NessusReportItem.belongsTo(NessusPlugin, { onDelete: "CASCADE", onUpdate: "CASCADE" });

NessusPluginFamily.hasOne(NessusPlugin, { onDelete: "CASCADE", onUpdate: "CASCADE" });
NessusPlugin.belongsTo(NessusPluginFamily, { onDelete: "CASCADE", onUpdate: "CASCADE" });

export const Cve_NessusPlugin = sequelize.define("Cve_NessusPlugin", {}, { timestamps: false });
NessusPlugin.belongsToMany(Cve, { through: Cve_NessusPlugin });
Cve.belongsToMany(NessusPlugin, { through: Cve_NessusPlugin });

export const Cve_System = sequelize.define("Cve_System", {}, { timestamps: false });
System.belongsToMany(Cve, { through: Cve_System });
Cve.belongsToMany(System, { through: Cve_System });

EvaluationItem.hasMany(NessusReportItem, { onDelete: "SET NULL", onUpdate: "CASCADE" });
NessusReportItem.belongsTo(EvaluationItem, { onDelete: "SET NULL", onUpdate: "CASCADE" });

CveOverride.belongsTo(System, { onDelete: "CASCADE", onUpdate: "CASCADE" });
System.hasMany(CveOverride, { onDelete: "NO ACTION", onUpdate: "CASCADE" });
CveOverride.belongsTo(Cve, { onDelete: "CASCADE", onUpdate: "CASCADE" });
Cve.hasMany(CveOverride, { onDelete: "NO ACTION", onUpdate: "CASCADE" });

NessusOverride.belongsTo(System, { onDelete: "CASCADE", onUpdate: "CASCADE" });
System.hasMany(NessusOverride, { onDelete: "NO ACTION", onUpdate: "CASCADE" });
NessusOverride.belongsTo(NessusPlugin, { onDelete: "CASCADE", onUpdate: "CASCADE" });
NessusPlugin.hasMany(NessusOverride, { onDelete: "NO ACTION", onUpdate: "CASCADE" });

export const NessusPlugin_Boundary = sequelize.define(
  "NessusPlugin_Boundary",
  {},
  { timestamps: false },
);
Boundary.belongsToMany(NessusPlugin, { through: NessusPlugin_Boundary });
NessusPlugin.belongsToMany(Boundary, { through: NessusPlugin_Boundary });
NessusPlugin.hasMany(NessusPlugin_Boundary);
Boundary.hasMany(NessusPlugin_Boundary);
EvaluationItem.hasOne(NessusPlugin_Boundary);
NessusPlugin_Boundary.belongsTo(EvaluationItem);
NessusPlugin_Boundary.belongsTo(Boundary);

export const TirNotifications_User = sequelize.define(
  "TirNotifications_User",
  {
    read: {
      type: DataTypes.BOOLEAN,
    },
  },
  { timestamps: false },
);
TirNotification.belongsToMany(User, {
  through: TirNotifications_User,
});
User.belongsToMany(TirNotification, {
  through: TirNotifications_User,
});

TirNotification.hasMany(TirNotifications_User);
User.hasMany(TirNotifications_User);
TirNotification.belongsTo(NotificationCategory);
NotificationCategory.hasOne(TirNotification);

StigOverride.belongsTo(System, { onDelete: "CASCADE", onUpdate: "CASCADE" });
System.hasMany(StigOverride, { onDelete: "NO ACTION", onUpdate: "CASCADE" });
StigOverride.belongsTo(StigData, { onDelete: "CASCADE", onUpdate: "CASCADE" });
StigData.hasMany(StigOverride, { onDelete: "NO ACTION", onUpdate: "CASCADE" });

Session.belongsTo(User, { onUpdate: "CASCADE", onDelete: "CASCADE" });
User.hasMany(Session, { onUpdate: "CASCADE", onDelete: "CASCADE" });

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
  Protocol,
  TirNotification,
  NotificationCategory,
};
