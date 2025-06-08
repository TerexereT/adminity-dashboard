import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const session = await getSession();

  if (session?.userId) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }

  // This return is technically unreachable due to redirects, but good practice.
  return null; 
}
