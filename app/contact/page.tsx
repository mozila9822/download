'use client';

import { useState } from 'react';
import SiteLayout from '@/components/site/SiteLayout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Headphones } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMessage = message.trim();
    const cleanSubject = subject.trim() || 'Contact Request';
    if (!cleanMessage) {
      toast({ title: 'Message is required', description: 'Please enter your message.' });
      return;
    }
    setLoading(true);
    try {
      // First try to create an authenticated support thread (for signed-in users)
      const res = await fetch('/api/support/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: cleanSubject, messageText: cleanMessage }),
      });

      if (res.ok) {
        toast({ title: 'Message sent', description: 'We have opened a support thread for you.' });
        setMessage('');
        setSubject('');
        return;
      }

      // If not authenticated, fall back to contact submission (name/email required)
      const contactRes = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject: cleanSubject, messageText: cleanMessage }),
      });

      if (contactRes.ok) {
        toast({ title: 'Message sent', description: 'Thanks! We will get back to you shortly.' });
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        const err = await contactRes.json().catch(() => ({ error: 'Failed to send message' }));
        toast({ title: 'Unable to send', description: err.error || 'Please sign in and try again.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Network error', description: 'Please try again later.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <div className="container py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <Headphones className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-4xl md:text-5xl font-headline font-bold">Contact Us</h1>
            <p className="mt-4 text-muted-foreground md:text-lg">Have a question? Reach out and we’ll help you ASAP.</p>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>We typically respond within 24 hours.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Booking help, itinerary question, etc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} placeholder="Tell us how we can help…" />
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Signed in? You can also use our <Link href="/support" className="text-primary hover:underline">Support</Link> page.</p>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Sending…' : 'Send Message'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </SiteLayout>
  );
}

