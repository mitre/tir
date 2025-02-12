import { Op } from "sequelize";
import { TirConfig } from "~/db/models/tirConfig";

export async function getConfigValues(prefix: string): Promise<TirConfig[]> {
  return await TirConfig.findAll({ where: { key: { [Op.like]: `${prefix}_%` } } });
}

export function getBoolValue(
  logConfig: TirConfig[],
  prefix: string,
  valName: string,
): boolean | undefined {
  const stringVal = logConfig.find((ci) => ci.key === `${prefix}_${valName}`)?.value;
  if (stringVal) {
    return stringVal === "true";
  }
  return undefined;
}

export function getStringValue(
  logConfig: TirConfig[],
  prefix: string,
  valName: string,
): string | undefined {
  return logConfig.find((ci) => ci.key === `${prefix}_${valName}`)?.value;
}

export function getNumValue(
  logConfig: TirConfig[],
  prefix: string,
  valName: string,
): number | undefined {
  const numberString = logConfig.find((ci) => ci.key === `${prefix}_${valName}`)?.value;
  if (numberString) {
    return parseInt(numberString, 10);
  }

  return undefined;
}

export async function setValue<T extends boolean | string | number>(
  prefix: string,
  valName: string,
  value: T,
): Promise<void> {
  if (typeof value === "boolean") {
    await TirConfig.upsert({ key: `${prefix}_${valName}`, value: value ? "true" : "false" });
  } else if (typeof value === "string") {
    await TirConfig.upsert({ key: `${prefix}_${valName}`, value });
  } else if (typeof value === "number") {
    await TirConfig.upsert({ key: `${prefix}_${valName}`, value: value.toString() });
  }
}
