import * as fs from "fs";
import * as path from "path";
import { IncomingMessage } from "http";
import formidable from "formidable";
import Excel from "exceljs";

import {
  CommonControlProvider,
  ComplianceStatus,
  ConMonMethod,
  Control,
  ControlEnhancement,
  ControlNumber,
  ControlRecord,
  ControlRecordItem,
  ControlRevision,
  FrequencyType,
  ImplementationStatus,
  RiskLevel,
  SecurityControlDesignation,
  TestMethod,
} from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await proccessNodeRequest(event.node.req);
  const query = await getQuery(event);
  const isPreview = false;
  const config = useRuntimeConfig();
  const uploadedFiles = Array.isArray(body.file) ? body.file : [body.file];
  const warnings: { controlNumber: string; field: string; value: any; message: string }[] = [];
  if (query === undefined || query.boundaryId === undefined) {
    return "Must specify boundary ID parameter";
  }

  const checkResult = await userCheck(event, undefined, query.boundaryId?.toString(), undefined);

  if (![1, 2, 3].includes(checkResult.BoundaryRoleId)) return;

  try {
    let totalUpdated = 0;

    // Preload lookup maps
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

    const complianceStatusMap = new Map(complianceStatuses.map((d) => [d.status, d.id]));
    const implementationStatusMap = new Map(implementationStatuses.map((d) => [d.status, d.id]));
    const commonControlProviderMap = new Map(commonControlProviders.map((d) => [d.provider, d.id]));
    const securityControlDesignationMap = new Map(
      securityControlDesignations.map((d) => [d.designation, d.id]),
    );
    const testMethodMap = new Map(testMethods.map((d) => [d.method, d.id]));
    const frequencyMap = new Map(frequencyTypes.map((d) => [d.frequency, d.id]));
    const conMonMethodMap = new Map(conMonMethods.map((d) => [d.method, d.id]));
    const riskLevelMap = new Map(riskLevels.map((d) => [d.level, d.id]));

    function mapValueToId(excelKey: string, value: any) {
      if (!value) return null;
      switch (excelKey) {
        case "complianceStatus":
          return complianceStatusMap.get(value) ?? null;
        case "implementationStatus":
          return implementationStatusMap.get(value) ?? null;
        case "commonControlProvider":
          return commonControlProviderMap.get(value) ?? null;
        case "securityControlDesignation":
          return securityControlDesignationMap.get(value) ?? null;
        case "testMethod":
          return testMethodMap.get(value) ?? null;
        case "frequency":
          return frequencyMap.get(value) ?? null;
        case "method":
          return conMonMethodMap.get(value) ?? null;
        case "severity":
        case "relevanceOfThreat":
        case "likelihood":
        case "impact":
        case "residualRiskLevel":
          return riskLevelMap.get(value) ?? null;
        case "estimatedCompletionDate":
          return parseExcelDate(value);
        default:
          return sanitizeValue(value);
      }
    }

    for (const file of uploadedFiles) {
      const ext = path.extname(file.originalFilename).toLowerCase();
      if (![".xlsx", ".xlsm"].includes(ext))
        throw new Error(`Unsupported file type: ${file.originalFilename}`);

      const newFileName = path.join(config.temp_folder, file.originalFilename);
      await fs.promises.mkdir(path.dirname(newFileName), { recursive: true });
      await fs.promises.rename(file.filepath, newFileName);

      const excelData = await parseExcelFile(newFileName);
      const filteredData = excelData.filter((row) =>
        /^[A-Z]{2}-\d+(\(\d+\))?$/.test((row.controlNumber || "").trim()),
      );
      const normalizeControlNumber = (num?: string) => {
        if (!num) return "";
        return num.replace(/\s+/g, "").trim().toUpperCase();
      };
      const cnList = filteredData.map((r) => normalizeControlNumber(r.controlNumber));

      const controlRecordItems = await ControlRecordItem.findAll({
        include: [
          {
            model: Control,
            attributes: ["id"],
            include: [{ model: ControlNumber, attributes: ["number"] }],
          },
          {
            model: ControlEnhancement,
            as: "ControlEnhancement",
            attributes: ["enhancementIdentifier"],
          },
          {
            model: ControlRecord,
            where: { BoundaryId: query.boundaryId },
            attributes: ["id"],
            include: [
              {
                model: ControlRevision,
                attributes: ["id", "name"],
                where: { name: `rev${query.version}` },
              },
            ],
          },
        ],
      });

      const controlMap = new Map<string, ControlRecordItem>();
      for (const item of controlRecordItems) {
        const cn = normalizeControlNumber(item.Control?.ControlNumber?.number);
        const enh = normalizeControlNumber(item.ControlEnhancement?.enhancementIdentifier);
        if (enh) controlMap.set(enh, item);
        else if (cn) controlMap.set(cn, item);
      }
      const itemsToSave: Promise<any>[] = [];

      for (const row of filteredData) {
        const cn = normalizeControlNumber(row.controlNumber);
        const item = controlMap.get(cn);
        if (!item) {
          logger.info({
            service: "SCTM",
            message: `No ControlRecordItem found for: ${cn}`,
          });
          continue;
        }
        const complianceStatusValue = mapValueToId("complianceStatus", row.complianceStatus);
        const isNotApplicable = complianceStatusValue === 3;
        const allowedWhenNA = [
          "complianceStatus",
          "implementationNarrative",
          "implementationStatus",
        ];

        const changes = {};
        for (const [excelKey, dbKey] of Object.entries(FIELD_MAP)) {
          if (!(excelKey in row)) continue;

          if (isNotApplicable && !allowedWhenNA.includes(excelKey)) {
            warnings.push({
              controlNumber: cn,
              field: excelKey,
              value: row[excelKey],
              message: `Field "${excelKey}" was ignored because Compliance Status is "Not Applicable".`,
            });
            continue;
          }
          const oldValue = item.getDataValue(dbKey);
          const newValue = mapValueToId(excelKey, row[excelKey]);
          const isDropdown = [
            "complianceStatus",
            "implementationStatus",
            "commonControlProvider",
            "securityControlDesignation",
            "testMethod",
            "frequency",
            "method",
            "severity",
            "relevanceOfThreat",
            "likelihood",
            "impact",
            "residualRiskLevel",
          ].includes(excelKey);

          if (isDropdown) {
            if (row[excelKey] === "" || row[excelKey] == null) {
              if (oldValue !== null) {
                changes[dbKey] = { old: oldValue, new: null };
                item.setDataValue(dbKey, null);
              }
              continue;
            }
            if (newValue === null) {
              warnings.push({
                controlNumber: cn,
                field: excelKey,
                value: row[excelKey],
                message: `Unrecognized value "${row[excelKey]}" for field "${excelKey}".`,
              });
              continue;
            }
          }

          if (oldValue !== newValue) {
            changes[dbKey] = { old: oldValue, new: newValue };
            item.setDataValue(dbKey, newValue);
          }
        }
        if (!isPreview) itemsToSave.push(item.save());
      }

      const itemsNotInExcel = controlRecordItems.filter((item) => {
        const cn = normalizeControlNumber(item.Control?.ControlNumber?.number || "");
        const enh = normalizeControlNumber(item.ControlEnhancement?.enhancementIdentifier);
        const key = enh || cn;
        return !cnList.includes(key);
      });

      for (const item of itemsNotInExcel) {
        const complianceStatusKey = FIELD_MAP.complianceStatus;
        const implementationNarrativeKey = FIELD_MAP.implementationNarrative;
        const implementationStatusKey = FIELD_MAP.implementationStatus;

        // Set Compliance Status to Not Applicable (id = 3)
        item.setDataValue("ComplianceStatusId", 3);

        // Clear all other fields except Implementation Narrative and Implementation Status
        for (const [excelKey, dbKey] of Object.entries(FIELD_MAP)) {
          if (
            ![complianceStatusKey, implementationNarrativeKey, implementationStatusKey].includes(
              dbKey,
            )
          ) {
            item.setDataValue(dbKey, null);
          }
        }

        if (!isPreview) itemsToSave.push(item.save());
      }

      // Batch save all changes for this file
      const batchSize = 200;
      for (let i = 0; i < itemsToSave.length; i += batchSize) {
        await Promise.all(itemsToSave.slice(i, i + batchSize));
        totalUpdated += Math.min(batchSize, itemsToSave.length - i);
      }

      logger.info({
        service: "SCTM",
        message: "Processed File",
      });
      if (fs.existsSync(newFileName)) await fs.promises.unlink(newFileName);
    }

    return {
      mode: isPreview ? "preview" : "update",
      updatedCount: totalUpdated,
      warnings,
    };
  } catch (err) {
    logger.info({
      service: "SCTM",
      message: `Error importing file:", ${err}`,
    });
  }
});

