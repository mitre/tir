import * as fs from "fs";
import * as path from "path";
import { parseXml, XMLDocument } from "libxmljs";
import { importChecklist, importChecklistV3 } from "../../../utils/checklist";
import { ChecklistV3 } from "../../../utils/checklist_v3";
import { importXccdf } from "../../../utils/xccdf";
import { importNessus } from "~/server/utils/nessus";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { analysisId, assignments = [] } = body;

  if (!analysisId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing analysisId.",
    });
  }

  const config = useRuntimeConfig();
  const sessionDir = path.join(config.temp_folder, "imports", analysisId);
  const analysisPath = path.join(sessionDir, "analysis.json");

  if (!fs.existsSync(analysisPath)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Analysis not found.",
    });
  }

  const analysis = JSON.parse(fs.readFileSync(analysisPath, "utf8"));
  const analyzableFiles = analysis.analyzableFiles ?? [];
  const autoMatched = analysis.autoMatched ?? [];
  const receivedAssignments = assignments ?? [];
  const checkResult = await userCheck(event, undefined, analysis.boundaryId, undefined);

  if (!checkResult.BoundaryRoleId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Not a Member of this Boundary",
    });
  }
  if (checkResult.BoundaryRoleId === 4) {
    throw createError({
      statusCode: 403,
      statusMessage: "Reviewers are unable to edit Boundaries",
    });
  }
  for (const file of analyzableFiles) {
    const fileData = fs.readFileSync(file.path, "utf8");
    const assignment = receivedAssignments.find((a: any) => a.fileName === file.originalName);
    const autoMatch = autoMatched.find((a: any) => a.fileName === file.originalName);

    const systemId = assignment?.systemId ?? autoMatch?.systemId;

    if (file.ext === ".ckl") {
      if (!systemId) continue;
      await importChecklist(fileData, systemId);
    }

    if (file.ext === ".cklb") {
      if (!systemId) continue;
      const checklistData: ChecklistV3 = JSON.parse(fileData);
      await importChecklistV3(checklistData, systemId);
    }

    if (file.ext === ".nessus") {
      const autoMatches = autoMatched
        .filter((match: any) => match.type === "nessus" && match.fileName === file.originalName)
        .map((match: any) => ({
          SystemId: match.systemId,
          NessusHostName: match.hostName,
        }));

      const assignedMatches = receivedAssignments
        .filter(
          (assignment: any) =>
            assignment.type === "nessus" && assignment.fileName === file.originalName,
        )
        .map((assignment: any) => ({
          SystemId: assignment.systemId,
          NessusHostName: assignment.hostName,
        }));

      const nessusMatches = [...autoMatches, ...assignedMatches];
      if (nessusMatches.length > 0) {
        await importNessus(fileData, nessusMatches);
      }
    }

    if (file.ext === ".xml") {
      const assignment = receivedAssignments.find((a: any) => a.fileName === file.originalName);

      const systemId = assignment?.systemId;

      if (!systemId) {
        continue;
      }
      if (verifyXccdf(fileData)) {
        await importXccdf(fileData, systemId);
      }
    }
  }
  fs.rmSync(sessionDir, { recursive: true, force: true });

  return { success: true };
});

const verifyXccdf = (xmlData: string): boolean => {
  const xsdData = fs.readFileSync("./lib/schema/xccdf_1.2.xsd", "utf8");
  let xmlDoc;
  try {
    xmlDoc = parseXml(xmlData);
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: `Error parsing XML file.`,
    });
  }

  const xsdDoc: XMLDocument = parseXml(xsdData, { baseUrl: "./lib/schema/" });

  try {
    const validationResult = xmlDoc.validate(xsdDoc);

    if (typeof validationResult === "boolean") {
      if (validationResult) {
        console.log("XML is valid according to the XSD.");
        return true;
      } else {
        console.error("XML is invalid according to the XSD:");
        xmlDoc.validationErrors.forEach((error: any) => console.error(error));
      }
    }
  } catch (error) {
    console.error("Error during validation:", error);
    return false;
  }
  return false;
};