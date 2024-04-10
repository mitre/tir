import { Assessment, AssessmentItem, Stig, StigData } from "../../db/models";

// changed to make a blank but function actually checks for existing.  need to split this logs for checklist.ts and stigLibrary
// stigLibrary really just wants a new one.  Can adjust this one to make one no matter what.  Wrapper for the checklist version to test first.
// maybe call the checklist one called findOrCreateAssessment

export async function createBlankAssessment(
  systemId: number,
  stigId: number,
  classification?: string,
  customname?: string,
  uuid?: string,
): Promise<Assessment> {
  try {
    const newAssessment = await Assessment.create({
      SystemId: systemId,
      StigId: stigId,
      comment: "TIR",
      customname: customname || "",
      classification: classification || "UNCLASSIFIED",
      uuid: uuid || "",
      succeededByAssessmentId: null,
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
        finding_details: "",
        comments: "",
      });
    }
    return newAssessment;
  } catch (error) {
    logger.error("Unabable to create blank assessment.", error);
    throw error;
  }
}

export async function findOrCreateAssessment(
  systemId: number,
  stigId: number,
  classification?: string,
  customname?: string,
  uuid?: string,
): Promise<Assessment> {
  let newAssessment: Assessment;

  const assessment = await Assessment.findOne({
    where: {
      SystemId: systemId,
      StigId: stigId,
    },
  });

  if (assessment) {
    newAssessment = assessment;
  } else {
    newAssessment = await createBlankAssessment(
      systemId,
      stigId,
      classification || "",
      customname || "",
      uuid || "",
    );
  }

  return newAssessment;
}
