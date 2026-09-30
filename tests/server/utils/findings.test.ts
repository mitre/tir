import { describe, expect, it as test, vi } from "vitest";

import {
  addFindings,
  catFromSeverity,
  initializeCounts,
  uniqueTransform,
  uniqueTransformCounts,
} from "../../../server/utils/findings";

vi.mock("../../../db/models", () => ({
  Assessment: {},
  AssessmentItem: {},
  Stig: {},
  StigData: {},
  System: {},
  StigIdent: {},
  Boundary: {},
  CciItem: {},
  CciReference: {},
  Evaluation: {},
  EvaluationItem: {},
}));

describe("findings utilities", () => {
  describe("uniqueTransform", () => {
    test("prioritizes Open", () => {
      expect(
        uniqueTransform({
          Open: 1,
          NotAFinding: 2,
          Not_Applicable: 3,
          Not_Reviewed: 4,
        }),
      ).toBe("Open");
    });

    test("prioritizes Not_Reviewed when there are no Open findings", () => {
      expect(
        uniqueTransform({
          Open: 0,
          NotAFinding: 2,
          Not_Applicable: 3,
          Not_Reviewed: 1,
        }),
      ).toBe("Not_Reviewed");
    });

    test("returns NotAFinding when there are no Open or Not_Reviewed findings", () => {
      expect(
        uniqueTransform({
          Open: 0,
          NotAFinding: 2,
          Not_Applicable: 3,
          Not_Reviewed: 0,
        }),
      ).toBe("NotAFinding");
    });

    test("returns Not_Applicable when that is the only finding type", () => {
      expect(
        uniqueTransform({
          Open: 0,
          NotAFinding: 0,
          Not_Applicable: 2,
          Not_Reviewed: 0,
        }),
      ).toBe("Not_Applicable");
    });
  });

  describe("uniqueTransformCounts", () => {
    test("rolls multiple system results into one unique Open finding", () => {
      expect(
        uniqueTransformCounts({
          Open: 2,
          NotAFinding: 1,
          Not_Applicable: 0,
          Not_Reviewed: 1,
        }),
      ).toEqual({
        Open: 1,
        NotAFinding: 0,
        Not_Applicable: 0,
        Not_Reviewed: 0,
      });
    });

    test("rolls up to Not_Reviewed when no Open finding exists", () => {
      expect(
        uniqueTransformCounts({
          Open: 0,
          NotAFinding: 2,
          Not_Applicable: 1,
          Not_Reviewed: 1,
        }),
      ).toEqual({
        Open: 0,
        NotAFinding: 0,
        Not_Applicable: 0,
        Not_Reviewed: 1,
      });
    });
  });

  describe("addFindings", () => {
    test("adds finding counts together", () => {
      const target = initializeCounts();

      addFindings(target, {
        Open: 2,
        NotAFinding: 1,
        Not_Applicable: 3,
        Not_Reviewed: 4,
      });

      expect(target).toEqual({
        Open: 2,
        NotAFinding: 1,
        Not_Applicable: 3,
        Not_Reviewed: 4,
      });
    });
  });

  describe("catFromSeverity", () => {
    test("maps high severity to CAT I", () => {
      expect(catFromSeverity("high")).toBe("CAT I");
    });

    test("maps medium severity to CAT II", () => {
      expect(catFromSeverity("medium")).toBe("CAT II");
    });

    test("maps low severity to CAT III", () => {
      expect(catFromSeverity("low")).toBe("CAT III");
    });
  });
});