const FIELD_MAP = {
  complianceStatus: "ComplianceStatusId",
  implementationStatus: "ImplementationStatusId",
  commonControlProvider: "CommonControlProviderId",
  securityControlDesignation: "SecurityControlDesignationId",
  testMethod: "TestMethodId",
  naJustification: "naJustification",
  estimatedCompletionDate: "estimatedCompletionDate",
  implementationNarrative: "implementationNarrative",
  responsibleEntities: "responsibleEntities",
  criticality: "criticality",
  frequency: "FrequencyTypeId",
  method: "ConMonMethodId",
  reporting: "reporting",
  tracking: "tracking",
  slcmComments: "conmonComments",
  severity: "SeverityId",
  relevanceOfThreat: "RelevanceOfThreatId",
  likelihood: "LikelihoodId",
  impact: "ImpactId",
  residualRiskLevel: "ResidualRiskLevelId",
  vulnerabilitySummary: "vulnerabilitySummary",
  mitigations: "mitigations",
  impactDescription: "impactDescription",
  recommendations: "recommendations",
};

const HEADER_MAP = [
  "controlNumber",
  "title",
  "controlInformation",
  "complianceStatus",
  "implementationStatus",
  "commonControlProvider",
  "securityControlDesignation",
  "testMethod",
  "naJustification",
  "estimatedCompletionDate",
  "implementationNarrative",
  "responsibleEntities",
  "column13", // empty/unused
  "criticality",
  "frequency",
  "method",
  "reporting",
  "tracking",
  "slcmComments",
  "column20", // empty/unused
  "severity",
  "relevanceOfThreat",
  "likelihood",
  "impact",
  "residualRiskLevel",
  "vulnerabilitySummary",
  "mitigations",
  "impactDescription",
  "recommendations",
  "column30", // empty/unused
];

