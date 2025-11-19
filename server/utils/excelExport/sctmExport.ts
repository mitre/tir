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
  CciReference
} from "~/db/models";

export async function generateSctm(
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

  sheet.mergeCells("A1:I1");
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
  ];

  sheet.autoFilter = "A5:I5";
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
    for (let col = 4; col <= 9; col++) {
      const cell = row.getCell(col);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: fillColor };
    }
  }

  const headerRow = sheet.getRow(5);
  for (let col = 1; col <= 9; col++) {
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
  }


  const boundary = (await Boundary.findOne({
    where: { id: boundaryId },
    include: [
      {
        model: Classification,
      },
      {
        model: PolicyDocument,
      },
    ],
  }))

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

    const cciMap = new Map<string, string[]>();


    for (const cciItem of cciItems) {
      const refs = cciItem.CciReferences ?? []; // safe fallback
      for (const ref of refs) {
        if (!ref.index) continue;

        // Normalize by removing spaces for universal matching
        const normalizedIndex = ref.index.replace(/\s+/g, "");
        if (!cciMap.has(normalizedIndex)) {
          cciMap.set(normalizedIndex, []);
        }
        cciMap.get(normalizedIndex)!.push(cciItem.cciId);
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

  let classificationString = `${boundary?.Classification?.name}`;

  if (boundary?.caveats) {
    classificationString += `// ${boundary?.caveats}`;
  }

  sheet.headerFooter.oddHeader = classificationString;
  sheet.headerFooter.oddFooter = classificationString;
  sheet.getCell("A1").value = classificationString;
  sheet.getCell("C2").value = boundary.name;
  const bannerColor = boundary?.Classification?.color;

  sheet.getCell("A1").font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: bannerColor } };

  const [
    implementationStatuses,
    testMethods,
    frequencyTypes,
  ] = await Promise.all([
    ImplementationStatus.findAll(),
    TestMethod.findAll(),
    FrequencyType.findAll(),
  ]);

  const implementationStatusMap = new Map(implementationStatuses.map((d) => [d.id, d.status]));

  const testMethodMap = new Map(testMethods.map((d) => [d.id, d.method]));
  const frequencyMap = new Map(frequencyTypes.map((d) => [d.id, d.frequency]));
  // List all controls
  const sortedResults = results.sort((a, b) => {
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
    newRow[Columns.itemNumber] = (controlArray.length + 1).toString();

    let controlNumber = "";
    if (item.ControlEnhancementId && enhancement) {
      // Enhancement row
      controlNumber = enhancement.enhancementIdentifier || "";
      newRow[Columns.title] = enhancement.title || "";
      newRow[Columns.controlInformation] =
        enhancement.ControlEnhancementStatements?.map((s: any) => s.description).join("\n") || "";
    } else if (control) {
      // Base control row
      controlNumber = control.ControlNumber?.number || "";
      newRow[Columns.title] = control.title || "";
      newRow[Columns.controlInformation] =
        control.ControlStatements?.map((s: any) => s.description).join("\n") || "";
    }
    newRow[Columns.controlNumber] = controlNumber;
    const normalizedControlNumber = controlNumber.replace(/\s+/g, "");
    const cciIds = cciMap.get(normalizedControlNumber) || [];
    newRow[Columns.cci] = cciIds.length ? cciIds.join("\n") + "\n" : "";
    // Map all other fields from ControlRecordItem
    newRow[Columns.implementationStatus] =
      implementationStatusMap.get(item.ImplementationStatusId ?? -1) || "";
    newRow[Columns.testMethod] = testMethodMap.get(item.TestMethodId ?? -1) || "";
    newRow[Columns.frequency] = frequencyMap.get(item.FrequencyTypeId ?? -1) || "";
    newRow[Columns.narrative] = item.implementationNarrative  || "";


    controlArray.push(newRow);
  }

  sheet.insertRows(6, controlArray);

  return workbook;
}
