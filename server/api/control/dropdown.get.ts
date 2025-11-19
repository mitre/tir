import {
  ComplianceStatus,
  ImplementationStatus,
  CommonControlProvider,
  SecurityControlDesignation,
  TestMethod,
  FrequencyType,
  ConMonMethod,
  RiskLevel,
} from "../../../db/models";

const dropdowns: Record<string, any> = {
  "compliance-statuses": { model: ComplianceStatus, column: "status" },
  "implementation-statuses": { model: ImplementationStatus, column: "status" },
  "common-control-providers": { model: CommonControlProvider, column: "provider" },
  "security-control-designations": { model: SecurityControlDesignation, column: "designation" },
  "test-methods": { model: TestMethod, column: "method" },
  "frequency-types": { model: FrequencyType, column: "frequency" },
  "conmon-methods": { model: ConMonMethod, column: "method" },
  "risk-levels": { model: RiskLevel, column: "level" },
};

export default defineEventHandler(async () => {
  const result: Record<string, { id: number; name: string }[]> = {};

  // Loop through each dropdown table
  for (const [key, { model, column }] of Object.entries(dropdowns)) {
    const records = await model.findAll({ order: [["id", "ASC"]] });
    result[key] = records.map((r: any) => ({ id: r.id, name: r[column] }));
  }

  return result;
});