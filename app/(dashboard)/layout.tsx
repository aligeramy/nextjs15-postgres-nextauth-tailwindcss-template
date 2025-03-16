import { auth } from '@/app/(auth)/auth';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await auth();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-8 px-4">
      <header className="w-full max-w-4xl flex justify-end mb-6">
        <ThemeToggle />
      </header>
      <main className="w-full max-w-4xl flex flex-1 items-center justify-center">
        {children}
      </main>
    </div>
  );
} 