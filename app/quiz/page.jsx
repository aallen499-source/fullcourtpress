import QuizClient from './QuizClient';

export const metadata = {
  title: 'Where Do You Start? A 60-Second College Recruiting Quiz — RecruitGrid',
  description:
    'Nine questions about your sport, year, film and grades, and an honest read of where to start your college recruiting list — which levels to look at first, and what to do next. Free, no account needed.',
  alternates: { canonical: 'https://recruitgrid.app/quiz' },
  openGraph: {
    title: 'Where do you start? A 60-second recruiting quiz',
    description: 'Nine questions, an honest read of where to start, and the next three things to do.',
    url: 'https://recruitgrid.app/quiz',
  },
};

export default function QuizPage() {
  return <QuizClient />;
}
