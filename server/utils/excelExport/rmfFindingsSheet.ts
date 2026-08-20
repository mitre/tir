import ExcelJS from "exceljs";
import {
  Boundary,
  Classification,
  CciItem,
  CciReference,
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
  ComplianceStatus,
} from "../../../db/models";

export async function generateRmfFindings(
  boundaryId: number,
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sheet1");
  sheet.views = [{ zoomScale: 100 }];

  sheet.columns = [
    {
      width: 12,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "center", vertical: "top", wrapText: true },
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
      width: 25,
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
      width: 30,
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
      width: 28,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 14,
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
      width: 51,
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
      width: 52,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 52,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 70,
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
      width: 52,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
    {
      width: 52,
      style: {
        font: { name: "Calibri", size: 10 },
        alignment: { horizontal: "left", vertical: "top", wrapText: true },
      },
    },
  ];

  const headers: string[] = [
    "Item Number",
    "Vulnerability/Finding/V-Key/CVE",
    "System Affected",
    "Control",
    "CCI",
    "Source",
    "STIG ID",
    "Category",
    "Severity",
    "Vuln Description",
    "Status",
    "Check",
    "Fix Action",
    "Findings Details",
    "Recommendation",
    "Mitigations",
    "Notes",
  ];
  enum Columns {
    itemId,
    securityKey,
    systemsAffected,
    control,
    cci,
    source,
    stigId,
    catFromSeverity,
    rawSeverity,
    vuln,
    status,
    check,
    fix,
    findingDetails,
    recommendations,
    mitigations,
    notes,
  }
  sheet.insertRow(1, headers);

  sheet.getRow(1).font = { name: "Times New Roman", size: 12, bold: true };
  sheet.getRow(1).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  sheet.getRow(1).height = 40;
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D9D9D9" } };
  sheet.getRow(1).border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
  sheet.autoFilter = "A1:Q1";

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
  const controlToResourceMap = new Map<string, Map<string, Set<string>>>();

  for (const stig of stigArray) {
    for (const stigData of stig.StigData) {
      const status = stigData.status;
      const vKey = stigData.vuln_num;
      const title = stig.title || "";
      const displayValue = title ? `${vKey} - ${title}` : vKey;
      const resourceRequired = stigData.EvaluationItems[0].Resources_Required || "";
      const cciIds = stigData.StigIdents.map((c: any) => c.text);

      for (const cciId of cciIds) {
        const cciItem = cciItemMap.get(cciId);
        const cciRef = cciItem?.CciReferences?.[0]?.index ?? "";
        const normalizedControl = cciRef.replace(/\s+/g, "");
        if (!normalizedControl) continue;

        if (!controlToStatusMap.has(normalizedControl)) {
          controlToStatusMap.set(normalizedControl, new Map());
        }
        if (!controlToResourceMap.has(normalizedControl)) {
          controlToResourceMap.set(normalizedControl, new Map());
        }
        const statusMap = controlToStatusMap.get(normalizedControl)!;
        if (!statusMap.has(status)) {
          statusMap.set(status, new Set());
        }
        statusMap.get(status)!.add(displayValue);

        if (resourceRequired) {
          const resourceMap = controlToResourceMap.get(normalizedControl)!;
          if (!resourceMap.has(vKey)) {
            resourceMap.set(vKey, new Set());
          }
          resourceMap.get(vKey)!.add(resourceRequired);
        }
      }
    }
  }

  const revName = `rev${boundary?.PolicyDocument?.version}`;
  const revision = await ControlRevision.findOne({ where: { name: revName } });

  const results = await ControlRecordItem.findAll({
    include: [
      {
        model: ControlRecord,
        attributes: ["ControlFamilyId"],
        where: { BoundaryId: boundaryId, ControlRevisionId: revision?.id },
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

  const [complianceStatuses] = await Promise.all([
    ComplianceStatus.findAll(),
  ]);

  const complianceStatusMap = new Map(complianceStatuses.map((d) => [d.id, d.status]));
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
  const rmfArray: string[][] = [];

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

  function normalizeControlId(raw: string) {
    if (!raw) return "";
    const cleaned = raw.toUpperCase().replace(/\s+/g, "");
    const match = cleaned.match(/^([A-Z]{2,3}-\d+)(\(\d+\))?/);
    if (!match) return cleaned;
    return match[1] + (match[2] || "");
  }

  for (const [, item] of sortedResults.entries()) {
    const newRow: string[] = new Array(Object.keys(Columns).length / 2).fill("");
    newRow[Columns.itemId] = (rmfArray.length + 1).toString();

    let controlNumber = "";
    let cci = "";
    let technicalAssessmentStatus = "";
    let technicalAssessmentComments = "";
    if (item.ControlEnhancementId && item.ControlEnhancement) {
      controlNumber = item.ControlEnhancement.enhancementIdentifier || "";
      newRow[Columns.vuln] = [
        enhancementStatementsMap.get(item.ControlEnhancementId)
          ? `Control Information: ${enhancementStatementsMap.get(item.ControlEnhancementId)}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

      const normalizedControlNumber = normalizeControlId(
        item.ControlEnhancement.enhancementIdentifier,
      );
      const statusMap = controlToStatusMap.get(normalizedControlNumber);
      const cciIds = cciMap.get(normalizedControlNumber) || [];

      if (statusMap && statusMap.size > 0) {
        const lines: string[] = [];
        for (const [status, vKeys] of statusMap) {
          lines.push(status, ...Array.from(vKeys), "");
        }
        technicalAssessmentComments = lines.join("\n");
        if (lines.some((line) => line.trim() === "Open")) {
          technicalAssessmentStatus = "Non-Compliant";
        } else if (lines.some((line) => line.trim() === "Not_Reviewed")) {
          technicalAssessmentStatus = "Not Reviewed";
        } else if (lines.some((line) => line.trim() === "NotAFinding")) {
          technicalAssessmentStatus = "Compliant";
        } else if (lines.some((line) => line.trim() === "Not_Applicable")) {
          technicalAssessmentStatus = "Not-Applicable";
        } else {
          technicalAssessmentStatus = "Not-Applicable";
        }

        for (const cciId of cciIds) {
          const cciVKeys: { vKey: string; status: string }[] = [];
          for (const [status, vKeys] of statusMap) {
            for (const vKey of vKeys) {
              const originalVKey = vKey.split(" - ")[0];
              const stig = stigArray.find((stig) =>
                stig.StigData.some(
                  (stigData) =>
                    stigData.vuln_num === originalVKey &&
                    stigData.StigIdents.some((stigIdent) => stigIdent.text === cciId),
                ),
              );
              if (stig) {
                cciVKeys.push({ vKey: originalVKey, status });
              }
            }
          }
          if (cciVKeys.length === 0) {
            continue;
          }
                    let cciStatus = "Empty";
          if (cciVKeys.some((cciVKey) => cciVKey.status === "Open")) {
            cciStatus = "Non-Compliant";
          } else if (cciVKeys.some((cciVKey) => cciVKey.status === "Not_Reviewed")) {
            cciStatus = "Not Reviewed";
          } else if (cciVKeys.some((cciVKey) => cciVKey.status === "NotAFinding")) {
            cciStatus = "Compliant";
          } else if (cciVKeys.some((cciVKey) => cciVKey.status === "Not_Applicable")) {
            cciStatus = "Not-Applicable";
          } else {
            cciStatus = "Not-Applicable";
          }

          cci += `  ${cciId}: ${cciStatus || "Not Reviewed"}\n`;

        }
      } else {
        continue;
      }
    } else if (item.Control && item.Control.ControlNumber) {
      controlNumber = item.Control.ControlNumber?.number || "";
      newRow[Columns.vuln] = [
        controlStatementsMap.get(item.ControlId)
          ? `Control Information: ${controlStatementsMap.get(item.ControlId)}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

      const normalizedControlNumber = normalizeControlId(item.Control.ControlNumber.number);
      const statusMap = controlToStatusMap.get(normalizedControlNumber);
      const cciIds = cciMap.get(normalizedControlNumber) || [];

      if (statusMap && statusMap.size > 0) {
        const lines: string[] = [];
        for (const [status, vKeys] of statusMap) {
          lines.push(status, ...Array.from(vKeys), "");
        }
        technicalAssessmentComments = lines.join("\n");
        if (lines.some((line) => line.trim() === "Open")) {
          technicalAssessmentStatus = "Non-Compliant";
        } else if (lines.some((line) => line.trim() === "Not_Reviewed")) {
          technicalAssessmentStatus = "Not Reviewed";
        } else if (lines.some((line) => line.trim() === "NotAFinding")) {
          technicalAssessmentStatus = "Compliant";
        } else if (lines.some((line) => line.trim() === "Not_Applicable")) {
          technicalAssessmentStatus = "Not-Applicable";
        } else {
          technicalAssessmentStatus = "Not-Applicable";
        }

        for (const cciId of cciIds) {
          const cciVKeys: { vKey: string; status: string }[] = [];
          for (const [status, vKeys] of statusMap) {
            for (const vKey of vKeys) {
              const originalVKey = vKey.split(" - ")[0];
              const stig = stigArray.find((stig) =>
                stig.StigData.some(
                  (stigData) =>
                    stigData.vuln_num === originalVKey &&
                    stigData.StigIdents.some((stigIdent) => stigIdent.text === cciId),
                ),
              );
              if (stig) {
                cciVKeys.push({ vKey: originalVKey, status });
              }
            }
          }
          if (cciVKeys.length === 0) {
            continue;
          }
          let cciStatus = "Empty";
          if (cciVKeys.some((cciVKey) => cciVKey.status === "Open")) {
            cciStatus = "Non-Compliant";
          } else if (cciVKeys.some((cciVKey) => cciVKey.status === "Not_Reviewed")) {
            cciStatus = "Not Reviewed";
          } else if (cciVKeys.some((cciVKey) => cciVKey.status === "NotAFinding")) {
            cciStatus = "Compliant";
          } else if (cciVKeys.some((cciVKey) => cciVKey.status === "Not_Applicable")) {
            cciStatus = "Not-Applicable";
          } else {
            cciStatus = "Not-Applicable";
          }

          cci += `  ${cciId}: ${cciStatus || "Not Reviewed"}\n`;
        }
      } else {
        continue;
      }
    }

    newRow[Columns.securityKey] = controlNumber;
    newRow[Columns.systemsAffected] = boundary.name || "N/A";
    newRow[Columns.control] = item.Control ? `Control Title: ${item.Control.title}` : "";
    newRow[Columns.cci] = cci;
    newRow[Columns.source] = boundary?.PolicyDocument?.title || "N/A";

    
    const technicalAssessmentStatusSection = `Technical Assessment Status: ${technicalAssessmentStatus}`;
    const findingStatusSection = `Finding Status:\n${technicalAssessmentComments}`;
    const auditStatus = [
      `Audit Status: ${complianceStatusMap.get(item.AuditControlStatusId ?? -1)}`,
      item.auditor,
      formatDate(item.auditDate),
      item.auditComments,
    ]
      .filter(Boolean)
      .join("\n");

    const assessmentStatus = [
      `Assessment Status: ${complianceStatusMap.get(item.AssessorControlStatusId ?? -1)}`,
      item.assessor,
      formatDate(item.assessorDate),
      item.assessorComments,
    ]
      .filter(Boolean)
      .join("\n");

    const statusSummary = [technicalAssessmentStatusSection, findingStatusSection, auditStatus, assessmentStatus].join(
      "\n\n",
    );

    newRow[Columns.findingDetails] += statusSummary;

    if (
      (newRow[Columns.findingDetails].includes("Not-Applicable") ||
        newRow[Columns.findingDetails].includes("Compliant")) &&
      !newRow[Columns.findingDetails].includes("Non-Compliant") &&
      !newRow[Columns.findingDetails].includes("Not Reviewed")
    ) {
      continue;
    }

    newRow[Columns.mitigations] = item.mitigations || "";
    newRow[Columns.recommendations] = item.recommendations || "";

    rmfArray.push(newRow);
  }
  for (const row of rmfArray) {
    const finalStatus = row[Columns.findingDetails] || "";

    if (finalStatus.includes("Non-Compliant")) {
      row[Columns.status] += "Non-Compliant\n";
    } else if (finalStatus.includes("Not Reviewed")) {
      row[Columns.status] += "Not Reviewed\n";
    } else if (finalStatus.includes("Compliant")) {
      row[Columns.status] += "Compliant\n";
    } else if (finalStatus.includes("Not-Applicable")) {
      row[Columns.status] += "Not-Applicable\n";
    } else {
      row[Columns.status] += "Not-Applicable\n";
    }
  }

 

  // export color in per classification, header, and fotter
  let classificationString = `${boundary?.Classification?.dataValues.name}`;
  if (boundary?.caveats) {
    classificationString += `// ${boundary?.caveats}`;
  }

  sheet.headerFooter.oddHeader = classificationString;
  sheet.headerFooter.oddFooter = classificationString;

  sheet.insertRows(2, rmfArray, "o");

  return workbook;
}
