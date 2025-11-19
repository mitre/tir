import { computed, type Ref, type ComputedRef } from "vue";
import { DateTime } from "luxon";

export function useIsoDate<T extends Record<string, any>>(
  obj: Ref<T>,
  key: keyof T & string,
): ComputedRef<string> {
  return computed<string>({
    get() {
      const raw = obj.value[key];
      if (!raw) return "";
      const dt = DateTime.fromISO(String(raw), { zone: "utc" });
      return dt.isValid ? dt.toFormat("yyyy-LL-dd") : "";
    },
    set(ymd: string) {
      if (!ymd) {
        (obj.value as any)[key] = null;
        return;
      }
      const dt = DateTime.fromFormat(ymd, "yyyy-LL-dd", { zone: "utc" }).startOf("day");
      (obj.value as any)[key] = dt.toISO();
    },
  });
}
