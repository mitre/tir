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
  ControlStatement,
  ControlEnhancement,
  ControlEnhancementStatement,
  Control,
  PolicyDocument,
  FrequencyType,
  ImplementationStatus,
  TestMethod,
  CciItem,
  CciReference,
  ComplianceStatus,
} from "~/db/models";

export async function generateSecurityControlAssessment(
  boundaryId: number,
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

  sheet.mergeCells("A1:O1");
  sheet.mergeCells("A2:B2");
  sheet.mergeCells("A3:B3");
  sheet.mergeCells("A4:B4");
  sheet.mergeCells("A5:D5");
  sheet.mergeCells("E5:L5");
  sheet.mergeCells("N5:S5");
  sheet.mergeCells("U5:AC5");

  const headers: string[] = [
    "Item Number",
    "Control Number",
    "Control Title",
    "Control Text",
    "Implementation Status",
    "Test Method",
    "CCI",
    "ConMon Frequency",
    "Narrative",
    "Technical Assessment Status",
    "Technical Assessment Comments",
    "Audit Status",
    "Audit Comments",
    "Assessment Status",
    "Assessment Comments",
  ];

  sheet.autoFilter = "A5:O5";
  sheet.insertRow(5, headers);
  sheet.getColumn("A").alignment = { horizontal: "center", vertical: "top" };
  sheet.getColumn(1).font = { name: "Calibri", size: 10, bold: true };
  sheet.getColumn("B").width = 20;
  sheet.getColumn("C").width = 30;
  sheet.getColumn("D").width = 50;
  sheet.getColumn("E").width = 20;
  sheet.getColumn("F").width = 20;
  sheet.getColumn("G").width = 17;
  sheet.getColumn("H").width = 17;
  sheet.getColumn("I").width = 35;
  sheet.getColumn("J").width = 20;
  sheet.getColumn("K").width = 80;
  sheet.getColumn("L").width = 20;
  sheet.getColumn("M").width = 30;
  sheet.getColumn("N").width = 20;
  sheet.getColumn("O").width = 30;
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
    for (let col = 4; col <= 15; col++) {
      const cell = row.getCell(col);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: fillColor };
    }
  }

  const headerRow = sheet.getRow(5);
  for (let col = 1; col <= 15; col++) {
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
  sheet.getRow(5).height = 80;
  sheet.getCell("A2").value = "Control Import Template:";
  sheet.getCell("A2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };
  sheet.getCell("A3").value = "Exported:";
  sheet.getCell("A3").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };
  sheet.getCell("A4").value = "System Type:";
  sheet.getCell("A4").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C0C0C0" } };

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
  c3.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  enum Columns {
    itemNumber,
    controlNumber,
    title,
    controlInformation,
    implementationStatus,
    testMethod,
    cci,
    frequency,
    narrative,
    technicalAssessmentStatus,
    technicalAssessmentComments,
    auditStatus,
    auditComments,
    assessmentStatus,
    assessmentComments,
  }

  const boundary = await Boundary.findOne({
    where: { id: boundaryId },
    include: [
      {
        model: Classification,
      },
      {
        model: PolicyDocument,
      },
    ],
  });

  const cciItems = await CciItem.findAll({
    attributes: ["cciId", "definition"],
    include: [
      {
        model: CciReference,
        attributes: ["index"],
        through: { attributes: [] },
        where: {
          PolicyDocumentId: boundary?.PolicyDocumentId,
        },
      },
    ],
  });
  const cciItemMap = new Map(cciItems.map((item) => [item.cciId, item]));
  const cciMap = new Map<string, string[]>();

  for (const cciItem of cciItems) {
    const refs = cciItem.CciReferences ?? [];
    for (const ref of refs) {
      if (!ref.index) continue;
      const normalizedIndex = ref.index.replace(/\s+/g, "");
      if (!cciMap.has(normalizedIndex)) {
        cciMap.set(normalizedIndex, []);
      }
      cciMap.get(normalizedIndex)!.push(cciItem.cciId);
    }
  }

  const stigResults = await getEvaluationSummary(boundaryId, undefined, false);

  const stigArray = Array.isArray(stigResults) ? stigResults : [stigResults];
  const controlToStatusMap = new Map<string, Map<string, Set<string>>>();

  for (const stig of stigArray) {
    for (const stigData of stig.StigData) {
      const status = stigData.status;
      const vKey = stigData.vuln_num;
      const title = stig.title || "";
      const displayValue = title ? `${vKey} - ${title}` : vKey;

      const cciIds = stigData.StigIdents.map((c: any) => c.text);

      for (const cciId of cciIds) {
        const cciItem = cciItemMap.get(cciId);
        const cciRef = cciItem?.CciReferences?.[0]?.index ?? "";
        const normalizedControl = cciRef.replace(/\s+/g, "");
        if (!normalizedControl) continue;

        if (!controlToStatusMap.has(normalizedControl)) {
          controlToStatusMap.set(normalizedControl, new Map());
        }

        const statusMap = controlToStatusMap.get(normalizedControl)!;
        if (!statusMap.has(status)) {
          statusMap.set(status, new Set());
        }
        statusMap.get(status)!.add(displayValue);
      }
    }
  }

  const revName = `rev${boundary?.PolicyDocument?.version}`;
  const revision = await ControlRevision.findOne({ where: { name: revName } });

  const results = await ControlRecordItem.findAll({
    include: [
      {
        model: ControlRecord,
        attributes: ["controlFamilyId"],
        where: { boundaryId, controlRevisionId: revision?.id },
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

  let classificationString = `${boundary?.Classification?.dataValues.name}`;

  if (boundary?.caveats) {
    classificationString += `// ${boundary?.caveats}`;
  }

  sheet.headerFooter.oddHeader = classificationString;
  sheet.headerFooter.oddFooter = classificationString;
  sheet.getCell("A1").value = classificationString;
  sheet.getCell("C2").value = boundary.name;
  const bannerColor = boundary?.Classification?.dataValues.color;

  sheet.getCell("A1").font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: bannerColor } };

  const [implementationStatuses, testMethods, frequencyTypes, complianceStatuses] =
    await Promise.all([
      ImplementationStatus.findAll(),
      TestMethod.findAll(),
      FrequencyType.findAll(),
      ComplianceStatus.findAll(),
    ]);

  const implementationStatusMap = new Map(implementationStatuses.map((d) => [d.id, d.status]));
  const complianceStatusMap = new Map(complianceStatuses.map((d) => [d.id, d.status]));

  const testMethodMap = new Map(testMethods.map((d) => [d.id, d.method]));
  const frequencyMap = new Map(frequencyTypes.map((d) => [d.id, d.frequency]));
  const sortedResults = results.sort((a, b) => {
    const aControlId = a.ControlId ?? 0;
    const bControlId = b.ControlId ?? 0;
    if (aControlId === bControlId) {
      const aEnh = a.ControlEnhancementId ?? 0;
      const bEnh = b.ControlEnhancementId ?? 0;
      return aEnh - bEnh;
    }

    return aControlId - bControlId;
  });

  function formatDate(value: Date | string | null | undefined): string {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    return isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-US");
  }
  const controlArray: string[][] = [];

  const controlStatementsMap = new Map<number, string>();
  const enhancementStatementsMap = new Map<number, string>();

  for (const item of sortedResults) {
    if (item.Control?.ControlStatements) {
      controlStatementsMap.set(
        item.ControlId ?? 0,
        item.Control.ControlStatements.map((s: any) => s.description).join("\n"),
      );
    }
    if (item.ControlEnhancement?.ControlEnhancementStatements) {
      enhancementStatementsMap.set(
        item.ControlEnhancementId ?? 0,
        item.ControlEnhancement.ControlEnhancementStatements.map((s: any) => s.description).join(
          "\n",
        ),
      );
    }
  }

  for (const [index, item] of sortedResults.entries()) {
    const newRow: string[] = new Array(Object.keys(Columns).length / 2).fill("");
    newRow[Columns.itemNumber] = (index + 1).toString();

    let controlNumber = "";
    if (item.ControlEnhancementId && item.ControlEnhancement) {
      controlNumber = item.ControlEnhancement.enhancementIdentifier || "";
      newRow[Columns.title] = item.ControlEnhancement.title || "";
      newRow[Columns.controlInformation] =
        enhancementStatementsMap.get(item.ControlEnhancementId) || "";
    } else if (item.Control) {
      controlNumber = item.Control.ControlNumber?.number || "";
      newRow[Columns.title] = item.Control.title || "";
      newRow[Columns.controlInformation] = controlStatementsMap.get(item.ControlId) || "";
    }

    newRow[Columns.controlNumber] = controlNumber;
    const normalizedControlNumber = controlNumber.replace(/\s+/g, "");
    const statusMap = controlToStatusMap.get(normalizedControlNumber);
    const cciIds = cciMap.get(normalizedControlNumber) || [];
    newRow[Columns.cci] = cciIds.length ? cciIds.join("\n") + "\n" : "";

    if (statusMap && statusMap.size > 0) {
      const lines: string[] = [];
      for (const [status, vKeys] of statusMap) {
        lines.push(status, ...Array.from(vKeys), "");
      }
      newRow[Columns.technicalAssessmentComments] = lines.join("\n") + "\n";
    } else {
      newRow[Columns.technicalAssessmentComments] = "";
    }

    const implementationStatus = implementationStatusMap.get(item.ImplementationStatusId ?? -1);

    if (implementationStatus) {
      newRow[Columns.implementationStatus] = implementationStatus;
    } else {
      newRow[Columns.implementationStatus] = "Not Applicable";
    }
    if (newRow[Columns.implementationStatus] === "Not Applicable") {
      newRow[Columns.technicalAssessmentStatus] = "";
      newRow[Columns.technicalAssessmentComments] = "";
      newRow[Columns.auditStatus] = "";
      newRow[Columns.auditComments] = "";
      newRow[Columns.assessmentStatus] = "";
      newRow[Columns.assessmentComments] = "";
    } else {
      newRow[Columns.auditStatus] = complianceStatusMap.get(item.AuditControlStatusId ?? -1) || "";
      newRow[Columns.assessmentStatus] =
        complianceStatusMap.get(item.AssessorControlStatusId ?? -1) || "";

      newRow[Columns.auditComments] = [item.auditor, formatDate(item.auditDate), item.auditComments]
        .filter(Boolean)
        .join("\n");
      newRow[Columns.assessmentComments] = [
        item.assessor,
        formatDate(item.assessorDate),
        item.assessorComments,
      ]
        .filter(Boolean)
        .join("\n");

      if (!newRow[Columns.technicalAssessmentComments]?.trim()) {
        newRow[Columns.technicalAssessmentComments] =
          "No applicable STIG mapping for this Control.\n";
      }
    }
    newRow[Columns.testMethod] = testMethodMap.get(item.TestMethodId ?? -1) || "";
    newRow[Columns.frequency] = frequencyMap.get(item.FrequencyTypeId ?? -1) || "";
    newRow[Columns.narrative] = item.implementationNarrative || "";

    controlArray.push(newRow);
  }
  for (const row of controlArray) {
    if (row[Columns.implementationStatus] === "Not Applicable") continue;
    const statusText = row[Columns.technicalAssessmentComments] || "";

    if (statusText.includes("Open")) {
      row[Columns.technicalAssessmentStatus] = "Non-Compliant";
    } else if (statusText.includes("Not_Reviewed")) {
      row[Columns.technicalAssessmentStatus] = "Not Reviewed";
    } else if (statusText.includes("NotAFinding")) {
      row[Columns.technicalAssessmentStatus] = "Compliant";
    } else if (statusText.includes("Not_Applicable")) {
      row[Columns.technicalAssessmentStatus] = "Not-Applicable";
    } else {
      row[Columns.technicalAssessmentStatus] = "Not-Applicable";
    }
  }

  sheet.insertRows(6, controlArray);

  return workbook;
}
