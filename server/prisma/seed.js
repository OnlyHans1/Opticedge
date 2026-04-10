import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding OpticEdge database...\n');

  // ─── Clear existing data ──────────────────────────────────────
  await prisma.screening.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ Cleared existing data');

  // ─── Create Users ─────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('password123', 10);

  const worker = await prisma.user.create({
    data: {
      name: 'Kader Ahmad',
      username: 'kader_ahmad',
      password_hash: hashedPassword,
      role: 'worker',
      location: 'Desa Mekar, Kec. Cikampek',
    },
  });
  console.log(`✓ Created worker: ${worker.username}`);

  const worker2 = await prisma.user.create({
    data: {
      name: 'Siti Nurhaliza',
      username: 'siti_nur',
      password_hash: hashedPassword,
      role: 'worker',
      location: 'Desa Sukamaju, Kec. Purwakarta',
    },
  });
  console.log(`✓ Created worker: ${worker2.username}`);

  const doctor = await prisma.user.create({
    data: {
      name: 'Dr. Ratna Dewi, Sp.M',
      username: 'dr_ratna',
      password_hash: hashedPassword,
      role: 'doctor',
      location: 'RSUD Kota Karawang',
    },
  });
  console.log(`✓ Created doctor: ${doctor.username}`);

  const doctor2 = await prisma.user.create({
    data: {
      name: 'Dr. Budi Santoso, Sp.M',
      username: 'dr_budi',
      password_hash: hashedPassword,
      role: 'doctor',
      location: 'RS Mata Cicendo, Bandung',
    },
  });
  console.log(`✓ Created doctor: ${doctor2.username}`);

  // ─── Create Patients ──────────────────────────────────────────
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        nik: '3201234567890001',
        name: 'Siti Aminah',
        age: 55,
        wa_number: '081234567890',
      },
    }),
    prisma.patient.create({
      data: {
        nik: '3201234567890002',
        name: 'Bapak Udin',
        age: 68,
        wa_number: '081234567891',
      },
    }),
    prisma.patient.create({
      data: {
        nik: '3201234567890003',
        name: 'Ibu Mariam',
        age: 42,
        wa_number: '081234567892',
      },
    }),
    prisma.patient.create({
      data: {
        nik: '3201234567890004',
        name: 'Pak Joko',
        age: 73,
        wa_number: '081234567893',
      },
    }),
    prisma.patient.create({
      data: {
        nik: '3201234567890005',
        name: 'Neng Rani',
        age: 35,
        wa_number: '081234567894',
      },
    }),
  ]);
  console.log(`✓ Created ${patients.length} patients`);

  // ─── Create Screenings ────────────────────────────────────────
  const screenings = await Promise.all([
    // High confidence — urgent, needs doctor review
    prisma.screening.create({
      data: {
        patient_id: patients[0].id,
        worker_id: worker.id,
        eye_image_url: 'https://placehold.co/400x300/1a1a2e/eee?text=Eye+Scan+1',
        ai_prediction: 'Cataract Risk - Mature',
        ai_confidence: 0.94,
        sync_status: 'synced',
        doc_validation: 'pending',
      },
    }),
    // Medium confidence, pending
    prisma.screening.create({
      data: {
        patient_id: patients[1].id,
        worker_id: worker.id,
        eye_image_url: 'https://placehold.co/400x300/1a1a2e/eee?text=Eye+Scan+2',
        ai_prediction: 'Glaucoma Suspect',
        ai_confidence: 0.78,
        sync_status: 'synced',
        doc_validation: 'pending',
      },
    }),
    // Already reviewed by doctor
    prisma.screening.create({
      data: {
        patient_id: patients[2].id,
        worker_id: worker2.id,
        doctor_id: doctor.id,
        eye_image_url: 'https://placehold.co/400x300/1a1a2e/eee?text=Eye+Scan+3',
        ai_prediction: 'Normal',
        ai_confidence: 0.91,
        sync_status: 'synced',
        doc_validation: 'approved',
        doctor_notes: 'Confirmed normal. No signs of pathology. Recommend follow-up in 12 months.',
        reviewed_at: new Date(),
      },
    }),
    // High confidence glaucoma — urgent
    prisma.screening.create({
      data: {
        patient_id: patients[3].id,
        worker_id: worker.id,
        eye_image_url: 'https://placehold.co/400x300/1a1a2e/eee?text=Eye+Scan+4',
        ai_prediction: 'Glaucoma - High Risk',
        ai_confidence: 0.89,
        sync_status: 'synced',
        doc_validation: 'pending',
      },
    }),
    // Revised by doctor
    prisma.screening.create({
      data: {
        patient_id: patients[4].id,
        worker_id: worker2.id,
        doctor_id: doctor.id,
        eye_image_url: 'https://placehold.co/400x300/1a1a2e/eee?text=Eye+Scan+5',
        ai_prediction: 'Diabetic Retinopathy',
        ai_confidence: 0.65,
        sync_status: 'synced',
        doc_validation: 'revised',
        doctor_notes: 'AI prediction revised. Actual finding: mild hypertensive retinopathy. Refer to internal medicine for BP management.',
        reviewed_at: new Date(),
      },
    }),
  ]);
  console.log(`✓ Created ${screenings.length} screenings`);

  console.log('\n✅ Seed complete!\n');
  console.log('Demo Credentials:');
  console.log('─────────────────────────────────────');
  console.log('Worker:  kader_ahmad / password123');
  console.log('Worker:  siti_nur    / password123');
  console.log('Doctor:  dr_ratna    / password123');
  console.log('Doctor:  dr_budi     / password123');
  console.log('─────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
