'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { getItinerarySuggestion } from '@/app/actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const initialState = {
  message: null,
  itinerary: null,
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Generating Your Itinerary...' : 'Generate Itinerary'}
    </Button>
  );
}

export default function ItineraryForm() {
  const [state, formAction] = useActionState(getItinerarySuggestion, initialState);

  return (
    <div>
      <Card>
        <CardContent className="pt-6">
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="preferences">Your Preferences</Label>
              <Textarea
                id="preferences"
                name="preferences"
                placeholder="e.g., 'I love historical sites, quiet cafes, and scenic walks. I'm not a fan of crowded tourist traps.'"
                rows={4}
                required
              />
              {state.errors?.preferences && (
                <p className="text-sm text-destructive">{state.errors.preferences[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="travelHistory">Travel History (Optional)</Label>
              <Input
                id="travelHistory"
                name="travelHistory"
                placeholder="e.g., 'Paris, Tokyo, Rome'"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="popularDestinations">Focus on Popular Destinations? (Optional)</Label>
              <Input
                id="popularDestinations"
                name="popularDestinations"
                placeholder="e.g., 'Yes, show me popular spots' or 'No, I prefer off-the-beaten-path'"
              />
            </div>

            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      {state?.message && !state.itinerary && (
        <Alert variant="destructive" className="mt-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state?.itinerary && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Your Personalized Itinerary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-foreground dark:prose-invert whitespace-pre-wrap">
              {state.itinerary}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
