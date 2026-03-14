import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    BarChart3,
    BotMessageSquare,
    Clock,
    EyeOff,
    ListChecks,
    Mic,
    Moon,
    Shuffle,
    Sun,
    Tags,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-mono text-foreground">
      <LandingHeader />
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <LandingFooter />
    </div>
  );
}

function LandingHeader() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const currentFlag = i18n.language === 'he' ? '🇮🇱' : '🇺🇸';

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">&gt;</span>
          <span className="text-lg font-medium">{t('appName')}</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 font-mono text-xs">
                <span>{currentFlag}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => i18n.changeLanguage('en')}>
                <span>🇺🇸</span>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => i18n.changeLanguage('he')}>
                <span>🇮🇱</span>
                עברית
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild size="sm">
            <Link to="/login">{t('landing.login')}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col items-center gap-8 px-6 pb-32 pt-24 text-center md:pb-40 md:pt-32">
      <h1 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
        {t('landing.heroTitle')}
      </h1>
      <p className="max-w-xl text-muted-foreground md:text-lg">
        {t('landing.heroSubtitle')}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button asChild size="lg">
          <Link to="/login">{t('landing.startFree')}</Link>
        </Button>
        <Button variant="outline" asChild size="lg">
          <Link to="/login">{t('landing.signIn')}</Link>
        </Button>
      </div>

      <div className="relative mx-auto w-full max-w-4xl">
        <img
          src="/screenshots/dashboard_desktop.png"
          alt="Practice Helper Dashboard"
          width={1280}
          height={800}
          loading="eager"
          className="w-full rounded-lg border shadow-2xl"
        />
        <img
          src="/screenshots/practice_mobile.png"
          alt="Practice Helper Mobile"
          width={375}
          height={812}
          loading="eager"
          className="w-[20%] rounded-lg border shadow-2xl md:w-[18%] ltr:right-[-3%] rtl:left-[-3%] ltr:md:right-[-5%] rtl:md:left-[-5%] bottom-[-10%] md:bottom-[-15%]"
          style={{ position: 'absolute' }}
        />
      </div>
    </section>
  );
}

function ProblemSection() {
  const { t } = useTranslation();

  const problems = [
    { icon: Shuffle, title: t('landing.noStructure'), desc: t('landing.noStructureDesc') },
    { icon: EyeOff, title: t('landing.noTracking'), desc: t('landing.noTrackingDesc') },
    { icon: Clock, title: t('landing.noAccountability'), desc: t('landing.noAccountabilityDesc') },
  ];

  return (
    <section className="border-y bg-card px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-12 text-center text-2xl font-bold md:text-3xl">
          {t('landing.problemTitle')}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {problems.map((p) => (
            <ProblemCard key={p.title} icon={p.icon} title={p.title} description={p.desc} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Icon className="h-6 w-6 text-accent-red" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function FeaturesSection() {
  const { t } = useTranslation();

  const screenshotFeatures: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    desc: string;
    desktop: string;
    mobile: string;
  }[] = [
    {
      icon: ListChecks,
      title: t('landing.featurePlans'),
      desc: t('landing.featurePlansDesc') + ' ' + t('landing.featureTimerDesc'),
      desktop: '/screenshots/practice_desktop.png',
      mobile: '/screenshots/practice_mobile.png',
    },
    {
      icon: BarChart3,
      title: t('landing.featureDashboard'),
      desc: t('landing.featureDashboardDesc'),
      desktop: '/screenshots/dashboard_desktop.png',
      mobile: '/screenshots/dashboard_mobile.png',
    },
    {
      icon: Tags,
      title: t('landing.featureNotes'),
      desc: t('landing.featureNotesDesc'),
      desktop: '/screenshots/sessions_desktop.png',
      mobile: '/screenshots/sessions_mobile.png',
    },
    {
      icon: Mic,
      title: t('landing.featureRecording'),
      desc: t('landing.featureRecordingDesc'),
      desktop: '/screenshots/recordings_desktop.png',
      mobile: '/screenshots/recordings_mobile.png',
    },
  ];

  return (
    <section className="px-6 py-20">
      <div className="mx-auto flex max-w-5xl flex-col gap-24">
        <h2 className="text-center text-2xl font-bold md:text-3xl">
          {t('landing.featuresTitle')}
        </h2>

        {screenshotFeatures.map((f, i) => (
          <ScreenshotFeature
            key={f.title}
            icon={f.icon}
            title={f.title}
            description={f.desc}
            desktopSrc={f.desktop}
            mobileSrc={f.mobile}
            reversed={i % 2 === 1}
          />
        ))}

        <div className="mx-auto max-w-md rounded-sm border bg-card p-6 text-center">
          <BotMessageSquare className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h3 className="mb-2 font-semibold">{t('landing.featureAI')}</h3>
          <p className="text-sm text-muted-foreground">{t('landing.featureAIDesc')}</p>
        </div>
      </div>
    </section>
  );
}

function ScreenshotFeature({
  icon: Icon,
  title,
  description,
  desktopSrc,
  mobileSrc,
  reversed,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  desktopSrc: string;
  mobileSrc: string;
  reversed: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-8 md:flex-row md:gap-12 ${reversed ? 'md:flex-row-reverse' : ''}`}
    >
      <div className="relative w-full md:w-3/5">
        <img
          src={desktopSrc}
          alt={title}
          width={1280}
          height={800}
          loading="lazy"
          className="w-full rounded-lg border shadow-lg"
        />
        <img
          src={mobileSrc}
          alt={`${title} mobile`}
          width={375}
          height={812}
          loading="lazy"
          className="w-[22%] rounded-lg border shadow-lg ltr:right-[-5%] rtl:left-[-5%] bottom-[-10%]"
          style={{ position: 'absolute' }}
        />
      </div>
      <div className="flex flex-col gap-3 md:w-2/5">
        <Icon className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function HowItWorksSection() {
  const { t } = useTranslation();

  const steps = [
    { num: '1', title: t('landing.stepPlan'), desc: t('landing.stepPlanDesc') },
    { num: '2', title: t('landing.stepPractice'), desc: t('landing.stepPracticeDesc') },
    { num: '3', title: t('landing.stepReview'), desc: t('landing.stepReviewDesc') },
  ];

  return (
    <section className="border-y bg-card px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-12 text-center text-2xl font-bold md:text-3xl">
          {t('landing.howItWorksTitle')}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {s.num}
              </span>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col items-center gap-8 px-6 py-20 text-center">
      <h2 className="text-2xl font-bold md:text-3xl">{t('landing.pricingTitle')}</h2>
      <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
        <li>{t('landing.pricingGuest')}</li>
        <li>{t('landing.pricingEmail')}</li>
        <li>{t('landing.pricingAll')}</li>
      </ul>
      <Button asChild size="lg">
        <Link to="/login">{t('landing.startFree')}</Link>
      </Button>
    </section>
  );
}

function LandingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">&gt;</span>
          <span className="font-medium">{t('appName')}</span>
        </div>
        <p className="text-sm text-muted-foreground">{t('landing.footerTagline')}</p>
      </div>
    </footer>
  );
}
