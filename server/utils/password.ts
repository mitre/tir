import { loadAuthConfig } from "~/server/utils/config/authConfig";

function countMatches(regex: RegExp, input: string): number {
  return (input.match(regex) || []).length;
}

export async function getPasswordViolations(password: string): Promise<string[]> {
  const reasons: string[] = [];

  const authConfig = await loadAuthConfig();
  const policy = authConfig.local;

  if (password.length < policy.passwordLength) {
    reasons.push(`Password must be at least ${policy.passwordLength} characters long.`);
  }

  if (countMatches(/[A-Z]/g, password) < policy.upperCount) {
    reasons.push(`Password must contain at least ${policy.upperCount} uppercase letter(s).`);
  }

  if (countMatches(/[a-z]/g, password) < policy.lowerCount) {
    reasons.push(`Password must contain at least ${policy.lowerCount} lowercase letter(s).`);
  }

  if (countMatches(/[0-9]/g, password) < policy.numberCount) {
    reasons.push(`Password must contain at least ${policy.numberCount} number(s).`);
  }

  if (countMatches(/[^A-Za-z0-9]/g, password) < policy.specialCount) {
    reasons.push(`Password must contain at least ${policy.specialCount} special character(s).`);
  }

  return reasons;
}
