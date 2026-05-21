import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Online Coaching | Mihaela Fitness',
  description:
    'Persoonlijk online coaching met trainingplan, video-workouts, food tracking en progressie-opvolging. Vanaf €24,95 per maand.',
};

export default function StartOnlineCoachingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
