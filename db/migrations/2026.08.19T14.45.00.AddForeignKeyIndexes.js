// FK columns have no indexes, so cascaded deletes and per-system aggregates
// degrade to full-table scans as AssessmentItems grows.
const indexes = [
  ["AssessmentItems", "AssessmentId"],
  ["AssessmentItems", "previousId"],
  ["AssessmentItems", "StigDatumId"],
  ["Assessments", "SystemId"],
  ["Assessments", "StigId"],
  ["Assessments", "succeededByAssessmentId"],
  ["EvaluationItems", "EvaluationId"],
  ["EvaluationItems", "StigDatumId"],
  ["Stig_Systems", "SystemId"],
];

export const up = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  for (const [table, column] of indexes) {
    await queryInterface.addIndex(table, [column], { name: `${table}_${column}` });
  }
};

export const down = async ({ context: sequelize }) => {
  const queryInterface = sequelize.getQueryInterface();
  for (const [table, column] of indexes) {
    await queryInterface.removeIndex(table, `${table}_${column}`);
  }
};
