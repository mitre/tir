import * as fs from "fs";
import * as path from "path";
import { IncomingMessage } from "http";
import { pipeline } from "stream/promises";
import formidable from "formidable";
import * as yauzl from "yauzl";
import { System } from "../../../db/models";
import { processNessus } from "~/utils/nessus";
import { processChecklist } from "~/utils/checklist";
import { processChecklistV3 } from "~/utils/checklistV3";

export default defineEventHandler(async (event) => {
  const body = await processNodeRequest(event.node.req);
  const boundaryId = Array.isArray(body.BoundaryId) ? body.BoundaryId[0] : body.BoundaryId;
  if (!body.BoundaryId) {
    throw createError({
      statusCode: 400,
      statusMessage: "BoundaryId required.",
    });
  }
  if (!body.files || body.files.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No files uploaded.",
    });
  }
  const checkResult = await userCheck(event, undefined, boundaryId, undefined);
  if (!checkResult.BoundaryRoleId) {
    throw createError({
      statusCode: 403,
      statusMessage: "You do not have access to this Boundary.",
    });
  }
  if (checkResult.BoundaryRoleId === 4) {
    throw createError({
      statusCode: 403,
      statusMessage: "Reviewers are unable to edit Boundaries",
    });
  }

  const systemList = await System.findAll({ where: { BoundaryId: boundaryId } });
  const analyzableFiles: Array<{
    originalName: string;
    relativePath: string;
    path: string;
    ext: string;
  }> = [];

  const discoveredFiles: {
    originalName: string;
    relativePath: string;
    path: string;
    ext: string;
  }[] = [];

  const relativePaths = Array.isArray(body.relativePaths)
    ? body.relativePaths
    : body.relativePaths
      ? [body.relativePaths]
      : [];

  const config = useRuntimeConfig();
  const analysisId = crypto.randomUUID();

  const importsRoot = path.join(config.temp_folder, "imports");
  cleanupOldImports(importsRoot, 6);

  const sessionDir = path.join(importsRoot, analysisId);
  const uploadsDir = path.join(sessionDir, "uploads");
  const extractedDir = path.join(sessionDir, "extracted");

  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.mkdirSync(extractedDir, { recursive: true });

  console.log("Starting Upload");
  try {
    const uploadedFiles = body.files;
    const supportedExtensions = new Set([".xml", ".cklb", ".ckl", ".nessus", ".zip"]);

    for (let i = 0; i < uploadedFiles.length; i++) {
      const uploadedFile = uploadedFiles[i];
      const fileName = path.basename(uploadedFile.originalFilename);
      const ext = path.extname(fileName).toLowerCase();

      const relativePath = relativePaths[i] ?? fileName;
      const safeRelativepath = relativePath.replace(/^[/\\]+/, "");
      const savedPath = path.join(uploadsDir, safeRelativepath);

      fs.mkdirSync(path.dirname(savedPath), { recursive: true });
      fs.renameSync(uploadedFile.filepath, savedPath);
      discoveredFiles.push({
        originalName: fileName,
        relativePath,
        path: savedPath,
        ext,
      });
      if (ext === ".zip") {
        const extractedFiles = await extractFilesFromZip(savedPath, extractedDir);

        discoveredFiles.push(...extractedFiles);

        analyzableFiles.push(
          ...extractedFiles.filter((file) => supportedExtensions.has(file.ext)),
        );
        continue;
      }

      if (!supportedExtensions.has(ext)) {
        continue;
      }

      analyzableFiles.push({
        originalName: fileName,
        relativePath,
        path: savedPath,
        ext,
      });
    }

    if (analyzableFiles.length === 0) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
      throw createError({
        statusCode: 400,
        statusMessage:
          "No supported import files found. Supported types: .ckl, .cklb, .xml, .nessus, .zip.",
      });
    }

    const autoMatched: any[] = [];
    const needsInput: any[] = [];
    const notCredentialed: any[] = [];

    const isEStigImport = discoveredFiles.some((file) => isEvaluateStigLog(file.relativePath));
    const normalizedFiles = isEStigImport
      ? analyzableFiles.filter((file) => {
          return isChecklistPath(file.relativePath) && !isInsidePreviousFolder(file.relativePath);
        })
      : analyzableFiles;

    for (const file of normalizedFiles) {
      const content = fs.readFileSync(file.path, "utf-8");
      const sourceName = getSourceName(file.relativePath, file.originalName);
      if (file.ext === ".nessus") {
        const nessusResult = await processNessus(content, systemList);

        for (const host of nessusResult.hostArray) {
          if (host.systemMatch) {
            autoMatched.push({
              type: "nessus",
              fileName: file.originalName,
              systemId: host.systemId,
              hostName: host.name,
            });
          } else if (host.credentialed === "true") {
            const nessusFolder = `${file.originalName} - Nessus`;
            const existing = needsInput.find((item) => item.folder === nessusFolder);

            const nessusItem = {
              ...host,
              fileName: file.originalName,
              itemType: "nessus",
            };
            if (existing) {
              existing.files.push(nessusItem);
            } else {
              needsInput.push({
                folder: nessusFolder,
                files: [nessusItem],
              });
            }
          } else if (host.credentialed === "false") {
            const existing = notCredentialed.find((item) => item.file === sourceName);
            if (existing) {
              existing.name.push(host.name);
            } else {
              notCredentialed.push({
                file: sourceName,
                name: [host.name],
              });
            }
          }
        }
      } else if (file.ext === ".ckl") {
        const checklistResult = await processChecklist(content, systemList);
        if (checklistResult.systemMatch && checklistResult.systemId) {
          autoMatched.push({
            type: "ckl",
            fileName: file.originalName,
            systemId: checklistResult.systemId,
            systemName: checklistResult.systemName,
          });
        } else {
          const existing = needsInput.find((item) => item.folder === sourceName);
          if (existing) {
            existing.files.push({ name: file.originalName, itemType: "ckl" });
          } else {
            needsInput.push({
              folder: sourceName,
              files: [{ name: file.originalName, itemType: "ckl" }],
            });
          }
        }
      } else if (file.ext === ".cklb") {
        const checklistResult = await processChecklistV3(content, systemList);
        if (checklistResult.systemMatch && checklistResult.systemId) {
          autoMatched.push({
            type: "cklb",
            fileName: file.originalName,
            systemId: checklistResult.systemId,
            systemName: checklistResult.systemName,
          });
        } else {
          const existing = needsInput.find((item) => item.folder === sourceName);
          if (existing) {
            existing.files.push({ name: file.originalName, itemType: "cklb" });
          } else {
            needsInput.push({
              folder: sourceName,
              files: [{ name: file.originalName, itemType: "cklb" }],
            });
          }
        }
      } else if (file.ext === ".xml") {
        const existing = needsInput.find((item) => item.folder === sourceName);

        const xmlItem = {
          name: file.originalName,
          itemType: "xml",
        };
        if (existing) {
          existing.files?.push(xmlItem);
        } else {
          needsInput.push({
            folder: sourceName,
            files: [xmlItem],
          });
        }
      }
    }
    const analysis = {
      analysisId,
      boundaryId,
      createdAt: new Date().toISOString(),
      analyzableFiles: normalizedFiles,
      autoMatched,
      needsInput,
      notCredentialed,
    };

    fs.writeFileSync(
      path.join(sessionDir, "analysis.json"),
      JSON.stringify(analysis, null, 2),
      "utf8",
    );

    return {
      analysisId,
      filesDiscovered: normalizedFiles.length,
      autoMatched,
      needsInput,
      notCredentialed,
      hasAutoImports: autoMatched.length > 0,
      hasNeedsInput: needsInput.length > 0,
      hasNotCredentialed: notCredentialed.length > 0,
    };
  } catch (err) {
    fs.rmSync(sessionDir, { recursive: true, force: true });
    throw err;
  }
});

  const getSourceName = (relativePath: string, originalName: string): string => {
    const parts = relativePath.split(/[\\/]/).filter(Boolean);

    const checklistIndex = parts.findIndex(
      (part) => part.toLowerCase() === "checklist",
    );

    if (checklistIndex > 0) {
      return parts[checklistIndex - 1];
    }

    // individual file upload
    if (parts.length <= 1) {
      return originalName;
    }

    if (parts.length >= 3) {
      return parts[1];
    }

    // System/file
    return parts[0];
  };

