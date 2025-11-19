import ExcelJS from "exceljs";
import {
  Boundary,
  User,
  Classification,
  ControlNumber,
  ControlRevision,
  ControlRecord,
  ControlRecordItem,
  ControlFamily,
  ComplianceStatus,
  ControlStatement,
  ControlEnhancement,
  ControlEnhancementStatement,
  Control,
  PolicyDocument,
  CommonControlProvider,
  ConMonMethod,
  FrequencyType,
  ImplementationStatus,
  RiskLevel,
  SecurityControlDesignation,
  TestMethod,
} from "~/db/models";

export async function generateEMass(
  BoundaryId: number,
  userId: number | undefined,
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sheet1");
  sheet.views = [{ zoomScale: 80 }];

  sheet.columns = [
    {
      width: 12,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 18,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 40,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 19,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 16,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 21,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 38,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 30,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 40,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 22,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 22,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 34,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 22,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 22,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 27,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 29,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 35,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 35,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 36,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 32,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 22,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 37,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 27,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 40,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 40,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 40,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 40,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 40,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 40,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
  ];

  sheet.mergeCells("A1:AD1");
  sheet.mergeCells("A2:B2");
  sheet.mergeCells("A3:B3");
  sheet.mergeCells("A4:B4");
  sheet.mergeCells("A5:D5");
  sheet.mergeCells("E5:L5");
  sheet.mergeCells("N5:S5");
  sheet.mergeCells("U5:AC5");

  const headers: string[] = [
    "Control Number",
    "Control Title",
    "Control Information",
    "Compliance Status",
    "Implementation Status",
    "Common Control Provider",
    "Security Control Designation",
    "Test Method",
    "N/A Justification",
    "Estimated Completion Date",
    "Implementation Narrative",
    "Responsible Entities",
    "", // empty/unused
    "Criticality",
    "Frequency",
    "Method",
    "Reporting",
    "Tracking",
    "SLCM Comments",
    "", // empty/unused
    "Severity",
    "Relevance of Threat",
    "Likelihood",
    "Impact",
    "Residual Risk Level",
    "Vulnerability Summary",
    "Mitigations",
    "Impact Description",
    "Recommendations",
    "", // empty/unused
  ];

  sheet.autoFilter = "A6:AC6";
  sheet.insertRow(6, headers);
  sheet.getColumn("A").alignment = { horizontal: "center", vertical: "top" };
  sheet.getColumn(1).font = { name: "Calibri", size: 10, bold: true };
  sheet.getColumn("B").width = 20;
  sheet.getColumn("C").width = 50;
  sheet.getColumn("D").width = 17;
  sheet.getColumn("E").width = 20;
  sheet.getColumn("F").width = 20;
  sheet.getColumn("G").width = 17;
  sheet.getColumn("H").width = 17;
  sheet.getColumn("I").width = 35;
  sheet.getColumn("J").width = 25;
  sheet.getColumn("K").width = 30;
  sheet.getColumn("L").width = 30;
  sheet.getColumn("M").width = 10;
  sheet.getColumn("N").width = 15;
  sheet.getColumn("O").width = 15;
  sheet.getColumn("P").width = 15;
  sheet.getColumn("Q").width = 30;
  sheet.getColumn("R").width = 30;
  sheet.getColumn("S").width = 40;
  sheet.getColumn("T").width = 10;
  sheet.getColumn("U").width = 15;
  sheet.getColumn("V").width = 15;
  sheet.getColumn("W").width = 15;
  sheet.getColumn("X").width = 15;
  sheet.getColumn("Y").width = 15;
  sheet.getColumn("Z").width = 30;
  sheet.getColumn("AA").width = 30;
  sheet.getColumn("AB").width = 30;
  sheet.getColumn("AC").width = 30;
  const rowsToStyle = [2, 3, 4];
  const fillColor = { argb: "FFD3D3D3" };

  for (const rowNumber of rowsToStyle) {
    const row = sheet.getRow(rowNumber);

    for (let col = 1; col <= 3; col++) {
      const cell = row.getCell(col);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }
    for (let col = 4; col <= 30; col++) {
      const cell = row.getCell(col);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: fillColor };
    }
  }

  const headerRow = sheet.getRow(6);
  for (let col = 1; col <= 30; col++) {
    const cell = headerRow.getCell(col);
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "medium" },
      right: { style: "thin" },
    };
    cell.font = { name: "Arial", size: 12, bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  }
  sheet.getRow(6).height = 80;
  sheet.getRow(5).font = { name: "Arial", size: 12, bold: true };
  sheet.getCell("A2").value = "Control Import Template:";
  sheet.getCell("A2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };
  sheet.getCell("A3").value = "Exported:";
  sheet.getCell("A3").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };
  sheet.getCell("A4").value = "System Type:";
  sheet.getCell("A4").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };
  sheet.getCell("A5").value = "Control Information:";
  sheet.getCell("E5").value = "Implementation Plan:";
  sheet.getCell("E5").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "89CFF0" } };
  sheet.getCell("M5").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "89CFF0" } };
  sheet.getCell("N5").value = "SLCM:";
  sheet.getCell("N5").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FBCEB1" } };
  sheet.getCell("T5").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FBCEB1" } };
  sheet.getCell("U5").value = "Risk Assessment:";
  sheet.getCell("U5").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "89CFF0" } };
  sheet.getCell("AD5").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "89CFF0" } };

  sheet.getCell("E5").alignment = { horizontal: "center", vertical: "top" };
  sheet.getCell("N5").alignment = { horizontal: "center", vertical: "top" };
  sheet.getCell("U5").alignment = { horizontal: "center", vertical: "top" };

  const formattedDate = new Date().toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  let exportByText = `On ${formattedDate}`;
  if (userId) {
    const user = await User.findByPk(userId);
    if (user) {
      exportByText += ` by ${user.firstName} ${user.lastName}`;
    }
  }
  const c3 = sheet.getCell("C3");
  c3.value = exportByText;
  c3.alignment = { horizontal: "left", vertical: "top" };
  c3.font = { name: "Calibri", size: 10, bold: true };
  const cell = sheet.getCell("C3");

  cell.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  enum Columns {
    controlNumber,
    title,
    controlInformation,
    complianceStatus,
    implementationStatus,
    commonControlProvider,
    securityControlDesignation,
    testMethod,
    naJustification,
    estimatedCompletionDate,
    implementationNarrative,
    responsibleEntities,
    column13, // empty/unused
    criticality,
    frequency,
    method,
    reporting,
    tracking,
    slcmComments,
    column20, // empty/unused
    severity,
    relevanceOfThreat,
    likelihood,
    impact,
    residualRiskLevel,
    vulnerabilitySummary,
    mitigations,
    impactDescription,
    recommendations,
    column30, // empty/unused
  }

  const boundary = await Boundary.findOne({
    where: { id: BoundaryId },
    include: [
      {
        model: Classification,
      },
      {
        model: PolicyDocument,
      },
    ],
  });

  const revName = `rev${boundary?.PolicyDocument?.version}`;
  const revision = await ControlRevision.findOne({ where: { name: revName } });

  const results = await ControlRecordItem.findAll({
    include: [
      {
        model: ControlRecord,
        attributes: ["ControlFamilyId"],
        where: { BoundaryId, ControlRevisionId: revision?.id },
        required: true,
        include: [{ model: ControlFamily, attributes: ["name"] }],
      },
      {
        model: Control,
        include: [
          { model: ControlNumber, attributes: ["number"] },
          { model: ControlRevision, attributes: ["name"] },
          { model: ControlStatement },
        ],
      },
      {
        model: ControlEnhancement,
        include: [
          {
            model: ControlEnhancementStatement,
          },
        ],
      },
    ],
    order: [
      [
        { model: ControlEnhancement, as: "ControlEnhancement" },
        { model: ControlEnhancementStatement, as: "ControlEnhancementStatements" },
        "id",
        "ASC",
      ],
      [
        { model: Control, as: "Control" },
        { model: ControlStatement, as: "ControlStatements" },
        "id",
        "ASC",
      ],
    ],
  });

  let classificationString = `${boundary?.Classification?.name}`;

  if (boundary?.caveats) {
    classificationString += `// ${boundary?.caveats}`;
  }

  sheet.headerFooter.oddHeader = classificationString;
  sheet.headerFooter.oddFooter = classificationString;
  sheet.getCell("A1").value = classificationString;
  sheet.getCell("C2").value = boundary?.name;
  const bannerColor = boundary?.Classification?.color;

  sheet.getCell("A1").font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: bannerColor } };

  const [
    complianceStatuses,
    implementationStatuses,
    commonControlProviders,
    securityControlDesignations,
    testMethods,
    frequencyTypes,
    conMonMethods,
    riskLevels,
  ] = await Promise.all([
    ComplianceStatus.findAll(),
    ImplementationStatus.findAll(),
    CommonControlProvider.findAll(),
    SecurityControlDesignation.findAll(),
    TestMethod.findAll(),
    FrequencyType.findAll(),
    ConMonMethod.findAll(),
    RiskLevel.findAll(),
  ]);

  const complianceStatusMap = new Map(complianceStatuses.map((d) => [d.id, d.status]));
  const implementationStatusMap = new Map(implementationStatuses.map((d) => [d.id, d.status]));
  const commonControlProviderMap = new Map(commonControlProviders.map((d) => [d.id, d.provider]));
  const securityControlDesignationMap = new Map(
    securityControlDesignations.map((d) => [d.id, d.designation]),
  );
  const testMethodMap = new Map(testMethods.map((d) => [d.id, d.method]));
  const frequencyMap = new Map(frequencyTypes.map((d) => [d.id, d.frequency]));
  const conMonMethodMap = new Map(conMonMethods.map((d) => [d.id, d.method]));
  const riskLevelMap = new Map(riskLevels.map((d) => [d.id, d.level]));

  const filteredResults = results.filter((item: any) => item.ComplianceStatusId !== 3);
  const sortedResults = filteredResults.sort((a, b) => {
    // sort by base control id first
    const aControlId = a.ControlId ?? 0;
    const bControlId = b.ControlId ?? 0;

    if (aControlId === bControlId) {
      // enhancements after base control
      const aEnh = a.ControlEnhancementId ?? 0;
      const bEnh = b.ControlEnhancementId ?? 0;
      return aEnh - bEnh;
    }

    return aControlId - bControlId;
  });
  const controlArray: string[][] = [];

  // Loop through each ControlRecordItem
  for (const item of sortedResults) {
    const control = item.Control;
    const enhancement = item.ControlEnhancement;

    const newRow: string[] = new Array(Object.keys(Columns).length).fill("");

    if (item.ControlEnhancementId && enhancement) {
      // Enhancement row
      newRow[Columns.controlNumber] = enhancement.enhancementIdentifier || "";
      newRow[Columns.title] = enhancement.title || "";
      newRow[Columns.controlInformation] =
        enhancement.ControlEnhancementStatements?.map((s: any) => s.description).join("\n") || "";
    } else if (control) {
      // Base control row
      newRow[Columns.controlNumber] = control.ControlNumber?.number || "";
      newRow[Columns.title] = control.title || "";
      newRow[Columns.controlInformation] =
        control.ControlStatements?.map((s: any) => s.description).join("\n") || "";
    }

    // Map all other fields from ControlRecordItem
    newRow[Columns.complianceStatus] = complianceStatusMap.get(item.ComplianceStatusId ?? -1) || "";
    newRow[Columns.implementationStatus] =
      implementationStatusMap.get(item.ImplementationStatusId ?? -1) || "";
    newRow[Columns.commonControlProvider] =
      commonControlProviderMap.get(item.CommonControlProviderId ?? -1) || "";
    newRow[Columns.securityControlDesignation] =
      securityControlDesignationMap.get(item.SecurityControlDesignationId ?? -1) || "";
    newRow[Columns.testMethod] = testMethodMap.get(item.TestMethodId ?? -1) || "";
    newRow[Columns.naJustification] = item.naJustification || "";
    newRow[Columns.estimatedCompletionDate] = item.estimatedCompletionDate
      ? new Date(item.estimatedCompletionDate).toLocaleDateString()
      : "";
    newRow[Columns.implementationNarrative] = item.implementationNarrative || "";
    newRow[Columns.responsibleEntities] = item.responsibleEntities || "";
    newRow[Columns.criticality] = item.criticality || "";
    newRow[Columns.frequency] = frequencyMap.get(item.FrequencyTypeId ?? -1) || "";
    newRow[Columns.method] = conMonMethodMap.get(item.ConMonMethodId ?? -1) || "";
    newRow[Columns.reporting] = item.reporting || "";
    newRow[Columns.tracking] = item.tracking || "";
    newRow[Columns.slcmComments] = item.conmonComments || "";
    newRow[Columns.severity] = riskLevelMap.get(item.SeverityId ?? -1) || "";
    newRow[Columns.relevanceOfThreat] = riskLevelMap.get(item.RelevanceOfThreatId ?? -1) || "";
    newRow[Columns.likelihood] = riskLevelMap.get(item.LikelihoodId ?? -1) || "";
    newRow[Columns.impact] = riskLevelMap.get(item.ImpactId ?? -1) || "";
    newRow[Columns.residualRiskLevel] = riskLevelMap.get(item.ResidualRiskLevelId ?? -1) || "";
    newRow[Columns.vulnerabilitySummary] = item.vulnerabilitySummary || "";
    newRow[Columns.mitigations] = item.mitigations || "";
    newRow[Columns.impactDescription] = item.impactDescription || "";
    newRow[Columns.recommendations] = item.recommendations || "";

    controlArray.push(newRow);
  }

  sheet.insertRows(7, controlArray, "o");

  return workbook;
}
