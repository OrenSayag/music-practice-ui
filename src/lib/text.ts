const RTL_RE = /[\p{Script=Arabic}\p{Script=Hebrew}]/u;
const FIRST_STRONG_RE = /[\p{Script=Arabic}\p{Script=Hebrew}]|[a-zA-Z]/u;

export function detectDir(text: string): 'rtl' | 'ltr' {
  const firstStrong = text.match(FIRST_STRONG_RE);
  if (!firstStrong) return 'ltr';
  return RTL_RE.test(firstStrong[0]) ? 'rtl' : 'ltr';
}

export function detectLang(text: string): string {
  return detectDir(text) === 'rtl' ? 'he' : 'en';
}
