/**
 * Run this with:
 *   npx ts-node seed-db.ts
 * or
 *   node dist/seed-db.js
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';

// 🧠 1️⃣ Load your service account key
// (You’ll need to download this from Firebase Console → Project Settings → Service Accounts → "Generate new private key")
const serviceAccount = JSON.parse(
  fs.readFileSync('./serviceAccountKey.json', 'utf8')
);

// 🧱 2️⃣ Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function seedDb() {
  const batch = db.batch();

  // 🔹 Example data
  const services = [
    { name: 'Housekeeping', price: 100, ownerId: 'admin-seed' },
    { name: 'Maintenance', price: 80, ownerId: 'admin-seed' },
    { name: 'Reception', price: 120, ownerId: 'admin-seed' },
  ];

  // 🔹 Reference your collection
  const servicesRef = db.collection('services');

  // 🔹 Add each document to the batch
  services.forEach((service) => {
    const docRef = servicesRef.doc(); // auto-ID
    batch.set(docRef, service);
  });

  try {
    await batch.commit();
    console.log('✅ Firestore seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
  }
}

seedDb();
