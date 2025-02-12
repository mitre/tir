import * as fs from "fs";
import * as path from "path";
import { IncomingMessage } from "http";
import formidable from "formidable";
import AdmZip from "adm-zip";
import { parseStringPromise } from "xml2js";
import { DateTime } from "luxon";
import {
  Assessment,
  AssessmentItem,
  Boundary,
  BoundaryInterface,
  Evaluation,
  EvaluationItem,
  PolicyDocument,
  Stig_StigData,
  Stig_System,
  StigData_StigIdent,
  StigIdent,
  StigLibrary,
  Tier,
  Tier_User,
  User,
} from "../../../db/models";
import { System } from "../../../db/models/system";
import { Stig } from "../../../db/models/stig";
import { StigData } from "../../../db/models/stigData";
import { StigOverride } from "~/db/models/stigOverride";
import { BoundaryLookup, BoundaryExportObject } from "../../utils/exporter";
import { subscribe } from "diagnostics_channel";
import { log } from "console";
import { LessThanEqualsFilter } from "ldapjs";

interface ISystemLookup {
  id: number;
  name: string;
  role: string;
  assetType: string;
  marking: string;
  hostName: string;
  hostIP: string;
  hostMAC: string;
  hostGUID: string;
  hostFQDN: string;
  targetComment: string;
  techArea: string;
  targetKey: string;
  stigGUID: string;
  webOrDatabase: boolean;
  webDBSite: string;
  webDBInstance: string;

  lastUpdate: string;
  creationDate: string;

  Stigs: Stig[];
}

