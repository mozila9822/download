'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EventSearchInputSchema = z.object({
  area: z.string().min(2).describe('City or region to search for events'),
  dateRange: z
    .string()
    .optional()
    .describe('Desired date or date range (e.g., 2025-12 or 2025-12-01..2025-12-31)'),
  categories: z
    .array(z.string())
    .optional()
    .describe('Event categories like music, sports, tech, food, art'),
});
export type EventSearchInput = z.infer<typeof EventSearchInputSchema>;

const EventSchema = z.object({
  id: z.string().describe('Stable identifier'),
  title: z.string().describe('Event title'),
  date: z.string().describe('ISO date/time or friendly date'),
  venue: z.string().describe('Venue name'),
  city: z.string().describe('City or area'),
  price: z.string().describe('Price or range'),
  category: z.string().describe('Event category'),
  description: z.string().describe('Short description'),
  link: z.string().url().optional().describe('External link if available'),
  tags: z.array(z.string()).optional().describe('Helpful tags or keywords'),
});

const EventSearchOutputSchema = z.object({
  events: z.array(EventSchema).describe('List of discovered events'),
});
export type EventSearchOutput = z.infer<typeof EventSearchOutputSchema>;

export async function eventSearch(
  input: EventSearchInput
): Promise<EventSearchOutput> {
  return eventSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'eventSearchPrompt',
  input: { schema: EventSearchInputSchema },
  output: { schema: EventSearchOutputSchema },
  prompt:
    `You are an event discovery assistant.
Return a concise JSON object with a field "events" listing 6-10 relevant upcoming events.
Each event must include: id, title, date, venue, city, price, category, description, link (if known), and optional tags.
Focus the search in the area: {{{area}}}.
If dateRange is provided: {{{dateRange}}}; otherwise choose events within the next 2 months.
If categories provided: {{{categories}}}.
Constraints:
- Only include upcoming events (today onward). Do not include past dates or any year before the current year.
- Prefer the provided dateRange; if not given, choose dates within the next 2 months.
- Use precise YYYY-MM-DD dates where possible.
Be specific and avoid duplicates. Keep descriptions short.`,
});

const eventSearchFlow = ai.defineFlow(
  {
    name: 'eventSearchFlow',
    inputSchema: EventSearchInputSchema,
    outputSchema: EventSearchOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
