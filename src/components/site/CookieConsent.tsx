"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const v = typeof window !== "undefined" ? window.localStorage.getItem("cookieConsent") : null;
    setShow(!v);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-xl border bg-card shadow-lg">
      <div className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
        <p className="text-sm text-muted-foreground">We use cookies to improve your experience. Read our <Link href="/legal/cookie-policy" className="underline">Cookie Policy</Link>.</p>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" onClick={() => { window.localStorage.setItem("cookieConsent", "dismissed"); setShow(false); }}>Dismiss</Button>
          <Button onClick={() => { window.localStorage.setItem("cookieConsent", "accepted"); setShow(false); }}>Accept</Button>
        </div>
      </div>
    </div>
  );
}