const isEvaluateStigLog = (relativePath: string): boolean => {
  return path.basename(relativePath).toLowerCase() === "evaluate-stig.log";
};

const isChecklistPath = (relativePath: string): boolean => {
  return relativePath.split(/[\\/]/).some((part) => part.toLowerCase() === "checklist");
};

const isInsidePreviousFolder = (relativePath: string): boolean => {
  return relativePath.split(/[\\/]/).some((part) => part.toLowerCase() === "previous");
};

const cleanupOldImports = (importsRoot: string, maxAgeHours = 6) => {
  if (!fs.existsSync(importsRoot)) {
    return;
  }
  const now = Date.now();

  for (const entry of fs.readdirSync(importsRoot)) {
    const fullPath = path.join(importsRoot, entry);

    try {
      const stats = fs.statSync(fullPath);
      if (!stats.isDirectory()) {
        continue;
      }
      const ageHours = (now - stats.mtimeMs) / (1000 * 60 * 60);

      if (ageHours > maxAgeHours) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      }
    } catch {}
  }
};

const openZip = (zipPath: string): Promise<yauzl.ZipFile> =>
  new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err || !zipfile) {
        reject(err);
        return;
      }
      resolve(zipfile);
    });
  });

const safeJoin = (baseDir: string, entryName: string): string => {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(baseDir, entryName);

  if (!resolvedTarget.startsWith(resolvedBase + path.sep) && resolvedTarget !== resolvedBase) {
    throw new Error(`Unsafe zip entry path: ${entryName}`);
  }
  return resolvedTarget;
};

