import "dotenv/config";
import { PrismaClient } from "./generated/client/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // --- Admin User ---
  const adminHash = await bcrypt.hash("admin123456", 12);
  await prisma.user.upsert({
    where: { email: "admin@yogastudio.com" },
    update: {},
    create: {
      fullName: "Super Admin",
      email: "admin@yogastudio.com",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin created: admin@yogastudio.com / admin123456");

  // --- Members ---
  const memberHash = await bcrypt.hash("member1234", 12);
  const members = [
    {
      fullName: "Aisyah Putri",
      email: "aisyah@example.com",
      phone: "6281234567001",
      passwordHash: memberHash,
      role: "MEMBER" as const,
      isActive: true,
      membershipExpiresAt: new Date("2026-12-31"),
    },
    {
      fullName: "Dewi Lestari",
      email: "dewi@example.com",
      phone: "6281234567002",
      passwordHash: memberHash,
      role: "MEMBER" as const,
      isActive: true,
      membershipExpiresAt: new Date("2027-06-30"),
    },
    {
      fullName: "Rina Sari",
      email: "rina@example.com",
      phone: "6281234567003",
      passwordHash: memberHash,
      role: "MEMBER" as const,
      isActive: true,
      membershipExpiresAt: new Date("2026-06-15"),
    },
  ];

  for (const m of members) {
    await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: m,
    });
  }
  console.log("✅ Members created (password: member1234)");

  // --- Coaches (Data Master) ---
  const coachData = [
    {
      name: "Ibu Ratna",
      phone: "6281234567010",
      gender: "Perempuan",
      photo:
        "https://ui-avatars.com/api/?name=Ratna&background=C08497&color=fff",
      certificate: "RYT-500",
      specialty: "Vinyasa, Hatha",
    },
    {
      name: "Kak Sinta",
      phone: "6281234567011",
      gender: "Perempuan",
      photo:
        "https://ui-avatars.com/api/?name=Sinta&background=C08497&color=fff",
      certificate: "E-RYT 200",
      specialty: "Yin Yoga, Restorative",
    },
    {
      name: "Coach Dian",
      phone: "6281234567012",
      gender: "Laki-laki",
      photo:
        "https://ui-avatars.com/api/?name=Dian&background=C08497&color=fff",
      certificate: "RYT-200",
      specialty: "Power Yoga, Ashtanga",
    },
  ];

  for (const c of coachData) {
    // Use name to check if already exists (simple approach)
    const existing = await prisma.coach.findFirst({
      where: { name: c.name },
    });
    if (!existing) {
      await prisma.coach.create({ data: c });
    }
  }
  console.log("✅ Coaches created (data master)");

  // --- Schedules ---
  const schedules = [
    {
      title: "Morning Vinyasa Flow",
      date: new Date("2026-04-05"),
      timeRange: "06.00-07.00",
      coach: "Ibu Ratna",
      coachPhoto:
        "https://ui-avatars.com/api/?name=Ratna&background=C08497&color=fff",
      certificate: "RYT-500",
      tools: "Mat, Blok, Strap",
      meetingId: "123 456 7890",
      meetingPass: "yoga2026",
      zoomUrl: "https://zoom.us/j/1234567890",
      isActive: true,
    },
    {
      title: "Gentle Yin Yoga",
      date: new Date("2026-04-06"),
      timeRange: "17.00-18.00",
      coach: "Kak Sinta",
      coachPhoto:
        "https://ui-avatars.com/api/?name=Sinta&background=C08497&color=fff",
      certificate: "E-RYT 200",
      tools: "Mat, Bolster",
      meetingId: "987 654 3210",
      meetingPass: "yin2026",
      zoomUrl: "https://zoom.us/j/9876543210",
      isActive: true,
    },
    {
      title: "Power Yoga Challenge",
      date: new Date("2026-04-07"),
      timeRange: "07.00-08.00",
      coach: "Coach Dian",
      coachPhoto:
        "https://ui-avatars.com/api/?name=Dian&background=C08497&color=fff",
      certificate: "RYT-200",
      tools: "Mat, Handuk",
      meetingId: "555 666 7777",
      meetingPass: "power26",
      zoomUrl: "https://zoom.us/j/5556667777",
      isActive: true,
    },
  ];

  for (const s of schedules) {
    await prisma.schedule.create({ data: s });
  }
  console.log("✅ Schedules created");

  // --- Recordings ---
  const recordings = [
    {
      title: "Hatha Yoga Dasar",
      date: new Date("2026-03-20"),
      coach: "Ibu Ratna",
      duration: "60 menit",
      url: "https://drive.google.com/file/example1",
      isPublished: true,
    },
    {
      title: "Yin Yoga untuk Pemula",
      date: new Date("2026-03-15"),
      coach: "Kak Sinta",
      duration: "45 menit",
      url: "https://drive.google.com/file/example2",
      isPublished: true,
    },
    {
      title: "Yoga Nidra Deep Rest",
      date: new Date("2026-03-10"),
      coach: "Coach Dian",
      duration: "30 menit",
      url: "https://drive.google.com/file/example3",
      isPublished: true,
    },
    {
      title: "Prenatal Yoga Session",
      date: new Date("2026-03-05"),
      coach: "Ibu Ratna",
      duration: "50 menit",
      url: "https://drive.google.com/file/example4",
      isPublished: false,
    },
  ];

  for (const r of recordings) {
    await prisma.recording.create({ data: r });
  }
  console.log("✅ Recordings created");

  // --- Announcements ---
  await prisma.announcement.createMany({
    data: [
      {
        message:
          "Selamat datang di Virtual Studio! Kelas baru tersedia setiap minggu. Cek jadwal live untuk info lengkap.",
        isActive: true,
      },
      {
        message:
          "Workshop spesial bulan April: Yoga & Mindfulness bersama Ibu Ratna. Daftar sekarang!",
        isActive: true,
      },
    ],
  });
  console.log("✅ Announcements created");

  // --- App Config ---
  const configs = [
    { key: "wa_admin", value: "6281234567890" },
    { key: "email_admin", value: "admin@yogastudio.com" },
  ];

  for (const c of configs) {
    await prisma.appConfig.upsert({
      where: { key: c.key },
      update: { value: c.value },
      create: c,
    });
  }
  console.log("✅ App configs created");

  console.log("\n🎉 Seeding complete!");
  console.log("─────────────────────────────────");
  console.log("Admin  : admin@yogastudio.com / admin123456");
  console.log("Member : aisyah@example.com  / member1234");
  console.log("Member : dewi@example.com    / member1234");
  console.log("Member : rina@example.com    / member1234");
  console.log("─────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
