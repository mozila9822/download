'use server';

import { personalizedItinerarySuggestions } from '@/ai/flows/personalized-itinerary-suggestions';
import { z } from 'zod';
import { collection, addDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const ItinerarySchema = z.object({
  preferences: z.string().min(10, 'Please describe your preferences in more detail.'),
  travelHistory: z.string(),
  popularDestinations: z.string(),
});

type ItineraryState = {
  message?: string | null;
  itinerary?: string | null;
  errors?: {
    preferences?: string[];
    travelHistory?: string[];
    popularDestinations?: string[];
  } | null;
};

export async function getItinerarySuggestion(
  prevState: ItineraryState,
  formData: FormData
): Promise<ItineraryState> {
  const validatedFields = ItinerarySchema.safeParse({
    preferences: formData.get('preferences'),
    travelHistory: formData.get('travelHistory'),
    popularDestinations: formData.get('popularDestinations'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Generate Itinerary.',
    };
  }
  
  const { preferences, travelHistory, popularDestinations } = validatedFields.data;

  try {
    const result = await personalizedItinerarySuggestions({
      preferences,
      travelHistory,
      popularDestinations,
    });
    
    if (result.itinerary) {
      return {
        message: 'Itinerary generated successfully!',
        itinerary: result.itinerary,
        errors: null,
      };
    } else {
      return {
        message: 'Failed to generate an itinerary. Please try again.',
        itinerary: null,
        errors: null,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      message: 'An unexpected error occurred. Please try again later.',
      itinerary: null,
      errors: null,
    };
  }
}

const WorkerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
});

type WorkerState = {
    message?: string | null;
    errors?: {
        fullName?: string[];
        email?: string[];
        role?: string[];
    } | null;
}

export async function createWorker(prevState: WorkerState, formData: FormData) : Promise<WorkerState> {
    const validatedFields = WorkerSchema.safeParse({
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        role: formData.get('role'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to create worker.',
        };
    }

    const { fullName, email, role } = validatedFields.data;
    const [firstName, lastName] = fullName.split(' ');

    const { firestore } = initializeFirebase();

    try {
        await addDoc(collection(firestore, 'users'), {
            firstName,
            lastName,
            email,
            role,
            status: 'Active',
            addedDate: new Date().toLocaleDateString(),
        });

        return {
            message: 'Worker created successfully!',
            errors: null,
        }
    } catch(e) {
        console.error(e);
        return {
            message: 'Failed to create worker.',
            errors: null,
        }
    }
}
