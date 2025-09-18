import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, ShieldAlert, Settings, Rss } from 'lucide-react';

export default function Home() {
  const features = [
    {
      title: 'Emergency',
      description: 'Fall detection & SOS contacts',
      href: '/emergency',
      icon: <ShieldAlert className="size-8" />,
      icon_bg: "bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400"
    },
    {
      title: 'Connectivity',
      description: 'Connect to your device',
      href: '/connectivity',
      icon: <Rss className="size-8" />,
      icon_bg: "bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400"
    },
    {
      title: 'Settings',
      description: 'Customize your experience',
      href: '/settings',
      icon: <Settings className="size-8" />,
      icon_bg: "bg-gray-100 dark:bg-gray-900/30 text-gray-500 dark:text-gray-400"
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          Welcome to DRISHTI
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your companion for safer journeys.
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.href} className="group">
            <Card className="h-full transform transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-xl dark:group-hover:shadow-blue-800/20">
              <CardHeader className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
                <div className={`relative flex size-20 items-center justify-center rounded-full ${feature.icon_bg}`}>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <div className="relative transform transition-transform duration-300 group-hover:rotate-12">
                    {feature.icon}
                  </div>
                </div>
                <div className="space-y-1">
                  <CardTitle className="font-headline text-2xl">{feature.title}</CardTitle>
                  <CardDescription className="flex items-center justify-center gap-2 text-base">
                    {feature.description}
                  </CardDescription>
                </div>
                 <div className="flex items-center text-sm font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Go to {feature.title} <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