function parseExcelDate(value: any) {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString();
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function sanitizeValue(value: any) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return Object.values(value).join(", ");
  return value;
}

async function parseExcelFile(filePath: string) {
  logger.info({ service: "SCTM", message: "parseExcelFile: start streaming read" });

  const data: any[] = [];
  const workbookReader = new Excel.stream.xlsx.WorkbookReader(filePath, {
    worksheets: "emit",
    sharedStrings: "cache",
    hyperlinks: "ignore",
    styles: "ignore",
  });

  const controlRegex = /^[A-Z]{2}-\d+(\(\d+\))?$/;

  for await (const worksheetReader of workbookReader) {
    for await (const row of worksheetReader) {
      const controlNumber = String(row.getCell(1).value || "")
        .replace(/\s+/g, "")
        .trim()
        .toUpperCase();

      if (!controlRegex.test(controlNumber)) continue;

      const rowData: Record<string, any> = {};

      for (let colNumber = 1; colNumber <= HEADER_MAP.length; colNumber++) {
        const key = HEADER_MAP[colNumber - 1];
        if (!key) continue;

        rowData[key] = row.getCell(colNumber).value;
      }

      data.push(rowData);
    }
  }
  logger.info({
    service: "SCTM",
    message: `parseExcelFile: done, rows parsed=${data.length}`,
  });

  return data;
}

function proccessNodeRequest(req: IncomingMessage): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    /** @see https://github.com/node-formidable/formidable/ */
    const form = formidable({
      multiples: true,
      maxFileSize: 500 * 1024 * 1024,
    });

    form.parse(req, (error, fields: Record<string, any>, files: Record<string, any>) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({ ...fields, ...files });
    });
  });
}
