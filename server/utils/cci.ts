import * as fs from "fs";
import { parseStringPromise } from "xml2js";
import { parseXml, XMLDocument } from "libxmljs";
import { Transaction, Op } from "sequelize";
import { CciList, CciItem, CciReference, PolicyDocument } from "../../db/models";
import { PerfTimer } from "./perfTimer";

export const importCciList = async (
  xmlContent: string,
): Promise<{ success: Boolean; error?: string }> => {
  const performanceTesting = true;

  let perfTimer: PerfTimer | undefined;
  if (performanceTesting) {
    perfTimer = new PerfTimer();
  }

  perfTimer && perfTimer.start("xmlParse");
  const jsonObj = await parseStringPromise(xmlContent, { explicitArray: false });
  perfTimer && perfTimer.stop("xmlParse");

  const cciListDate = jsonObj.cci_list.metadata.publishdate;

  const [, initialized] = await CciList.findOrBuild({
    where: { publishdate: { [Op.gte]: cciListDate } },
  });
  if (!initialized) {
    return { success: false, error: "Newer CCIList already imported." };
  }

  const [newCciList] = await CciList.findOrBuild({
    where: { publishdate: { [Op.lt]: cciListDate } },
  });

  newCciList.publishdate = cciListDate;
  newCciList.version = jsonObj.cci_list.metadata.version;
  newCciList.importComplete = false;
  let cciImportTransaction = await sequelize.transaction({ type: Transaction.TYPES.IMMEDIATE });

  // newCciList.save();
  newCciList.save({ transaction: cciImportTransaction });

  perfTimer && perfTimer.start("cciMassPull");
  const currentCciItems = await CciItem.findAll({
    where: { CciListId: newCciList.id },
  });
  const currentPolicyDocuments = await PolicyDocument.findAll();
  const currentCciReferences = await CciReference.findAll();
  perfTimer && perfTimer.stop("cciMassPull");

  try {
    for (const item of jsonObj.cci_list.cci_items.cci_item) {
      perfTimer && perfTimer.start("cciItemSearch");
      const existingCciItem = currentCciItems.find((ci) => ci.cciId === item.$.id);
      perfTimer && perfTimer.stop("cciItemSearch");

      let cciItem;

      if (!existingCciItem || item.publishdate > existingCciItem?.publishdate) {
        let typePolicy = false;
        let typeTechnical = false;

        if (typeof item.type === "string") {
          typePolicy = item.type === "policy";
          typeTechnical = item.type === "technical";
        } else if (Array.isArray(item.type)) {
          typePolicy = item.type.includes("policy");
          typeTechnical = item.type.includes("technical");
        }

        perfTimer && perfTimer.start("cciItemUpsert");
        [cciItem] = await CciItem.upsert(
          {
            cciId: item.$.id,
            status: item.status,
            publishdate: item.publishdate,
            contributor: item.contributor,
            definition: item.definition,
            typePolicy,
            typeTechnical,
            CciListId: newCciList.id,
          },
          { transaction: cciImportTransaction },
        );
        perfTimer && perfTimer.stop("cciItemUpsert");
      } else {
        cciItem = existingCciItem;
      }

      if (item.references && item.references.reference) {
        console.log(item.$.id);
        let references = item.references.reference;

        if (!Array.isArray(references)) {
          references = [references];
        }
        for (const ref of references) {
          perfTimer && perfTimer.start("policyDocSearch");
          const policyDocKey = `${ref.$.title}-${ref.$.version}`;
          const existingPolicyDoc = currentPolicyDocuments.find(
            (pd) => `${pd.title}-${pd.version}` === policyDocKey,
          );
          perfTimer && perfTimer.stop("policyDocSearch");

          let policyDocument: PolicyDocument;
          if (!existingPolicyDoc) {
            policyDocument = await PolicyDocument.create(
              {
                title: ref.$.title,
                version: ref.$.version,
              },
              { transaction: cciImportTransaction },
            );
            currentPolicyDocuments.push(policyDocument);
          } else {
            policyDocument = existingPolicyDoc;
          }

          const refKey = `${policyDocument.id}-${ref.$.index}`;
          const existingRef = currentCciReferences.find(
            (cr) => `${cr.PolicyDocumentId}-${cr.index}` === refKey,
          );

          let cciReference: CciReference;
          if (!existingRef) {
            perfTimer && perfTimer.start("cciCreate");
            cciReference = await CciReference.create(
              {
                PolicyDocumentId: policyDocument.id,
                creator: ref.$.creator,
                location: ref.$.location,
                index: ref.$.index,
              },
              { transaction: cciImportTransaction },
            );
            perfTimer && perfTimer.stop("cciCreate");

            await cciItem.addCciReference(cciReference, {
              transaction: cciImportTransaction,
            });
            currentCciReferences.push(cciReference);
          } else {
            cciReference = existingRef;
          }

          perfTimer && perfTimer.start("cciAssocSearch");
          const existingAssociation = await cciItem.hasCciReference(cciReference);
          perfTimer && perfTimer.stop("cciAssocSearch");

          // If the association does not exist, create it
          if (!existingAssociation) {
            perfTimer && perfTimer.start("cciAssocCreate");
            await cciItem?.addCciReference(cciReference, { transaction: cciImportTransaction });
            perfTimer && perfTimer.stop("cciAssocCreate");
          }
        }
      }

      // Sqlite lock will time out if we try to transact a full index
      if (sequelize.getDialect() === "sqlite") {
        if (item.$.id === "CCI-002500") {
          cciImportTransaction.commit();
          cciImportTransaction = await sequelize.transaction({ type: Transaction.TYPES.IMMEDIATE });
        }
      }
    }

    await cciImportTransaction.commit();
    perfTimer && perfTimer.globalSummaryPrint();

    return { success: true, error: "" };
  } catch (error) {
    logger.error("Import CCI erorr", error);
    await cciImportTransaction.rollback();
    return { success: false, error: `CCI Import failed. ${error}` };
  }
};

