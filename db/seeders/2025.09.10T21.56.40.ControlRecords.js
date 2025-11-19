import { DateTime } from "luxon";
const now = DateTime.now().toISO();

const ComplianceStatusData = [
  { id: 1, status: "Compliant", creationDate: now, lastUpdate: now },
  { id: 2, status: "Non-Compliant", creationDate: now, lastUpdate: now },
  { id: 3, status: "Not-Applicable", creationDate: now, lastUpdate: now },
  { id: 4, status: "Not Reviewed", creationDate: now, lastUpdate: now },
];

const ImplementationStatusData = [
  { id: 1, status: "Compensated", creationDate: now, lastUpdate: now },
  { id: 2, status: "Implemented", creationDate: now, lastUpdate: now },
  { id: 3, status: "Inherited", creationDate: now, lastUpdate: now },
  { id: 4, status: "Manually Inherited", creationDate: now, lastUpdate: now },
  { id: 5, status: "Not Applicable", creationDate: now, lastUpdate: now },
  { id: 6, status: "Not Implemented", creationDate: now, lastUpdate: now },
  { id: 7, status: "Planned", creationDate: now, lastUpdate: now },
];

const CommonControlProviderData = [
  { id: 1, provider: "DoD", creationDate: now, lastUpdate: now },
  { id: 2, provider: "Component", creationDate: now, lastUpdate: now },
  { id: 3, provider: "Enclave", creationDate: now, lastUpdate: now },
  { id: 4, provider: "System", creationDate: now, lastUpdate: now },
  { id: 5, provider: "OrgName/System Name", creationDate: now, lastUpdate: now },
];

const SecurityControlDesignationData = [
  { id: 1, designation: "Common", creationDate: now, lastUpdate: now },
  { id: 2, designation: "System-Specific", creationDate: now, lastUpdate: now },
  { id: 3, designation: "Hybrid", creationDate: now, lastUpdate: now },
];

const TestMethodData = [
  { id: 1, method: "Test", creationDate: now, lastUpdate: now },
  { id: 2, method: "Interview", creationDate: now, lastUpdate: now },
  { id: 3, method: "Examine", creationDate: now, lastUpdate: now },
  { id: 4, method: "Test, Interview", creationDate: now, lastUpdate: now },
  { id: 5, method: "Test, Examine", creationDate: now, lastUpdate: now },
  { id: 6, method: "Interview, Examine", creationDate: now, lastUpdate: now },
  { id: 7, method: "Test, Interview, Examine", creationDate: now, lastUpdate: now },
];

const FrequencyTypeData = [
  { id: 1, frequency: "Constantly", creationDate: now, lastUpdate: now },
  { id: 2, frequency: "Daily", creationDate: now, lastUpdate: now },
  { id: 3, frequency: "Weekly", creationDate: now, lastUpdate: now },
  { id: 4, frequency: "Monthly", creationDate: now, lastUpdate: now },
  { id: 5, frequency: "Quarterly", creationDate: now, lastUpdate: now },
  { id: 6, frequency: "Semi-annually", creationDate: now, lastUpdate: now },
  { id: 7, frequency: "Annually", creationDate: now, lastUpdate: now },
  { id: 8, frequency: "Every Two Years", creationDate: now, lastUpdate: now },
  { id: 9, frequency: "Every Three Years", creationDate: now, lastUpdate: now },
  { id: 10, frequency: "Undetermined", creationDate: now, lastUpdate: now },
];

const ConMonMethodData = [
  { id: 1, method: "Manual", creationDate: now, lastUpdate: now },
  { id: 2, method: "Semi-Automated", creationDate: now, lastUpdate: now },
  { id: 3, method: "Automated", creationDate: now, lastUpdate: now },
  { id: 4, method: "Undetermined", creationDate: now, lastUpdate: now },
];

const RiskLevelData = [
  { id: 1, level: "Very Low", creationDate: now, lastUpdate: now },
  { id: 2, level: "Low", creationDate: now, lastUpdate: now },
  { id: 3, level: "Moderate", creationDate: now, lastUpdate: now },
  { id: 4, level: "High", creationDate: now, lastUpdate: now },
  { id: 5, level: "Very High", creationDate: now, lastUpdate: now },
];

export const up = async ({ context: sequelize }) => {
  const upSeed = await sequelize.transaction();
  try {
    await sequelize
      .getQueryInterface()
      .bulkInsert("ComplianceStatuses", ComplianceStatusData, { transaction: upSeed });
    await sequelize
      .getQueryInterface()
      .bulkInsert("ImplementationStatuses", ImplementationStatusData, { transaction: upSeed });
    await sequelize
      .getQueryInterface()
      .bulkInsert("CommonControlProviders", CommonControlProviderData, { transaction: upSeed });
    await sequelize
      .getQueryInterface()
      .bulkInsert("SecurityControlDesignations", SecurityControlDesignationData, {
        transaction: upSeed,
      });
    await sequelize
      .getQueryInterface()
      .bulkInsert("TestMethods", TestMethodData, { transaction: upSeed });
    await sequelize
      .getQueryInterface()
      .bulkInsert("FrequencyTypes", FrequencyTypeData, { transaction: upSeed });
    await sequelize
      .getQueryInterface()
      .bulkInsert("ConMonMethods", ConMonMethodData, { transaction: upSeed });
    await sequelize
      .getQueryInterface()
      .bulkInsert("RiskLevels", RiskLevelData, { transaction: upSeed });
    await upSeed.commit();
  } catch (error) {
    await upSeed.rollback();
    throw error;
  }
};

export const down = async ({ context: sequelize }) => {
  const downSeed = await sequelize.transaction();
  try {
    await sequelize.getQueryInterface().bulkDelete(
      "RiskLevels",
      { id: RiskLevelData.map((s) => s.id) },
      {
        transaction: downSeed,
      },
    );
    await sequelize.getQueryInterface().bulkDelete(
      "ConMonMethods",
      { id: ConMonMethodData.map((s) => s.id) },
      {
        transaction: downSeed,
      },
    );
    await sequelize.getQueryInterface().bulkDelete(
      "FrequencyTypes",
      { id: FrequencyTypeData.map((s) => s.id) },
      {
        transaction: downSeed,
      },
    );
    await sequelize.getQueryInterface().bulkDelete(
      "TestMethods",
      { id: TestMethodData.map((s) => s.id) },
      {
        transaction: downSeed,
      },
    );
    await sequelize.getQueryInterface().bulkDelete(
      "SecurityControlDesignations",
      { id: SecurityControlDesignationData.map((s) => s.id) },
      {
        transaction: downSeed,
      },
    );
    await sequelize.getQueryInterface().bulkDelete(
      "CommonControlProviders",
      { id: CommonControlProviderData.map((s) => s.id) },
      {
        transaction: downSeed,
      },
    );
    await sequelize.getQueryInterface().bulkDelete(
      "ImplementationStatuses",
      { id: ImplementationStatusData.map((s) => s.id) },
      {
        transaction: downSeed,
      },
    );
    await sequelize.getQueryInterface().bulkDelete(
      "ComplianceStatuses",
      { id: ComplianceStatusData.map((s) => s.id) },
      {
        transaction: downSeed,
      },
    );
    await downSeed.commit();
  } catch (error) {
    await downSeed.rollback();
    throw error;
  }
};
