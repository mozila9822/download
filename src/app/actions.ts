'use server';

import { personalizedItinerarySuggestions } from '@/ai/flows/personalized-itinerary-suggestions';
import { z } from 'zod';
import { prisma, prismaOrNull } from '@/lib/db';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

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

    try {
        const db = await prismaOrNull();
        if (db) {
            try {
                await db.user.create({
                    data: {
                        email,
                        name: fullName,
                        role: role as any,
                    },
                });
            } catch (err: any) {
                const isUniqueEmail = err && err.code === 'P2002' && (
                  (Array.isArray(err.meta?.target) && err.meta?.target.includes('email')) ||
                  String(err.meta?.target || '').includes('email')
                )
                if (isUniqueEmail) {
                    return {
                        message: 'Email already registered. Please use a different email.',
                        errors: { email: ['Email already registered'] },
                    }
                }
                throw err
            }
        } else {
            // Direct MySQL fallback when Prisma engine is unavailable
            const host = process.env.MYSQL_HOST
            const userEnv = process.env.MYSQL_USER
            const passwordEnv = process.env.MYSQL_PASSWORD
            const database = process.env.MYSQL_DATABASE
            const port = Number(process.env.MYSQL_PORT || 3306)
            if (!host || !userEnv || !passwordEnv || !database) {
                return {
                    message: 'Database unreachable. Please configure MYSQL_* envs or try again shortly.',
                    errors: null,
                }
            }
            let conn: mysql.Connection | null = null
            try {
                conn = await mysql.createConnection({ host, user: userEnv, password: passwordEnv, database, port })
                const normalizedEmail = email.trim().toLowerCase()
                const [existingRows] = await conn.query<any[]>('SELECT id FROM `User` WHERE email = ? LIMIT 1', [normalizedEmail])
                if (Array.isArray(existingRows) && existingRows.length) {
                    return {
                        message: 'Email already registered. Please use a different email.',
                        errors: { email: ['Email already registered'] },
                    }
                }
                await conn.execute<any>(
                  'INSERT INTO `User` (email, name, role, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
                  [normalizedEmail, fullName, role]
                )
            } catch (err: any) {
                const msg = err?.message || String(err)
                if (msg.includes('ER_DUP_ENTRY')) {
                    return {
                        message: 'Email already registered. Please use a different email.',
                        errors: { email: ['Email already registered'] },
                    }
                }
                throw err
            } finally {
                if (conn) await conn.end().catch(() => {})
            }
        }
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

export async function grantSuperAdmin(email: string, name?: string): Promise<{ ok: boolean; message: string }>{
    try {
        if (!email) {
            return { ok: false, message: 'Missing email' }
        }
        if (!prisma) {
            // Non-persistent dev fallback
            return { ok: true, message: `Dev fallback: ${email} granted SuperAdmin (not persisted)` }
        }
        await prisma.user.upsert({
            where: { email },
            update: { role: 'SuperAdmin' as any, name },
            create: { email, name, role: 'SuperAdmin' as any },
        })
        return { ok: true, message: `${email} is now SuperAdmin` }
    } catch (e: any) {
        console.error('[grantSuperAdmin] error', e)
        return { ok: false, message: e?.message || 'Failed to grant SuperAdmin' }
    }
}
