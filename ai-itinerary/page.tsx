import SiteLayout from '@/components/site/SiteLayout';
import ItineraryForm from '@/components/site/ItineraryForm';
import { Bot } from 'lucide-react';

export default function AiItineraryPage() {
  return (
    <SiteLayout>
      <div className="container py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <Bot className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-4xl md:text-5xl font-headline font-bold">
              AI-Powered Itinerary Planner
            </h1>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Tell us about your travel style and let our AI craft the perfect
              trip for you.
            </p>
          </div>
          <div className="mt-12">
            <ItineraryForm />
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
