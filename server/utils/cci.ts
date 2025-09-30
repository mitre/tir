import * as fs from "fs";
import { parseStringPromise } from "xml2js";
import { parseXml, XMLDocument } from "libxmljs";
import { Transaction, Op } from "sequelize";
import { CciList, CciItem, CciReference, PolicyDocument } from "../../db/models";

import type { ProgressStreamer } from "~/server/utils/progressBar";

export const importCciList = async (
  xml: string,
  streamer: ProgressStreamer,
): Promise<{ success: boolean; error?: string }> => {
  streamer.status("Parsing XML");
  const jsonObj = await parseStringPromise(xml, { explicitArray: false });

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

  const currentCciItems = await CciItem.findAll({
    where: { CciListId: newCciList.id },
  });
  const currentPolicyDocuments = await PolicyDocument.findAll();
  const currentCciReferences = await CciReference.findAll();

  try {
    streamer.status(`Number of CCI Items ${jsonObj.cci_list.cci_items.cci_item.length}`);
    streamer.progress(0);
    let lastPercentage = -1;
    for (let index = 0; index < jsonObj.cci_list.cci_items.cci_item.length; index++) {
      const item = jsonObj.cci_list.cci_items.cci_item[index];

      const existingCciItem = currentCciItems.find((ci) => ci.cciId === item.$.id);

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
      } else {
        cciItem = existingCciItem;
      }

      if (item.references && item.references.reference) {
        let references = item.references.reference;

        if (!Array.isArray(references)) {
          references = [references];
        }
        for (const ref of references) {
          const policyDocKey = `${ref.$.title}-${ref.$.version}`;
          const existingPolicyDoc = currentPolicyDocuments.find(
            (pd) => `${pd.title}-${pd.version}` === policyDocKey,
          );

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
            cciReference = await CciReference.create(
              {
                PolicyDocumentId: policyDocument.id,
                creator: ref.$.creator,
                location: ref.$.location,
                index: ref.$.index,
              },
              { transaction: cciImportTransaction },
            );

            await cciItem.addCciReference(cciReference, {
              transaction: cciImportTransaction,
            });
            currentCciReferences.push(cciReference);
          } else {
            cciReference = existingRef;
          }

          const existingAssociation = await cciItem.hasCciReference(cciReference);

          // If the association does not exist, create it
          if (!existingAssociation) {
            await cciItem?.addCciReference(cciReference, { transaction: cciImportTransaction });
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
      streamer.status(
        `Processing ${index + 1}/${jsonObj.cci_list.cci_items.cci_item.length}: ${item.$.id}`,
      );
      const progress = Math.round(((index + 1) / jsonObj.cci_list.cci_items.cci_item.length) * 100);

      if (progress !== lastPercentage) {
        streamer.progress(progress);
        lastPercentage = progress;
      }
    }

    await cciImportTransaction.commit();

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
        const errormsg = "CCI XML validation failed.";
        xmlDoc.validationErrors.forEach((error: any) =>
          logger.error({ service: "SchemaValidation", message: error }),
        );
        return { result: false, error: true, errormsg };
      }
    }
  } catch (error) {
    logger.error(error);
    return { result: false, error: true, errormsg: "Error attempting cci xml validation" };
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
