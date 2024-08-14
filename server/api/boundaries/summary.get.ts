import {
  Assessment,
  AssessmentItem,
  Boundary,
  Override,
  Stig,
  StigData,
  StigLibrary,
  System,
  Boundary_User,
  User,
  BoundaryRole,
} from "../../../db/models";
import { FindingCounts } from "../../utils/findings";
import { PerfTimer } from "../../utils/perfTimer";
import { decodeToken } from "../../utils/currentUser";
import { Op } from "sequelize";

export default defineEventHandler(async (event) => {
  const perfTimer = new PerfTimer();
  const query = getQuery(event);

  if (!query.BoundaryId) {
    throw createError({
      statusCode: 400,
      statusMessage: `BoundaryId required.`,
    });
  }

  const rawToken = getCookie(event, "tirtoken");
  let userId: number;
  if (rawToken) {
    userId = decodeToken(rawToken);
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Unknown User.",
    });
  }

  const BoundaryId = parseInt(query.BoundaryId?.toString(), 10);

  if (isNaN(BoundaryId)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid BoundaryId ${query.BoundaryId}`,
    });
  }

  const boundary = await Boundary.findOne({
    include: [
      {
        model: System,
        include: [
          {
            model: Stig,
            attributes: ["id", "title", "version", "stigRelease", "stigDate"],
          },
        ],
      },
      {
        model: StigLibrary,
      },
      {
        model: Boundary_User,
      },
      {
        model: User,
        attributes: ["id", "firstName", "lastName", "email"],
        as: "owner",
      },
    ],
    where: {
      id: BoundaryId,
    },
  });
  if (!boundary) {
    throw createError({
      statusCode: 404,
      statusMessage: `Boundary not Found. BoundaryId: ${query.BoundaryId}`,
    });
  }

  if (!boundary.StigLibrary) {
    throw createError({
      statusCode: 400,
      statusMessage: `Boundary does not have a Stig Library Associated.`,
    });
  }

  if (
    !boundary.Boundary_Users.find((o: { UserId: number }) => o.UserId === userId) &&
    boundary.dataValues.owner.dataValues.id !== userId
  ) {
    throw createError({
      statusCode: 401,
      statusMessage: "Permission Not Granted. Not a member of this Enclave",
    });
  }

  const boundaryInfo = {
    id: boundary.id,
    name: boundary.name,
    StigLibraryId: boundary.StigLibrary.id,
    stigLibrary: boundary.StigLibrary.filename,
  };

  const allFindingsOrdered = await StigData.findAll({
    attributes: ["id"],
    include: [
      {
        model: AssessmentItem,
        attributes: ["status"],
        required: true,
        include: [
          {
            model: Assessment,
            attributes: ["SystemId"],
            required: true,
            where: { succeededByAssessmentId: { [Op.is]: null } },
            include: [
              {
                model: System,
                attributes: ["name"],
                required: true,
                include: [
                  {
                    model: Boundary,
                    attributes: [],
                    required: true,
                    where: {
                      id: BoundaryId,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        model: Stig,
        attributes: ["id"],
        include: [
          {
            model: StigLibrary,
            where: { id: boundary.StigLibrary.id },
            required: true,
          },
        ],
      },
    ],
  });

  const overrides = await Override.findAll({
    include: {
      model: System,
      where: {
        BoundaryId,
      },
    },
  });

  type SystemEntry = {
    id: number;
    name: string;
    stigsApplied: number[];
    findings: FindingCounts;
  };

  type StigEntry = {
    id: number;
    title: string;
    version: string;
    date: string;
    // lastUpdate: Date;
    findings: FindingCounts;
  };

  let tempCounts = initializeCounts();
  const uniqueCounts = initializeCounts();
  const totalCounts = initializeCounts();

  const boundaryView: StigEntry[] = [];
  const systemView: SystemEntry[] = [];

  for (let i = 0; i < allFindingsOrdered.length; i++) {
    const uniqueFinding = allFindingsOrdered[i];
    if (!uniqueFinding.AssessmentItems) {
      uniqueFinding.AssessmentItems = [];
    }

    if (!uniqueFinding.Stigs) {
      throw createError({
        statusCode: 400,
        statusMessage: `Unable to find associated Stig for StigDataId: ${uniqueFinding.id}.`,
      });
    }

    if (!uniqueFinding.Stigs[0].id) {
      break;
    }

    for (let j = 0; j < uniqueFinding.AssessmentItems.length; j++) {
      const assessmentItem = uniqueFinding.AssessmentItems[j];
      const assessment = assessmentItem.Assessment!;

      const foundOverride = overrides.find(
        (override) =>
          override.SystemId === assessment.SystemId && override.StigDatumId === uniqueFinding.id,
      );

      let status;
      if (foundOverride) {
        status = foundOverride.status;
      } else {
        status = assessmentItem.status;
      }

      perfTimer.start("Findings Map");
      const currentFinding = {
        Open: status === "Open" ? 1 : 0,
        NotAFinding: status === "NotAFinding" ? 1 : 0,
        Not_Reviewed: status === "Not_Reviewed" ? 1 : 0,
        Not_Applicable: status === "Not_Applicable" ? 1 : 0,
      };
      perfTimer.stop("Findings Map");
      addFindings(tempCounts, currentFinding);
      addFindings(totalCounts, currentFinding);

      if (!assessment.System) {
        throw createError({
          statusCode: 400,
          statusMessage: `Missing assessment for AssessmentItemID: ${assessmentItem.id}.`,
        });
      }

      findOrAddSystemById(
        assessment.SystemId,
        assessment.System.name,
        uniqueFinding.Stigs[0].id,
        currentFinding,
      );
    }

    addFindings(uniqueCounts, uniqueTransformCounts(tempCounts));
    findOrAddStigById(uniqueFinding.Stigs[0].id, uniqueTransformCounts(tempCounts));

    tempCounts = initializeCounts();
  }

  const stigDetails = [];

  if (boundary && boundary.Systems) {
    for (const system of boundary.Systems) {
      if (system.Stigs) {
        if (system.Stigs.length === 0) {
          findOrAddSystemById(system.id, system.name);
        }
        for (const stig of system.Stigs) {
          findOrAddSystemById(system.id, system.name, stig.id);
          stigDetails.push(stig);
        }
      }
    }
  }

  for (let i = 0; i < boundaryView.length; i++) {
    const details = stigDetails.find((stigDetail) => stigDetail.id === boundaryView[i].id);
    if (details) {
      boundaryView[i].title = details.title;
      boundaryView[i].version = `v${details.version}r${details.stigRelease}`;
      boundaryView[i].date = details.stigDate;
      // boundaryView[i].lastUpdate = details?.dataValues.updatedAt;
    }
  }
  perfTimer.globalSummaryPrint();

  return { boundaryInfo, boundaryView, systemView, uniqueCounts, totalCounts };

  function findOrAddSystemById(
    id: number,
    name: string,
    stigId?: number,
    findings?: FindingCounts,
  ): void {
    const existingSystem = systemView.find((systemEntry) => systemEntry.id === id);
    let targetSystem: SystemEntry;

    if (!existingSystem) {
      targetSystem = {
        id,
        name,
        stigsApplied: [],
        findings: initializeCounts(),
      };
    } else {
      targetSystem = existingSystem;
    }

    if (findings) {
      addFindings(targetSystem.findings, findings);
    }

    if (stigId) {
      const existingStig = targetSystem.stigsApplied.find((id) => id === stigId);
      if (!existingStig) {
        targetSystem.stigsApplied.push(stigId);
      }
    }

    if (!existingSystem) {
      systemView.push(targetSystem);
    }
  }

  // function initializeCounts(): FindingStatus {
  //   return { open: 0, closed: 0, notApplicable: 0, notReviewed: 0 };
  // }

  function findOrAddStigById(id: number, findings: FindingCounts): void {
    const existingSystem = boundaryView.find((stigEntry) => stigEntry.id === id);

    if (existingSystem) {
      addFindings(existingSystem.findings, findings);
    } else {
      const newStig: StigEntry = {
        id,
        title: "",
        version: "",
        date: "",
        // lastUpdate: new Date(),
        findings,
      };
      boundaryView.push(newStig);
    }
  }

  function addFindings(targetSum: FindingCounts, addends: FindingCounts) {
    for (const key in addends) {
      if (Object.prototype.hasOwnProperty.call(addends, key)) {
        targetSum[key] += addends[key];
      }
    }
  }

  // function uniqueTransformCounts(findings: FindingStatus): FindingStatus {
  //   const { open, closed, notApplicable, notReviewed } = findings;

  //   if (open) {
  //     return { open: 1, closed: 0, notApplicable: 0, notReviewed: 0 };
  //   } else if (notReviewed) {
  //     return { open: 0, closed: 0, notApplicable: 0, notReviewed: 1 };
  //   } else if (closed) {
  //     return { open: 0, closed: 1, notApplicable: 0, notReviewed: 0 };
  //   } else if (notApplicable) {
  //     return { open: 0, closed: 0, notApplicable: 1, notReviewed: 0 };
  //   } else {
  //     return { open: 0, closed: 0, notApplicable: 0, notReviewed: 0 };
  //   }
  // }
});
