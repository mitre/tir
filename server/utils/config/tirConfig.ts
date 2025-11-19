import { Op } from "sequelize";
import { TirConfig } from "~/db/models/tirConfig";

const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : "");
const decapitalize = (s: string) => (s ? s[0].toLowerCase() + s.slice(1) : "");
const composeKey = (section: string, baseKey: string) => `${section}${capitalize(baseKey)}`;
const serialize = (value: unknown): string =>
  typeof value === "string" ? value : JSON.stringify(value ?? null);

export async function setConfigValue(
  section: string,
  baseKey: string,
  value: unknown,
): Promise<void> {
  if (value === undefined) return;
  const key = composeKey(section, baseKey);
  await TirConfig.upsert({ key, value: serialize(value) });
}

export async function getConfigValue(
  section: string,
  baseKey: string,
): Promise<string | undefined> {
  const key = composeKey(section, baseKey);
  const row = await TirConfig.findOne({ where: { key } });
  return row?.value;
}

export async function getConfigValues(
  section: string,
  subsection?: string,
): Promise<Record<string, string>> {
  const prefix = subsection ? `${section}${capitalize(subsection)}` : section;
  const rows = await TirConfig.findAll({ where: { key: { [Op.like]: `${prefix}%` } } });
  const out: Record<string, string> = {};
  for (const r of rows) {
    const field = r.key.startsWith(prefix) ? r.key.slice(prefix.length) : r.key;
    out[decapitalize(field)] = r.value;
  }
  return out;
}

export async function deleteConfigValue(section: string, baseKey: string): Promise<number> {
  return await TirConfig.destroy({ where: { key: composeKey(section, baseKey) } });
}

type TypeTag = "bool" | "num" | "str" | "json";

export type FieldSpec<T> = {
  type: TypeTag;
  default: T;
  from?: string;
  omit?: boolean;
  setFlag?: string;
};

export type Schema = Record<string, FieldSpec<any>>;

export type ParseSchema<S extends Schema> = {
  [K in keyof S as S[K]["omit"] extends true
    ? S[K]["setFlag"] extends string
      ? S[K]["setFlag"]
      : `${Extract<K, string>}Set`
    : K]: S[K]["omit"] extends true ? boolean : S[K] extends FieldSpec<infer T> ? T : never;
};

const coerce = (raw: string | undefined, type: TypeTag, dflt: any) => {
  if (raw === undefined) return dflt;
  switch (type) {
    case "bool":
      return raw === "true" || raw === "1";
    case "num": {
      const n = Number(raw);
      return Number.isFinite(n) ? n : dflt;
    }
    case "str":
      return raw;
    case "json":
      try {
        return JSON.parse(raw);
      } catch {
        return dflt;
      }
  }
};

export async function loadBySchema<S extends Schema>(
  section: string,
  provider: string,
  schema: S,
): Promise<ParseSchema<S>> {
  const kv = await getConfigValues(section, provider);
  const out: Record<string, unknown> = {};
  for (const [key, spec] of Object.entries(schema)) {
    const storedKey = spec.from ?? key;
    const raw = kv[storedKey];

    if (spec.omit) {
      const flag = spec.setFlag ?? `${key}Set`;
      const isSet = raw !== undefined && raw !== "" && raw !== "null" && raw !== "undefined";
      out[flag] = !!isSet;
    } else {
      out[key] = coerce(raw, spec.type, spec.default);
    }
  }
  return out as ParseSchema<S>;
}
