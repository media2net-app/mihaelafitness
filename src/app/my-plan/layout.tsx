import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plan Nutrițional Personalizat | Mihaela Fitness',
  description: 'Planul Tău Nutrițional Personalizat',
  openGraph: {
    title: 'Plan Nutrițional Personalizat | Mihaela Fitness',
    description: 'Planul Tău Nutrițional Personalizat',
    images: [
      {
        url: '/logo-mihaela.svg',
        width: 800,
        height: 600,
        alt: 'Mihaela Fitness',
      },
    ],
    type: 'website',
    siteName: 'Mihaela Fitness',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plan Nutrițional Personalizat | Mihaela Fitness',
    description: 'Planul Tău Nutrițional Personalizat',
    images: ['/logo-mihaela.svg'],
  },
};

export default function MyPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

