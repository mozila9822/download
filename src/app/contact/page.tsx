"use client";
import SiteLayout from "@/components/site/SiteLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const submit = async () => {
    try {
      setSending(true);
      setStatus(null);
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, message }) });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.ok) setStatus('Sent'); else setStatus(json?.error || 'Failed');
    } catch (e: any) { setStatus(e?.message || 'Failed') } finally { setSending(false) }
  };

  return (
    <SiteLayout>
      <div className="container py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
                <CardDescription>Send an enquiry and our advisors will reach out.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <Label>Message</Label>
                    <Input value={message} onChange={(e) => setMessage(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={submit} disabled={sending}>{sending ? 'Sending…' : 'Send'}</Button>
                    <Button variant="secondary" asChild><a href="/support">Chat with an advisor</a></Button>
                  </div>
                  {status && <div className="text-sm text-muted-foreground">{status}</div>}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Our Office</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Phone: +44 (0)20 1234 5678</div>
                  <div>Email: hello@voyagerhub.co.uk</div>
                  <div>Address: 123 High Street, London, UK</div>
                </div>
                <div className="mt-4">
                  <iframe title="Map" src="https://maps.google.com/maps?q=london&t=&z=13&ie=UTF8&iwloc=&output=embed" className="w-full h-48 rounded-md border" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

