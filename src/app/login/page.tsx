import { LoginForm } from '@/components/auth/login-form';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await getSession();
  if (session?.userId) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background to-muted p-4 sm:p-6 md:p-8">
      <LoginForm />
    </main>
  );
}
