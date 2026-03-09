export const en = {
  // App
  appName: 'Music Practice',
  appTagline: 'Track and improve your practice sessions',

  // Nav
  'nav.home': 'Home',
  'nav.practice': 'Practice',
  'nav.recordings': 'Recordings',
  'nav.settings': 'Settings',
  'nav.navigation': 'Navigation',

  // Login
  'login.title': 'Music Practice',
  'login.description': 'Enter your email to receive a sign-in link',
  'login.email': 'Email',
  'login.emailPlaceholder': 'you@example.com',
  'login.sending': 'Sending...',
  'login.sendLink': 'Send Sign-In Link',
  'login.checkEmail': 'Check your email',
  'login.sentLinkTo': 'We sent a sign-in link to',
  'login.checkSpam':
    "Click the link in the email to sign in. If you don't see it, check your spam folder.",
  'login.failedToSend': 'Failed to send sign-in link',
  'login.or': 'or',
  'login.continueAsGuest': 'Continue as Guest',

  // Dashboard
  'dashboard.welcome': 'Welcome',
  'dashboard.welcomeName': 'Welcome, {{name}}',
  'dashboard.welcomeGuest': 'Welcome, Guest',
  'dashboard.subtitle': 'Your music practice dashboard',
  'dashboard.getStarted': 'Start building your music practice app from here.',
  'dashboard.today': 'Today',
  'dashboard.dailyQuote': 'Daily Quote',
  'dashboard.weeklyActivity': 'Weekly Activity',
  'dashboard.thisWeek': 'This Week',
  'dashboard.weekOverWeek': 'vs last week',
  'dashboard.noDataYet': 'No data yet',
  'dashboard.total': 'total',
  'dashboard.totalPracticeTime': 'total practice time',
  'dashboard.recentSessions': 'Recent Sessions',
  'dashboard.noSessions': 'No practice sessions yet',
  'dashboard.startPracticing': 'Start your first practice session!',
  'dashboard.items': '{{count}} items',
  'dashboard.min': '{{min}}m',
  'dashboard.hourMin': '{{hours}}h {{min}}m',

  // Settings
  'settings.title': 'Settings',
  'settings.theme': 'Theme',
  'settings.language': 'Language',
  'settings.hebrew': 'עברית',
  'settings.english': 'English',
  'settings.weekStartDay': 'Week starts on',
  'settings.sunday': 'Sunday',
  'settings.monday': 'Monday',

  // Sidebar
  'sidebar.guest': 'Guest',
  'sidebar.logout': 'Log out',

  // Error page
  'error.defaultTitle': 'Something went wrong',
  'error.defaultMessage': 'An unexpected error occurred. Please try again.',
  'error.tryAgain': 'Try Again',
  'error.failedToLoad': 'Failed to load',
  'error.failedToLoadUser': 'Failed to load user data',
  'error.notFoundTitle': 'Page not found',
  'error.notFoundMessage': "The page you're looking for doesn't exist.",
  'error.goHome': 'Go Home',

  // Theme
  'theme.toggle': 'Toggle theme',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
} as const;

export type TranslationKey = keyof typeof en;
