import { parseStringPromise } from "xml2js";
import {
  Assessment,
  AssessmentItem,
  Boundary,
  Stig,
  StigData,
  System,
  SystemInterface,
  StigLibrary,
} from "../../db/models";

export async function importChecklist(
  xmlData: string,
  systemId: number,
): Promise<{ error: boolean; new: boolean }> {
  const jsonObj = await parseStringPromise(xmlData, { explicitArray: false });

  const system = (await System.findByPk(systemId, {
    include: {
      model: Boundary,
    },
  })) as SystemInterface;

  const stigLibraryId = system?.dataValues.Boundary.StigLibraryId;

  let stigArrayFromCkl = jsonObj.CHECKLIST.STIGS.iSTIG;

  if (!Array.isArray(stigArrayFromCkl)) {
    stigArrayFromCkl = [stigArrayFromCkl];
  }

  try {
    for (const stigFromCkl of stigArrayFromCkl) {
      const cklStigId = getSI_DataByName(stigFromCkl.STIG_INFO.SI_DATA, "stigid");

      const stigMatchingCkl = await Stig.findOne({
        where: {
          stigid: cklStigId,
        },
        include: [
          {
            model: StigLibrary,
            attributes: [],
            where: {
              id: stigLibraryId,
            },
          },
        ],
      });

      const alreadyHasStig = await system.hasStig(stigMatchingCkl?.dataValues.id);
      if (!alreadyHasStig) {
        await system.addStig(stigMatchingCkl?.dataValues.id);
      }

      let assessmentToPopulate: Assessment;
      const initialCheck = await Assessment.findOne({
        where: {
          SystemId: systemId,
          StigId: stigMatchingCkl?.dataValues.id,
        },
      });

      if (initialCheck) {
        // console.log("Error.  Assessment already exists.");
        assessmentToPopulate = initialCheck;
      } else {
        // console.log("Truely nothing out there.  Need to make one.");

        const newAssessment = await Assessment.create({
          SystemId: systemId,
          StigId: stigMatchingCkl?.dataValues.id,
          comment: "", // stigFromCkl.$['comment'],  xml2js cannot read commnets outside root tag
          classification: getSI_DataByName(stigFromCkl.STIG_INFO.SI_DATA, "classification"),
          customname: getSI_DataByName(stigFromCkl.STIG_INFO.SI_DATA, "customname"),
          uuid: getSI_DataByName(stigFromCkl.STIG_INFO.SI_DATA, "uuid"),
        });
        assessmentToPopulate = newAssessment;
      }

      const stigChecks = await StigData.findAll({
        include: [
          {
            model: Stig,
            where: { id: stigMatchingCkl?.dataValues.id },
          },
        ],
      });

      for (const check of stigChecks) {
        const cklElement = findVulnElementByvNum(stigFromCkl.VULN, check.dataValues.vuln_num);
        const [instance, wasBuilt] = await AssessmentItem.findOrBuild({
          where: {
            AssessmentId: assessmentToPopulate.dataValues.id,
            StigDatumId: check.dataValues.id,
          },
        });

        instance.setDataValue("status", cklElement?.STATUS);
        instance.setDataValue("comments", cklElement?.COMMENTS);
        instance.setDataValue("finding_details", cklElement?.FINDING_DETAILS);
        instance.setDataValue(
          "severity_override",
          cklElement?.SEVERITY_OVERRIDE === "" ? null : cklElement?.SEVERITY_OVERRIDE,
        );
        instance.setDataValue("severity_justification", cklElement?.SEVERITY_JUSTIFICATION);

        await instance.save();
      }
    }

    return { error: false, new: true };
  } catch (error) {
    console.log(error);
    return { error: true, new: false };
  }
}

export async function createAssessment(
  systemId: number,
  stigId: number,
): Promise<{ error: boolean; errmsg: string }> {
  const initialCheck = await Assessment.findOne({
    where: {
      SystemId: systemId,
      StigId: stigId,
    },
  });

  if (initialCheck) {
    // console.log("Error.  Assessment already exists.");
  } else {
    // console.log("Truely nothing out there.  Need to make one.");

    const newAssessment = await Assessment.create({
      SystemId: systemId,
      StigId: stigId,
      comment: "TIR",
      classification: "U",
    });

    const stigChecks = await StigData.findAll({
      include: [
        {
          model: Stig,
          where: { id: stigId },
        },
      ],
    });

    for (const check of stigChecks) {
      await AssessmentItem.create({
        status: "Not_Reviewed",
        AssessmentId: newAssessment.dataValues.id,
        StigDatumId: check.dataValues.id,
      });
    }
  }

  return { error: false, errmsg: "" };
}

type SI_DATA = {
  SID_NAME: string;
  SID_DATA: string;
};

function getSI_DataByName(array: SI_DATA[], name: string): string | null {
  if (!Array.isArray(array)) {
    array = [array];
  }
  const item = array.find((element) => element.SID_NAME && element.SID_NAME === name);
  return item ? item.SID_DATA : null;
}

type Stig_Data = {
  VULN_ATTRIBUTE: string;
  ATTRIBUTE_DATA: string;
}[];

type VulnElement = {
  STIG_DATA: Stig_Data;
  COMMENTS: string;
  FINDING_DETAILS: string;
  SEVERITY_JUSTIFICATION: string;
  SEVERITY_OVERRIDE: string;
  STATUS: string;
};

function findVulnElementByvNum(array: VulnElement[], vNum: string): VulnElement | null {
  const result = array.find((vulnElement) => {
    return vulnElement.STIG_DATA.some((data) => {
      return data.VULN_ATTRIBUTE === "Vuln_Num" && data.ATTRIBUTE_DATA === vNum;
    });
  });

  return result || null;
}
