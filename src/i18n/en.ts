export const en = {
  // App
  appName: 'Music Practice',
  appTagline: 'Track and improve your practice sessions',

  // Nav
  'nav.dashboard': 'Dashboard',
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

  // Dashboard
  'dashboard.welcome': 'Welcome',
  'dashboard.welcomeName': 'Welcome, {{name}}',
  'dashboard.subtitle': 'Your music practice dashboard',

  // Settings
  'settings.title': 'Settings',
  'settings.theme': 'Theme',
  'settings.language': 'Language',

  // Sidebar
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
  'theme.system': 'System',
} as const;

export type TranslationKey = keyof typeof en;
