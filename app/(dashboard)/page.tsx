import { auth } from '@/app/(auth)/auth';
import { Button } from '@/components/ui/button';
import Form from 'next/form';
import { signOut } from '@/app/(auth)/auth';

export default async function DashboardPage() {
  const session = await auth();
  
  return (
    <div className="flex flex-col items-center space-y-6 p-6">
 <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Signed In</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            You are logged in as {session?.user?.email}
          </p>
        </div>      
        <Form
          action={async () => {
            'use server';
            await signOut({
              redirectTo: '/login',
            });
          }}
        >
          <Button type="submit" variant="default" className="w-full cursor-pointer min-w-80 bg-black hover:bg-gray-600 transition-colors text-white">
            Sign out
          </Button>
        </Form>
    </div>
  );
} 