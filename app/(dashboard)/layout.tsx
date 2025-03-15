import { auth } from '@/app/(auth)/auth';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await auth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4">
      <main className="w-full max-w-4xl">
        {children}
      </main>
    </div>
  );
} 