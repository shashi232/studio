import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, ShieldAlert, Settings, Rss } from 'lucide-react';

export default function Home() {
  const features = [
    {
      title: 'Emergency',
      description: 'Fall detection & SOS contacts',
      href: '/emergency',
      icon: <ShieldAlert className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Connectivity',
      description: 'Connect to your device',
      href: '/connectivity',
      icon: <Rss className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Settings',
      description: 'Customize your experience',
      href: '/settings',
      icon: <Settings className="h-8 w-8 text-primary" />,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          Welcome to SmartStep
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your companion for safer journeys.
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.href} className="group">
            <Card className="h-full transform transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-xl">
              <CardHeader className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
                {feature.icon}
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
