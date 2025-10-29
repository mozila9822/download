'use server';

/**
 * @fileOverview A personalized itinerary suggestion AI agent.
 *
 * - personalizedItinerarySuggestions - A function that provides personalized itinerary suggestions.
 * - PersonalizedItinerarySuggestionsInput - The input type for the personalizedItinerarySuggestions function.
 * - PersonalizedItinerarySuggestionsOutput - The return type for the personalizedItinerarySuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedItinerarySuggestionsInputSchema = z.object({
  preferences: z
    .string()
    .describe('The user preferences for the travel itinerary.'),
  travelHistory: z
    .string()
    .describe('The user travel history, including past destinations.'),
  popularDestinations: z
    .string()
    .describe('The current data on popular destinations.'),
});
export type PersonalizedItinerarySuggestionsInput = z.infer<
  typeof PersonalizedItinerarySuggestionsInputSchema
>;

const PersonalizedItinerarySuggestionsOutputSchema = z.object({
  itinerary: z.string().describe('The suggested personalized itinerary.'),
});
export type PersonalizedItinerarySuggestionsOutput = z.infer<
  typeof PersonalizedItinerarySuggestionsOutputSchema
>;

export async function personalizedItinerarySuggestions(
  input: PersonalizedItinerarySuggestionsInput
): Promise<PersonalizedItinerarySuggestionsOutput> {
  return personalizedItinerarySuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedItinerarySuggestionsPrompt',
  input: {schema: PersonalizedItinerarySuggestionsInputSchema},
  output: {schema: PersonalizedItinerarySuggestionsOutputSchema},
  prompt: `You are an expert travel assistant. Based on the user's preferences, travel history, and current data on popular destinations, suggest a personalized travel itinerary.\n\nUser Preferences: {{{preferences}}}\nTravel History: {{{travelHistory}}}\nPopular Destinations: {{{popularDestinations}}}`,
});

const personalizedItinerarySuggestionsFlow = ai.defineFlow(
  {
    name: 'personalizedItinerarySuggestionsFlow',
    inputSchema: PersonalizedItinerarySuggestionsInputSchema,
    outputSchema: PersonalizedItinerarySuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
