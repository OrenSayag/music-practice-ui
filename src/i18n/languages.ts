export const SUPPORTED_LANGUAGES = [
  { code: 'en', labelKey: 'settings.english' },
  { code: 'he', labelKey: 'settings.hebrew' },
] as const;

export const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

export function isSupportedLanguage(code: string): code is LanguageCode {
  return (SUPPORTED_LANGUAGE_CODES as readonly string[]).includes(code);
}
