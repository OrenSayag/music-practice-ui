import type { TranslationKey } from './en';

export const he: Record<TranslationKey, string> = {
  // App
  appName: 'תרגול מוזיקה',
  appTagline: 'עקבו ושפרו את התרגולים שלכם',

  // Nav
  'nav.dashboard': 'לוח בקרה',
  'nav.settings': 'הגדרות',
  'nav.navigation': 'ניווט',

  // Login
  'login.title': 'תרגול מוזיקה',
  'login.description': 'הכניסו את האימייל שלכם כדי לקבל קישור כניסה',
  'login.email': 'אימייל',
  'login.emailPlaceholder': 'you@example.com',
  'login.sending': 'שולח...',
  'login.sendLink': 'שליחת קישור כניסה',
  'login.checkEmail': 'בדקו את האימייל',
  'login.sentLinkTo': 'שלחנו קישור כניסה אל',
  'login.checkSpam':
    'לחצו על הקישור באימייל כדי להיכנס. אם אינכם רואים אותו, בדקו את תיקיית הספאם.',
  'login.failedToSend': 'שליחת קישור הכניסה נכשלה',
  'login.or': 'או',
  'login.continueAsGuest': 'המשך כאורח',

  // Dashboard
  'dashboard.welcome': 'ברוכים הבאים',
  'dashboard.welcomeName': 'ברוכים הבאים, {{name}}',
  'dashboard.welcomeGuest': 'ברוכים הבאים, אורח',
  'dashboard.subtitle': 'לוח תרגול המוזיקה שלכם',

  // Settings
  'settings.title': 'הגדרות',
  'settings.theme': 'ערכת נושא',
  'settings.language': 'שפה',
  'settings.hebrew': 'עברית',
  'settings.english': 'English',

  // Sidebar
  'sidebar.guest': 'אורח',
  'sidebar.logout': 'התנתקות',

  // Error page
  'error.defaultTitle': 'משהו השתבש',
  'error.defaultMessage': 'אירעה שגיאה בלתי צפויה. אנא נסו שוב.',
  'error.tryAgain': 'נסו שוב',
  'error.failedToLoad': 'טעינה נכשלה',
  'error.failedToLoadUser': 'טעינת נתוני המשתמש נכשלה',
  'error.notFoundTitle': 'העמוד לא נמצא',
  'error.notFoundMessage': 'העמוד שחיפשתם לא קיים.',
  'error.goHome': 'חזרה לדף הבית',

  // Theme
  'theme.toggle': 'החלפת ערכת נושא',
  'theme.light': 'בהיר',
  'theme.dark': 'כהה',
  'theme.system': 'מערכת',
} as const;
