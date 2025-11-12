'use client';

import { useEffect, useRef } from 'react';
import { useAuth, useUser } from '@/firebase/provider';
import { signInWithEmailAndPassword } from 'firebase/auth';

/**
 * AdminFirebaseAuth bridges Next.js app auth with Firebase Auth for Firestore writes.
 * - If a Firebase user isn’t signed in, it attempts email/password sign-in using
 *   NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL and NEXT_PUBLIC_FIREBASE_ADMIN_PASSWORD.
 * - This is intended for admin pages that write to Firestore with rules requiring authentication.
 */
export default function AdminFirebaseAuth() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const attemptedRef = useRef(false);

  useEffect(() => {
    // Avoid duplicate attempts and wait until initial auth check completes
    if (attemptedRef.current || isUserLoading) return;
    attemptedRef.current = true;

    const email = process.env.NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL;
    const password = process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PASSWORD;

    // If already signed in, nothing to do
    if (user) return;

    // If env vars aren’t provided, skip silently
    if (!email || !password) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[AdminFirebaseAuth] Skipping Firebase sign-in: missing NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL/PASSWORD');
      }
      return;
    }

    // Attempt email/password sign-in
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        if (process.env.NODE_ENV !== 'production') {
          console.info('[AdminFirebaseAuth] Firebase sign-in successful');
        }
      })
      .catch((err) => {
        // Do not surface UI errors here; admin pages will still render and show
        // Firestore permission errors if rules deny writes.
        console.error('[AdminFirebaseAuth] Firebase sign-in failed:', err);
      });
  }, [auth, user, isUserLoading]);

  return null;
}

