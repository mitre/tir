import { Op } from "sequelize";
import { TirConfig } from "~/db/models/tirConfig";

export async function getConfigValues(prefix: string): Promise<TirConfig[]> {
  return await TirConfig.findAll({ where: { key: { [Op.like]: `${prefix}_%` } } });
}

export async function getConfigValue(key: string): Promise<string | undefined> {
  const result = await TirConfig.findOne({ where: { key } });
  return result?.value;
}

export async function setConfigValue(key: string, value: string | number | boolean): Promise<void> {
  await TirConfig.upsert({ key, value: String(value) });
}

/**
 * Generic getter that parses value to correct type.
 * @param configArr array of TirConfig objects (for a prefix)
 * @param keySuffix suffix to append after the prefix (no "_")
 * @param prefix prefix for the config key
 * @param type type to cast to: 'boolean' | 'number' | 'string'
 */
export function getTypedValue(
  configArr: TirConfig[],
  keySuffix: string,
  prefix: string,
  type: "boolean" | "number" | "string",
): boolean | number | string | undefined {
  const key = `${prefix}_${keySuffix}`;
  const raw = configArr.find((c) => c.key === key)?.value;
  if (raw == null) return undefined;

  switch (type) {
    case "boolean":
      return raw === "true";
    case "number":
      return Number(raw);
    default:
      return raw;
  }
}

export function getBool(
  configArr: TirConfig[],
  keySuffix: string,
  prefix: string,
): boolean | undefined {
  return getTypedValue(configArr, keySuffix, prefix, "boolean") as boolean | undefined;
}

export function getNum(
  configArr: TirConfig[],
  keySuffix: string,
  prefix: string,
): number | undefined {
  return getTypedValue(configArr, keySuffix, prefix, "number") as number | undefined;
}

export function getStr(
  configArr: TirConfig[],
  keySuffix: string,
  prefix: string,
): string | undefined {
  return getTypedValue(configArr, keySuffix, prefix, "string") as string | undefined;
}

export async function setValue(
  prefix: string,
  keySuffix: string,
  value: string | number | boolean,
): Promise<void> {
  await setConfigValue(`${prefix}_${keySuffix}`, value);
}