export default defineEventHandler(async (event) => {
  const body = await proccessNodeRequest(event.node.req);
  const query = await getQuery(event);
  const config = useRuntimeConfig();
  const uploadedFiles = body.files;

  if (query === undefined || query.id === undefined) {
    return "Must specify boundary ID parameter";
  }

  const checkResult = await userCheck(event, undefined, query.id?.toString(), undefined);

  var DatumLookupTable: { [id: number]: number } = {};
  var StigLookupTable: { [id: number]: number } = {};
  var StigReference: { [id: number]: Stig } = {};
  var missingStigs = [];
  var CachedStig_StigData: { [id: number]: number[] } = {};
  var SystemAssessmentStigs: { [id: number]: number[] } = {};
  var SucceededStigs = [];
  var SystemLookupTable: { [id: number]: number } = {};


  // Order of operations
  // 1. Iterate Files
  // 2. Populate Lookup Data
  // 3. Create Boundary
  // 4. Create evaluations
  // 5. Create Each System
  // 6. Create Assessments
  // 7. Add Assessment Items
  // 8. Create Overrides
  if (
    checkResult.BoundaryRoleId === 1 ||
    checkResult.BoundaryRoleId === 2 ||
    checkResult.BoundaryRoleId === 3
  ) {
    try 
    {
      let importBoundary = <BoundaryExportObject>{};
      // 1. Iterate Files
      for (let i = 0; i < uploadedFiles.length; i++) {
        let fileList: string[];

        const newFileName = path.join(config.temp_folder, uploadedFiles[i].originalFilename);
        const newDir = path.dirname(newFileName);
        if (!fs.existsSync(newDir)) {
          fs.mkdirSync(newDir, { recursive: true });
        }

        fs.renameSync(uploadedFiles[i].filepath, newFileName);
        if (path.extname(newFileName) === ".zip") {
          fileList = await processZip(newFileName, config.temp_folder);
        } else {
          fileList = [newFileName];
        }
        for (let j = 0; j < fileList.length; j++) {
          const baseFilename = path.basename(fileList[j]);
          const fileData = fs.readFileSync(fileList[j], "utf-8");
          const jsonObj = await JSON.parse(fileData);
          if (path.extname(baseFilename) === ".json") {
            importBoundary = jsonObj;
          }
          fs.rmSync(fileList[j]);
        }
      }
      // end for files loop

      // 2) Populate Lookup Data
      // Verify there is an existing boundary to house the imported data
      const ExistingBoundary = await Boundary.findOne({ where: { id: query.id } });
      if (!ExistingBoundary) {
        console.log("No Existing Boundary with specified ID found!");
        throw createError({
          statusCode: 400,
          statusMessage: `No Existing Boundary with specified ID found: \n` + query.id,
        });
      } else {
        const boundary = await SetLookups(importBoundary);
        if (!boundary) {
          throw createError({
            statusCode: 400,
            statusMessage: `Error with Boundary Lookup: \n` + query.id,
          });
        }
        // Create PolicyDocument and StigLibrary Lookups (they must exist as well as part of a loaded library and policy doc)
        const MatchingDocument = await PolicyDocument.findOne({
          where: { title: boundary.PolicyDocumentName },
        });
        const MatchingLibrary = await StigLibrary.findOne({
          where: { id: ExistingBoundary.StigLibraryId },
        });

        if (!MatchingLibrary) {
          throw createError({
            statusCode: 400,
            statusMessage:
              `Boundary references a Stig Library Hash not present in this environment. Please load ` +
              boundary.StigLibraryName +
              `(` +
              boundary.StigLibraryHash +
              `)`,
          });
        }
        // Stores Stig_StigData information for lookup
        var availableIDs;

        for (const assessment of boundary.Assessments) {
          if (assessment.succeededByAssessmentId == null) {
              
            // ITERATE SYSTEMS IN BOUNDARY
            // Loop through imported Boundary systems and create assessment data
            var missingStig = false;
            var foundMatch = undefined;

            // If STIG in assessment is valid, Create STIG. and STIG_DATUM LIST Lookup Charts
            if (assessment.Stig) {
              if (assessment.SystemId in SystemAssessmentStigs) {
                let currentStigs = SystemAssessmentStigs[assessment.SystemId];
                currentStigs.push(assessment.Stig.id);
                // console.log("Adding System Assessment Stig", assessment.SystemId, ", with Stig", assessment.Stig.id)
                SystemAssessmentStigs[assessment.SystemId] = currentStigs;
              } else {
                // console.log("Adding System Assessment Stig", assessment.SystemId, ", with Stig", assessment.Stig.id)
                SystemAssessmentStigs[assessment.SystemId] = [assessment.Stig.id];
              }
              if (!(assessment.Stig.id in StigLookupTable)) {
                // Verify uncached referenced stig
                foundMatch = await Stig.findOne({
                  // Create Stig Lookup Table
                  where: {
                    title: assessment.Stig.title,
                    version: assessment.Stig.version,
                    stigRelease: assessment.Stig.stigRelease
                  },
                });
                if (foundMatch) {
                  // If we found an existing stig that matches name of imported
                  if (!(foundMatch.dataValues.id in CachedStig_StigData)) {
                    // Verify uncached referenced STIG Data table for said stig
                    if (typeof assessment.StigId === "number") {
                      // adds STIG ID Lookup if a match is found
                      let stigID: number = assessment.StigId as number;
                      StigLookupTable[stigID] = { key: stigID, value: foundMatch.id };
                      StigReference[stigID] = { key: stigID, value: foundMatch };
                    }
                    availableIDs = await Stig_StigData.findAll({
                      // Create Stig Data Lookup Table for matched STIG for reference later
                      where: {
                        StigId: foundMatch.dataValues.id,
                      },
                    });

                    // stigValues holds all Stig Data for this stig id
                    var stigValues = [];
                    for (const item of availableIDs) {
                      stigValues.push(item.dataValues.StigDatumId); // Push result set StigDatumIDs to stig Values
                    }
                    CachedStig_StigData[foundMatch.dataValues.id] = stigValues; // which then gets added to stig_stigdata lookup
                  }
                } else {
                  // This is an unfortunate case where the stig that is referenced by the imported boundary does not yet exist on this instance of TIR
                  missingStig = true;
                  missingStigs.push(assessment.Stig.title + " (v" + assessment.Stig.version + "r" + assessment.Stig.stigRelease + ")");
                }
              }
            }

            // If an existing matching stig is found
            if (!missingStig && assessment.AssessmentItems) {
              // Iterate through assessment items
              for (const aitems of assessment.AssessmentItems) {
                if (aitems.StigDatum) {
                  if (DatumLookupTable.length == 0 || !(aitems.StigDatum.id in DatumLookupTable)) {
                    const dataMatches = await StigData.findAll({
                      // Needs Lookup Table Implemented
                      where: {
                        rule_id: aitems.StigDatum.rule_id,
                        rule_ver: aitems.StigDatum.rule_ver,
                      },
                    });

                    if (!foundMatch && assessment.Stig && assessment.Stig.id in StigReference) {
                      foundMatch = StigReference[assessment.Stig.id].value
                    }

                    if (dataMatches && foundMatch)
                      for (const dataMatch in dataMatches) {
                        if (
                          CachedStig_StigData[foundMatch.dataValues.id].includes(
                            dataMatches[dataMatch].id,
                          )
                        )
                          DatumLookupTable[aitems.StigDatum.id] = {
                            key: aitems.StigDatum.id,
                            value: dataMatches[dataMatch].id,
                          };
                      }
                  }
                }
              }
            }
          } else {
            // This assessment has been deprecated
            if (!SucceededStigs.includes(assessment.StigId)) {
              SucceededStigs.push(assessment.StigId);
            }
          }
        }
        // end for assessments loop

        // Verify there are no missing stigs in imported boundary library
        // If no missing stig data exists, lets proceed to creating boundary and eval objects
        if (missingStigs.length != 0) {
          throw createError({
            statusCode: 400,
            statusMessage:
              `Cannot load boundary, ensure the following stigs are pre-loaded: \n` + missingStigs,
          });
        } else {
          // No missing stigs, lets create boundary
          try {
            let PolicyDocumentId = boundary.PolicyDocumentId;
            let StigLibraryId = MatchingLibrary.id;

            if (MatchingDocument) {
              PolicyDocumentId = MatchingDocument.id;
            }

            // 3. Create Boundary
            ExistingBoundary.StigLibraryId = StigLibraryId;
            ExistingBoundary.ClassificationId = boundary.Boundary.ClassificationId;
            ExistingBoundary.caveats = boundary.Boundary.caveats;
            ExistingBoundary.PolicyDocumentId = PolicyDocumentId;
            ExistingBoundary.lastUpdate = boundary.Boundary.lastUpdate;
            ExistingBoundary.creationDate = boundary.Boundary.creationDate;
            ExistingBoundary.save();

            // 4. Create evaluations
            for (const evaluation of boundary.Boundary.Evaluations) {
              if (!(evaluation.StigId in StigLookupTable)) {
                // Verify uncached referenced stig
                console.log("Stig ID not in Stig Lookup Table");
                if (!SucceededStigs.includes(evaluation.StigId)) {
                  throw createError({
                    statusCode: 400,
                    statusMessage:
                      `Evaluation references a Stig ID not provided in assessments/lookup: \n` +
                      evaluation.StigId,
                  });
                // } else { //not in stig lookup table but is succeeded
                }
              } else {
                const newEvaluation = await Evaluation.create({
                  BoundaryId: ExistingBoundary.id,
                  StigId: StigLookupTable[evaluation.StigId].value,
                  comment: evaluation.comment,
                  classification: evaluation.classification,
                  customname: evaluation.customname,
                  creationDate: evaluation.creationDate,
                  lastUpdate: evaluation.lastUpdate,
                });

                // Creating new evaluation
                for (const ei of evaluation.EvaluationItems) {
                  if (ei.StigDatumId in DatumLookupTable) {
                    let myEI = await EvaluationItem.create({
                      Office_Org: ei.Office_Org,
                      Resources_Required: ei.Resources_Required,
                      Scheduled_Completion_Date: ei.Scheduled_Completion_Date,
                      Milestone_Changes: ei.Milestone_Changes,
                      Poam_Comments: ei.Poam_Comments,
                      Mitigations: ei.Mitigations,
                      Severity: ei.Severity,
                      Relevance_of_Threat: ei.Relevance_of_Threat,
                      Likelihood: ei.Likelihood,
                      Impact: ei.Impact,
                      Impact_Description: ei.Impact_Description,
                      Residual_Risk_Level: ei.Residual_Risk_Level,
                      Recommendations: ei.Recommendations,
                      lastUpdate: ei.lastUpdate,
                      creationDate: ei.creationDate,
                      EvaluationId: newEvaluation.id,
                      StigDatumId: DatumLookupTable[ei.StigDatumId].value,
                    });
                  } else {
                    throw createError({
                      statusCode: 400,
                      statusMessage: `Boundary import failed, evaluation stig reference does not exist in assessments`,
                    });
                  }
                }
              }
            }
            // end for evaluations loop

            // 5. Create Each System
            for (const sys of boundary.Boundary.Systems) {
              // Iterate Systems as an action instead of discovery
              const existSystem = await System.findOne({
                where: {
                  name: sys.name,
                },
              });
              // Create systems
              const systemPush = await System.create({
                assetType: sys.assetType,
                hostFQDN: sys.hostFQDN,
                hostGUID: sys.hostGUID,
                hostIP: sys.hostIP,
                hostMAC: sys.hostMAC,
                hostName: sys.hostName,
                marking: sys.marking,
                name: sys.name,
                role: sys.role,
                stigGUID: sys.stigGUID,
                targetComment: sys.targetComment,
                targetKey: sys.targetKey,
                techArea: sys.techArea,
                webDBInstance: sys.webDBInstance,
                webDBSite: sys.webDBSite,
                webOrDatabase: sys.webOrDatabase,
                BoundaryId: ExistingBoundary.id,
                creationDate: sys.creationDate,
                lastUpdate: sys.lastUpdate,
              });

              // CREATE STIGDATA Lookup table here
              for (let key in SystemAssessmentStigs[sys.id]) {
                console.log("Adding Stig", StigReference[SystemAssessmentStigs[sys.id][key]].value.id, "to system", systemPush.id)
                systemPush.addStig(StigReference[SystemAssessmentStigs[sys.id][key]].value.id);
              }

              if (!(sys.id in SystemLookupTable)) {
                SystemLookupTable[sys.id] = { key: sys.id, value: systemPush.id };
              }
            }

            // 6. Create Assessments 
            for (const assessment of boundary.Assessments) {
              if (assessment.succeededByAssessmentId == null) {
                let stigLookupValue = -1;
                if (assessment.StigId in StigLookupTable) {
                  stigLookupValue = StigLookupTable[assessment.StigId];
                }

                let systemLookupValue = -1;
                if (assessment.SystemId in SystemLookupTable) {
                  systemLookupValue = SystemLookupTable[assessment.SystemId];
                }

                const newAssessment = await createBlankAssessment(
                  systemLookupValue == -1 ? assessment.SystemId : systemLookupValue.value,
                  stigLookupValue == -1 ? assessment.StigId : stigLookupValue.value,
                );
                newAssessment.succeededByAssessmentId =
                assessment.succeededByAssessmentId;
                newAssessment.comment = assessment.comment;
                newAssessment.customname = assessment.customname;
                newAssessment.classification = assessment.classification;
                newAssessment.uuid = assessment.uuid;
                newAssessment.save();

                // 7. Add Assessment Items
                if (assessment.succeededByAssessmentId == null) {
                  for (const ai of assessment.AssessmentItems) {
                    if (ai.StigDatumId != null) {
                      const [myAssessmentItem] = await AssessmentItem.findOrBuild({
                        where: {
                          AssessmentId: newAssessment.id,
                          StigDatumId: DatumLookupTable[ai.StigDatumId].value,
                        },
                      });
                      myAssessmentItem.status = ai.status;
                      myAssessmentItem.finding_details = ai.finding_details;
                      myAssessmentItem.comments = ai.comments;
                      await myAssessmentItem.save();

                      // 8. Create Overrides
                      if (ai.StigDatum != null && ai.StigDatum.StigOverrides != null &&
                          ai.StigDatum.StigOverrides.length > 0) {
                            for (const so of ai.StigDatum.StigOverrides) {
                            // need type, value, lastUpdate, creationDate, SystemId, StigDatumId
                            let myMappedStigDatum = DatumLookupTable[so.StigDatumId].value
                            let myOverride = await StigOverride.findOrCreate({
                              where: {
                                type: so.type,
                                value: so.value,
                                SystemId: systemLookupValue.value,
                                StigDatumId: myMappedStigDatum,
                              },
                              defaults: {
                                type: so.type, // typescript doesn't understand type from where would be used
                                value: so.value,
                                SystemId: systemLookupValue.value,
                                StigDatumId: myMappedStigDatum,
                              },
                            });
                          }
                      }
                    }
                  }
                }
              }
            }
            console.log("Finished importing boundary")
            return ExistingBoundary;
          } catch (err) {
            const existingBoundary = await Boundary.findOne({ where: { name: boundary.Boundary.name } });
            const tier = await Tier.findByPk(existingBoundary?.TierId);
            throw createError({
              statusCode: 400,
              statusMessage: `Boundary import failure:` + err,
            });
          }
        }
      }
    } catch (err) {
      throw createError({
        statusCode: 400,
        statusMessage: `Boundary import failure:` + err,
      });
    }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});


const processZip = async (zipFile: string, outputPath: string): Promise<string[]> => {
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const filelist = await extractLibrary(zipFile, outputPath);

  return filelist;
};
const extractLibrary = async (sourceZip: string, outputDirectory: string): Promise<string[]> => {
  const temporaryExtraction = path.join(outputDirectory, "tempExtraction");
  const mainZip = new AdmZip(sourceZip);
  const fileList: string[] = [];
  await mainZip.extractAllTo(temporaryExtraction, true);

  fs.readdirSync(temporaryExtraction, {
    encoding: "utf8",
    recursive: true,
  }).forEach((nestedFile) => {
    const filePath = path.join(temporaryExtraction, nestedFile);
    if (path.extname(nestedFile) === ".json") {
      fileList.push(filePath);
    }
  });

  fs.rmSync(sourceZip);
  return fileList;
};
/**
 * @param {import('http').IncomingMessage} req
 */
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
