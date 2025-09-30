import * as fs from "fs";
import { parseStringPromise } from "xml2js";
import Mustache from "mustache";
import { parseXml, XMLDocument } from "libxmljs";
import { v4 as uuidv4 } from "uuid";
import { Model, Op } from "sequelize";
import {
  Assessment,
  AssessmentItem,
  Boundary,
  Classification,
  Evaluation,
  EvaluationItem,
  Stig,
  StigData,
  StigIdent,
  StigReference,
  StigResponsibility,
  System,
  SystemInterface,
  Override,
  Milestone,
  StigData_StigIdent,
  PolicyDocument,
  StigLibrary,
} from "../../db/models";
import { findOrCreateAssessment } from "./assessments";
import { findStigByStigId } from "./stigLibrary";
import { StigOverride } from "~/db/models/stigOverride";

type BoundaryExportObject = {
  Boundary: Boundary;
  Assessments: Assessment[];
};

type BoundaryExportObject = {
  Boundary: Boundary;
  Assessments: Assessment[];
};

type StigLookup = {
  StigDatum: number;
  StigIdent: number;
  StigTitle: string | undefined;
};

export type BoundaryLookup = {
  Boundary: Boundary;
  StigLibraryHash: string;
  StigLibraryName: string | undefined;
  PolicyDocumentId: number;
  PolicyDocumentName: string | undefined;
  Assessments: Assessment[];
};

export async function SetLookups(b: BoundaryExportObject): Promise<BoundaryLookup> {
  const retValue: BoundaryLookup = {
    Boundary: b.Boundary,
    StigLibraryHash: "",
    PolicyDocumentId: -1,
    PolicyDocumentName: "",
    StigLibraryName: "",
    Assessments: b.Assessments,
  };
  const title = await PolicyDocument.findOne({ where: { id: b.Boundary.PolicyDocumentId } });
  if (title) {
    retValue.PolicyDocumentName = title.title;
    retValue.PolicyDocumentId = b.Boundary.PolicyDocumentId;
  }

  const library = await StigLibrary.findOne({ where: { id: b.Boundary.StigLibraryId } });
  if (library) {
    retValue.StigLibraryName = library.filename;
    retValue.StigLibraryHash = library.hash;
  }

  return retValue;
}

// Accepts system array (for a boundary) and flag true if we return only one (1) stig per checklist and returns list of V3 checklist types
export async function PullBoundaryData(boundaryID: string): Promise<BoundaryExportObject | null> {
  var boundaryNum: number = +boundaryID;
  const boundary = await Boundary.findOne({
    where: {
      id: boundaryNum,
    },
    include: [
      {
        model: Evaluation,
        include: [
          {
            model: EvaluationItem,
          },
        ],
      },
      {
        model: System,
      },
    ],
  });

  const aList: Assessment[] = [];
  if (boundary && boundary.Systems) {
    for (const sys of boundary?.Systems) {
      const aCurrent = await Assessment.findAll({
        where: {
          SystemId: sys.id,
        },
        include: [
          {
            model: Stig,
            attributes: ["id", "stigid", "title", "version", "stigRelease", "filename"],
          },
          {
            model: AssessmentItem,
            include: [
              {
                model: StigData,
                attributes: ["id", "group_title", "vuln_num", "rule_id", "rule_ver"],
                include: [
                  {
                    model: StigOverride,
                  },
                ],
              },
            ],
          },
        ],
      });

      for (const aIterate of aCurrent) {
        // console.log("Assessment", aIterate);
        aList.push(aIterate);
      }
    }
  }

  console.log(aList.length);
  if (boundary != null) {
    const retValue: BoundaryExportObject = {
      Boundary: boundary,
      Assessments: aList,
    };

    return retValue; //boundary;
  } else {
    return null;
  }
}
