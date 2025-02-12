import ExcelJS from "exceljs";
import { Boundary, CciItem, CciReference, Classification } from "~/db/models";

export async function generateSSA(
  boundaryId: number,
  boundaryView: any[],
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("CCI Compliance");
  const sheet2 = workbook.addWorksheet("Control Compliance");

  sheet.views = [{ zoomScale: 80 }];
  sheet2.views = [{ zoomScale: 80 }];

  sheet.columns = [
    {
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },

    {
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
  ];

  sheet2.columns = [
    {
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
  ];

  const headers: string[] = [
    "CCI",
    "CCI Description",
    "Control",
    "Check",
    "CCI Compliance Status",
    "Finding Status",
  ];

  const headers2: string[] = [
    "Control",
    "Control Description",
    "Control Text",
    "Supplemental Guidance",
    "Pass/Fail",
    "CCIs",
  ];
  sheet.autoFilter = "A1:G1";
  sheet2.autoFilter = "A1:F1";

  sheet.insertRow(1, headers);
  sheet2.insertRow(1, headers2);

  sheet.getColumn("A").alignment = { horizontal: "left", vertical: "top", wrapText: true };
  sheet.getRow(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  sheet.getColumn("A").font = { name: "Calibri", size: 12, bold: true };
  sheet.getColumn("A").width = 20;
  sheet.getColumn("B").width = 35;
  sheet.getColumn("C").width = 30;
  sheet.getColumn("D").width = 40;
  sheet.getColumn("E").width = 40;
  sheet.getColumn("F").width = 20;
  sheet.getColumn("G").width = 25;

  sheet2.getColumn("A").alignment = { horizontal: "center", vertical: "top" };
  sheet2.getRow(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  sheet2.getColumn("A").font = { name: "Calibri", size: 12, bold: true };
  sheet2.getColumn("A").width = 20;
  sheet2.getColumn("B").width = 25;
  sheet2.getColumn("C").width = 30;
  sheet2.getColumn("D").width = 40;
  sheet2.getColumn("E").width = 40;
  sheet2.getColumn("F").width = 20;

  sheet.getRow(1).font = { name: "Arial", size: 12, bold: true };
  sheet.getRow(1).height = 50;
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D9D9D9" } };
  sheet.eachRow(function (i) {
    i.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  sheet2.getRow(1).font = { name: "Arial", size: 12, bold: true };
  sheet2.getRow(1).height = 50;
  sheet2.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D9D9D9" } };
  sheet2.eachRow(function (i) {
    i.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  const tabOne: string[][] = [];
  const tabTwo: string[][] = [];

  enum Columns {
    cci,
    cciDesc,
    control,
    check,
    cciStatus,
    findingStatus,
  }

  enum Columns2 {
    control,
    controlDesc,
    controlText,
    supGuidance,
    passFail,
    ccis,
  }

  const results = await getEvaluationSummary(boundaryId, undefined, false);
  // console.log("Results", results[0].StigData[0].StigIdents);
  interface BoundaryWithClassification extends Boundary {
    Classification?: Classification;
  }

  const boundary = (await Boundary.findOne({
    where: { id: boundaryId },
    include: { model: Classification },
  })) as BoundaryWithClassification;

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

  // Tab 1
  for (const stig of results) {
    const checkTitle = stig.title;
    for (const stigData of stig.StigData) {
      const checkRule = stigData.rule_id;

      for (const cci of stigData.StigIdents) {
        const newRow: string[] = new Array(7).fill("");
        const index = tabOne.findIndex((row) => row[Columns.cci] === cci.text);

        const cciItem = cciItems?.find((cciItem) => cciItem.cciId === cci.text);
        const cciRef = cciItem?.CciReferences?.[0]?.index ?? "";
        if (index !== -1 && cciRef) {
          // CCI Match
          if (!tabOne[index][Columns.control].includes(cciRef)) {
            tabOne[index][Columns.control] += `\n${cciRef}`;
          }

          if (!tabOne[index][Columns.check].includes(checkTitle)) {
            tabOne[index][Columns.check] +=
              `\n\n${stig.title}\n${stigData.rule_id} / ${stigData.vuln_num}`;
          } else if (!tabOne[index][Columns.check].includes(checkRule)) {
            tabOne[index][Columns.check] += `\n${stigData.rule_id} / ${stigData.vuln_num}`;
          }

          if (
            tabOne[index][Columns.findingStatus].includes(stigData.status) &&
            !tabOne[index][Columns.findingStatus].includes(stigData.vuln_num)
          ) {
            const findingIndex =
              tabOne[index][Columns.findingStatus].search(stigData.status) + stigData.status.length;
            const cipherChars = [...tabOne[index][Columns.findingStatus]]; // convert into array
            cipherChars[findingIndex] = `\n${stigData.vuln_num}\n`; // alter array
            tabOne[index][Columns.findingStatus] = cipherChars.join("");
          } else if (!tabOne[index][Columns.findingStatus].includes(stigData.vuln_num)) {
            tabOne[index][Columns.findingStatus] += `\n\n${stigData.status}\n${stigData.vuln_num}`;
          }
        } else if (cciRef && cciItem) {
          // New CCI
          newRow[Columns.cci] = cci.text;
          newRow[Columns.cciDesc] = cciItem.definition;
          newRow[Columns.control] = cciRef;
          newRow[Columns.check] = `${stig.title}\n${stigData.rule_id} / ${stigData.vuln_num}`;
          newRow[Columns.findingStatus] = `${stigData.status}\n${stigData.vuln_num}`;
          tabOne.push(newRow);
        }
      }
    }
  }
  for (const row of tabOne) {
    if (row[Columns.findingStatus].includes("Open")) {
      row[Columns.cciStatus] = "Fail";
    } else if (row[Columns.findingStatus].includes("Not_Reviewed")) {
      row[Columns.cciStatus] = "";
    } else if (row[Columns.findingStatus].includes("NotAFinding")) {
      row[Columns.cciStatus] = "Pass";
    } else if (row[Columns.findingStatus].includes("Not_Applicable")) {
      row[Columns.cciStatus] = "";
    }
  }
  sheet.insertRows(2, tabOne, "o");

  // Tab 2
  for (const stig of results) {
    for (const stigData of stig.StigData) {
      for (const cci of stigData.StigIdents) {
        const newRow: string[] = new Array(6).fill("");
        const cciItem = cciItems.find((cciItem) => cciItem.cciId === cci.text);
        const cciRef = cciItem?.CciReferences?.[0]?.index ?? "";
        const index = tabTwo.findIndex((row) => row[Columns2.control] === cciRef);

        if (index !== -1) {
          // Control Match
          if (!tabTwo[index][Columns2.ccis].includes(cci.text)) {
            // tabTwo[index][Columns2.ccis] += `\n${cci.text}`;
            const cciLookup = tabOne.find((row) => row[Columns.cci] === cci.text);
            if (cciLookup !== undefined) {
              if (cciLookup[Columns.cciStatus] === "") {
                cciLookup[Columns.cciStatus] = "Not Reviewed";
              }
              if (tabTwo[index][Columns2.ccis].includes(cciLookup[Columns.cciStatus])) {
                const findingIndex =
                  tabTwo[index][Columns2.ccis].search(cciLookup[Columns.cciStatus]) +
                  cciLookup[Columns.cciStatus].length +
                  1;
                const cipherChars = [...tabTwo[index][Columns2.ccis]]; // convert into array
                cipherChars[findingIndex] = `\n${cci.text}\n`; // alter array
                tabTwo[index][Columns2.ccis] = cipherChars.join("");
              } else {
                tabTwo[index][Columns2.ccis] += `\n\n${cciLookup[Columns.cciStatus]}:\n${cci.text}`;
              }
            }
          }
        } else if (cciRef) {
          // New CCI
          newRow[Columns2.control] = cciRef;
          const cciLookup = tabOne.find((row) => row[Columns.cci] === cci.text);
          if (cciLookup !== undefined) {
            if (cciLookup[Columns.cciStatus] === "") {
              cciLookup[Columns.cciStatus] = "Not Reviewed";
            }
            newRow[Columns2.ccis] = `${cciLookup[Columns.cciStatus]}:\n${cci.text}`;
          }

          tabTwo.push(newRow);
        }
      }
    }
  }
  for (const row of tabTwo) {
    if (row[Columns2.ccis].includes("Fail")) {
      row[Columns2.passFail] = "Fail";
    } else if (row[Columns2.ccis].includes("Not Reviewed")) {
      row[Columns2.passFail] = "";
    } else if (row[Columns2.ccis].includes("Pass")) {
      row[Columns2.passFail] = "Pass";
    }
  }
  sheet2.insertRows(2, tabTwo, "o");

  // Stig Tabs
  enum ColumnsX {
    cci,
    cciDesc,
    control,
    check,
    fixAction,
    cciStatus,
    findingStatus,
  }
  boundaryView.forEach((element) => {
    const tabX: string[][] = [];
    const sheetX = workbook.addWorksheet(element.title);
    sheetX.views = [{ zoomScale: 80 }];
    sheetX.columns = [
      {
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
    ];
    const headersX: string[] = [
      "CCI",
      "CCI Description",
      "Control",
      `${element.title} Check`,
      `${element.title} Fix Action`,
      "CCI Compliance Status",
      "Finding Status",
    ];
    sheetX.autoFilter = "A1:F1";

    sheetX.insertRow(1, headersX);

    sheetX.getColumn("A").alignment = { horizontal: "center", vertical: "top" };
    sheetX.getRow(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    sheetX.getColumn("A").font = { name: "Calibri", size: 10, bold: true };
    sheetX.getColumn("A").width = 20;
    sheetX.getColumn("B").width = 35;
    sheetX.getColumn("C").width = 20;
    sheetX.getColumn("D").width = 60;
    sheetX.getColumn("E").width = 60;
    sheetX.getColumn("F").width = 20;
    sheetX.getColumn("G").width = 25;

    sheetX.getRow(1).font = { name: "Arial", size: 12, bold: true };
    sheetX.getRow(1).height = 50;
    sheetX.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D9D9D9" } };
    sheetX.eachRow(function (i) {
      i.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    // Tab X
    for (const stig of results) {
      const checkTitle = stig.title;
      if (checkTitle === element.title) {
        for (const stigData of stig.StigData) {
          const checkRule = stigData.rule_id;

          for (const cci of stigData.StigIdents) {
            const newRow: string[] = new Array(6).fill("");
            const cciItem = cciItems.find((cciItem) => cciItem.cciId === cci.text);
            const cciRef = cciItem?.CciReferences?.[0]?.index ?? "";
            const index = tabX.findIndex((row) => row[ColumnsX.cci] === cci.text);

            if (index !== -1 && cciRef) {
              // CCI Match
              if (!tabX[index][ColumnsX.control].includes(cciRef)) {
                tabX[index][ColumnsX.control] += `\n${cciRef}`;
              }

              if (!tabX[index][ColumnsX.check].includes(checkRule)) {
                tabX[index][ColumnsX.check] +=
                  `\n\n${stigData.rule_id} / ${stigData.vuln_num}\n${stigData.check_check_content}`;
              }
              if (!tabX[index][ColumnsX.fixAction].includes(checkRule)) {
                tabX[index][ColumnsX.fixAction] +=
                  `\n\n${stigData.rule_id} / ${stigData.vuln_num}\n${stigData.fixtext}`;
              }

              if (tabX[index][ColumnsX.findingStatus].includes(stigData.status)) {
                const findingIndex =
                  tabX[index][ColumnsX.findingStatus].search(stigData.status) +
                  stigData.status.length;
                const cipherChars = [...tabX[index][ColumnsX.findingStatus]]; // convert into array
                cipherChars[findingIndex] = `\n${stigData.vuln_num}\n`; // alter array
                tabX[index][ColumnsX.findingStatus] = cipherChars.join("");
              } else {
                tabX[index][ColumnsX.findingStatus] +=
                  `\n\n${stigData.status}\n${stigData.vuln_num}`;
              }
            } else if (cciRef && cciItem) {
              // New CCI
              newRow[ColumnsX.cci] = cci.text;
              newRow[ColumnsX.cciDesc] = cciItem.definition;
              newRow[ColumnsX.control] = cciRef;
              newRow[ColumnsX.check] =
                `${stig.title}\n${stigData.rule_id} / ${stigData.vuln_num}\n${stigData.check_check_content}`;
              newRow[ColumnsX.fixAction] =
                `${stig.title}\n${stigData.rule_id} / ${stigData.vuln_num}\n${stigData.fixtext}`;
              newRow[ColumnsX.findingStatus] = `${stigData.status}\n${stigData.vuln_num}`;

              tabX.push(newRow);
            }
          }
        }
      }
    }
    for (const row of tabX) {
      if (row[ColumnsX.findingStatus].includes("Open")) {
        row[ColumnsX.cciStatus] = "Fail";
      } else if (row[ColumnsX.findingStatus].includes("Not_Reviewed")) {
        row[ColumnsX.cciStatus] = "";
      } else if (row[ColumnsX.findingStatus].includes("NotAFinding")) {
        row[ColumnsX.cciStatus] = "Pass";
      } else if (row[ColumnsX.findingStatus].includes("Not_Applicable")) {
        row[ColumnsX.cciStatus] = "";
      }
    }
    sheetX.insertRows(2, tabX, "o");
  });

  return workbook;
}
