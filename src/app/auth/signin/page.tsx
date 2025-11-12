import { Suspense } from 'react'
import SiteLayout from '@/components/site/SiteLayout';
import SignInForm from './SignInForm'

export const dynamic = 'force-dynamic';

export default function SignInPage() {
  return (
    <SiteLayout>
      <Suspense fallback={<div className="container py-8">Loading...</div>}>
        <SignInForm />
      </Suspense>
    </SiteLayout>
  )
}
