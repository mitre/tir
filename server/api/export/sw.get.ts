import ExcelJS from "exceljs";
import { Readable } from "node:stream";
import { sendStream } from "h3";
import { generateNessusSW } from "../../utils/excelExport/nessusExport";
import { NessusPlugin } from "~/db/models/nessusPlugin";
import { NessusReport } from "~/db/models/nessusReport";
import { NessusReportItem } from "~/db/models/nessusReportItem";
import { Boundary, BoundaryInterface, System, Tier } from "~/db/models";
import { SetCoverSheetStyle } from "../boundaries/ppsm.get";
import { DateTime } from "luxon";

export default defineEventHandler(async (event) => {

  const body = await getQuery(event);
  const checkResult = await userCheck(event, undefined, body.BoundaryId?.toString(), undefined);
  // Use query params to endpoint:
  //       BoundaryId     (number)
  if (!checkResult.BoundaryRoleId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  } else {
    const boundary = await Boundary.findOne({ where: { id: body.BoundaryId } });
    if (!boundary) {
      throw createError({
        statusCode: 400,
        statusMessage: `No Existing Boundary with specified ID found: \n` + body.BoundaryId,
      });
    }

    var thisCompany = ""
    const myTier = await Tier.findOne({
      where: {
        id: boundary.TierId
      }
    })
    if (!myTier) {
      throw createError({
        statusCode: 400,
        statusMessage: `No Existing Tier Parent with Boundary ID referenced: \n` + boundary.TierId,
      });
    }
    thisCompany = myTier.name + " "

    const systems = await System.findAll({ where: { BoundaryId: body.BoundaryId } });
    var reports: NessusReport[] = [];
    for (const system of systems) {
      console.log("Getting export for system", system.id);
      const report = await NessusReport.findOne({
        where: { SystemId: system.id },
        include: [
          {
            model: NessusReportItem,
            include: [
              {
                model: NessusPlugin,
              },
            ],
          },
        ],
      });
      if (report != null) {
        reports.push(report);
      } else {
        console.log("No report data for system", system.id);
      }
    }
    const nessusSW = await generateNessusSW(body.BoundaryId, reports);

    const workbook = new ExcelJS.Workbook();
    const coverSheet = workbook.addWorksheet("Cover Page");
    coverSheet.insertRow(2, ["", boundary.name.toUpperCase() + " HARDWARE/SOFTWARE LIST", "", ""]);
    coverSheet.insertRow(4, [
      "",
      "Document No:\nDate: " + DateTime.now().toISO() + "\nDocument Type: List\nData Maturity: Draft",
      "",
      "",
    ]);
    coverSheet.insertRow(6, [
      "",
      "Prepared by:\nOrganization\n\nAddress\nCity, STATE Z1PC0",
      "Prepared For:",
      "",
    ]);
    coverSheet.insertRow(8, ["", "<INSERT COPYRIGHT>", "", ""]);
    coverSheet.insertRow(9, ["", "<INSERT INFORMATION DISCLOSURE WARNING>", "", ""]);
    coverSheet.insertRow(11, ["", "<INSERT EXPORT CONTROLLED INFORMATION NOTICE>", "", ""]);
    coverSheet.insertRow(13, ["", "<INSERT " + thisCompany.toUpperCase() + "PROPRIETARY INFORMATION NOTICE>", "", ""]);
    coverSheet.insertRow(15, ["", "<INSERT IMPORTANT NOTICE>", "", ""]);
    SetCoverSheetStyle(coverSheet, "Calibri");

    coverSheet.mergeCells("B15:C15")
    coverSheet.getCell("B13").border = {
      bottom: { },
      right: { style: "medium" },
      left: { style: "medium" } 
    };
    coverSheet.getCell("B15").border = {
      bottom: { style: "medium" },
      right: { style: "medium" },
      left: { style: "medium" },
    };

    coverSheet.getCell("B13").border = { right: { style: "medium" }, left: { style: "medium" } };
    coverSheet.getCell("B14").border = { left: { style: "medium" } };
    coverSheet.getCell("C14").border = { right: { style: "medium" } };
    coverSheet.getRow(13).font = { name: "Calibri", size: 11, bold: true };
    coverSheet.getRow(15).font = { name: "Calibri", size: 11, bold: true };
    coverSheet.getRow(13).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    coverSheet.getRow(15).alignment = { horizontal: "center", vertical: "middle", wrapText: true };

    const swSheet = workbook.addWorksheet("SW List");
    var softwareFont = "Arial"
    swSheet.views = [{ zoomScale: 100 }];
    swSheet.columns = [
      {
        width: 51,
        style: {
          font: { name: softwareFont, size: 10 },
          alignment: { horizontal: "center", vertical: "top", wrapText: false },
        },
      },
      {
        width: 12,
        style: {
          font: { name: softwareFont, size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 31,
        style: {
          font: { name: softwareFont, size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: false },
        },
      },
      {
        width: 10,
        style: {
          font: { name: softwareFont, size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 10,
        style: {
          font: { name: softwareFont, size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 51,
        style: {
          font: { name: softwareFont, size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 13,
        style: {
          font: { name: softwareFont, size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 31,
        style: {
          font: { name: softwareFont, size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 18,
        style: {
          font: { name: softwareFont, size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 19,
        style: {
          font: { name: softwareFont, size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 21,
        style: {
          font: { name: softwareFont, size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 21,
        style: {
          font: { name: softwareFont, size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 18,
        style: {
          font: { name: softwareFont, size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      }
    ];

    const title: string[] = [
      thisCompany + "Proprietary Information", ,
      DateTime.now().toISO(),
    ];

    const general_headers: string[] = [
      "Name",
      "Vendor",
      "Version",
      "Type",
      "Count",
      "Hostname",
      "Approved",
      "Description",
      "IA or IA Enabled",
      "Certification Date",
      "Certification Report",
      "Protection Profile",
      "Sub Component",
    ];

    swSheet.insertRow(1, title);
    swSheet.insertRow(2, general_headers);

    const softwareArray: string[][] = [];
    var currentRow = 2;
    var skipTitle = true
    for (const sw of nessusSW) {
      if (skipTitle) {
        skipTitle = false
      } else {
        var hosts = sw[2].replace(/"+$/, '').replace(/^"+/, '')
        const newRow = [
          sw[0].replace(/"+$/, '').replace(/^"+/, ''),
          "",
          sw[1].replace(/"+$/, '').replace(/^"+/, ''),
          "",
          (hosts.split(",")).length,
          hosts,
          "",
          "Nessus Plugin ID: " + sw[3],
          "",
          "",
          "",
          "",
          sw[4]
        ];
        softwareArray.push(newRow);
        currentRow++;
      }
    }

    const topRow = swSheet.getRow(1);
    topRow.eachCell({ includeEmpty: true }, (topCell) => {
      topCell.font = { name: "Arial", size: 16, bold: true };
      topCell.alignment = { horizontal: "left", vertical: "middle", wrapText: false };
      topCell.border = {
        top: { style: "thin" },
        right: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
      };
    });

    swSheet.insertRows(3, softwareArray, "o")
    for (let i = 2; i < nessusSW.length + 3; i++) {
      const row = swSheet.getRow(i);
      if (i == 2) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.font = { name: "Arial", size: 8, bold: true };
          cell.alignment = { horizontal: "center", vertical: "top", wrapText: false };
          cell.border = {
            top: { style: "thin" },
            right: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
          };
        });
      } else {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.font = { name: "Arial", size: 8, bold: false };
          cell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
          cell.border = {
            top: { style: "thin" },
            right: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
          };
        });
      }
    }
    swSheet.autoFilter = "A2:L" + (nessusSW.length + 1);

    // Create and format Hardware Sheet
    const hwSheet = workbook.addWorksheet("HW List");
    hwSheet.insertRow(1, ["Device Name", "Mfg", "Part Number", "Description", "Qty", "U/M", "Purpose", "IA or IA Enabled", "CC Certification Date", "CC Certification Report", "Engineering Notes", "Serial Number"]);
    for (let i = 1; i <= 5; i++) {
      for (let j = 1; j <= 12; j++) {
        hwSheet.getRow(i).getCell(j).font = { name: "Calibri", size: 11, bold: (i == 1), color: {argb: (i == 1) ? "FFFFFF" : "000000"} };
        hwSheet.getRow(i).getCell(j).alignment = { horizontal: "left", vertical: "middle", wrapText: true };
        hwSheet.getRow(i).getCell(j).border = {
          top: { style: "thin" },
          right: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
        };
        hwSheet.getRow(i).getCell(j).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: (i == 1) ? "4472C4" : "FFFFFF" } 
        };
      }
      hwSheet.getRow(i).height = (i == 1) ? 30 : 20;
    }
  
    // Width of Hardware Sheet Columns
    const widthCells: [number, number][] = [
      [1, 21],
      [2, 14],
      [3, 21],
      [4, 31],
      [5, 6],
      [6, 7],
      [7, 21],
      [8, 18],
      [9, 20],
      [10, 20],
      [11, 22],
      [12, 22],
    ];
    widthCells.forEach(([cellK, cellV]) => {
      hwSheet.getColumn(cellK).width = cellV;
    });

    const myBuffer = await workbook.xlsx.writeBuffer();
    var fileName = boundary.name.replaceAll(" ", "") + "_SW_HW_Export.xlsx";
    
    const stream = new Readable();
    stream.push(myBuffer);
    stream.push(null);

    setResponseHeader(event, "Content-Disposition", 'attachment; filename="' + fileName + '"');
    setResponseHeader(event, "Content-Type", "application/octet-stream");
    logger.info({
      service: "Boundary",
      message: `${body.userEmail} Downloaded Software Hardware Data for boundary ID: ${body.BoundaryId}`,
    });
    return sendStream(event, stream);
  }
});
