import en from "@/locales/en.json";

// Simple nested key access (e.g., 'task.new')
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationKey = NestedKeyOf<typeof en>;

export const useTranslation = () => {
  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    const keys = key.split(".");
    let value: unknown = en;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }

    if (typeof value === "string" && params) {
      let strValue = value;
      Object.entries(params).forEach(([k, v]) => {
        strValue = strValue.replace(`{${k}}`, String(v));
      });
      return strValue;
    }

    return value as string;
  };

  return { t };
};
