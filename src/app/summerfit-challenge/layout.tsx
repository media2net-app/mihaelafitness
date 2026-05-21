import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Summerfit Challenge | Mihaela Fitness',
  description: 'Doe gratis mee aan de Summerfit Challenge! Samen met gelijkgestemden dat extra stukje presteren voor jouw summer fit body. WhatsApp-groep, dagelijkse foto\'s en tips van Mihaela.',
  openGraph: {
    title: 'Summerfit Challenge | Mihaela Fitness',
    description: 'Gratis challenge voor alle klanten. Samen je summer body bereiken met de community.',
  },
};

export default function SummerfitChallengeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