const extractFilesFromZip = async (
  sourceZip: string,
  outputDirectory: string,
): Promise<{ path: string; relativePath: string; originalName: string; ext: string }[]> => {
  const extractedFiles: {
    path: string;
    relativePath: string;
    originalName: string;
    ext: string;
  }[] = [];

  const zip = await openZip(sourceZip);

  await new Promise<void>((resolve, reject) => {
    zip.readEntry();

    zip.on("entry", (entry) => {
      if (entry.fileName.endsWith("/")) {
        zip.readEntry();
        return;
      }

      const safeEntryName = entry.fileName.replace(/^[/\\]+/, "");
      const destination = safeJoin(outputDirectory, safeEntryName);
      const ext = path.extname(entry.fileName).toLowerCase();

      fs.mkdirSync(path.dirname(destination), { recursive: true });

      zip.openReadStream(entry, (err, readStream) => {
        if (err || !readStream) {
          reject(err);
          return;
        }

        pipeline(readStream, fs.createWriteStream(destination))
          .then(() => {
            extractedFiles.push({
              path: destination,
              relativePath: safeEntryName,
              originalName: path.basename(entry.fileName),
              ext,
            });

            zip.readEntry();
          })
          .catch(reject);
      });
    });

    zip.on("end", resolve);
    zip.on("error", reject);
  });

  zip.close();
  return extractedFiles;
};

/**
 * @param {import('http').IncomingMessage} req
 */
function processNodeRequest(req: IncomingMessage): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    /** @see https://github.com/node-formidable/formidable/ */
    const form = formidable({
      multiples: true,
      maxFileSize: 350 * 1024 * 1024,
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