export const verifyCciList = (
  xmlData: string,
): { result: boolean; error: boolean; errormsg: string } => {
  const xsdData = fs.readFileSync("./lib/schema/cci.xsd", "utf8");
  let xmlDoc;
  try {
    xmlDoc = parseXml(xmlData);
  } catch (error) {
    return { result: false, error: true, errormsg: `Error parsing XML` };
  }

  const xsdDoc: XMLDocument = parseXml(xsdData, { baseUrl: "./lib/schema/" });

  try {
    const validationResult = xmlDoc.validate(xsdDoc);

    if (typeof validationResult === "boolean") {
      if (validationResult) {
        return { result: true, error: false, errormsg: "" };
      } else {
        xmlDoc.validationErrors.forEach((error: any) => logger.error(error));
        return { result: false, error: false, errormsg: "" };
      }
    }
    logger.error("Unkown result from cci list validation.", { validationResult });
  } catch (error) {
    logger.error(error);
    return { result: false, error: true, errormsg: "Error attempting xml validation" };
  }

  return { result: false, error: true, errormsg: "Unknown result from validation." };
};

export async function getReference(cci: string, policyDocumentId?: number) {
  const reference = await CciReference.findOne({
    include: [
      {
        model: CciItem,
        where: {
          cciId: cci,
        },
      },
      {
        model: PolicyDocument,
        where: {
          id: policyDocumentId,
        },
      },
    ],
  });

  return reference;
}

export function getIndexesByCciIds(cciIds: string[], cciData: CciItem[]): string[] {
  return cciIds.map((cciId) => {
    const item = cciData.find((item) => item.cciId === cciId);

    if (item && item.CciReferences && item.CciReferences.length > 0) {
      return item.CciReferences[0].index;
    }

    return "";
  });
}
