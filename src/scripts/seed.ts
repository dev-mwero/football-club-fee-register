import { connectDB } from "../lib/db";
import { User } from "../models/User";
import { FeeStructure } from "../models/FeeStructure";
import { hashPassword } from "../lib/auth";

async function seed() {
  console.log("Seeding database...\n");

  await connectDB();

  // --- Admin user ---
  const adminEmail = "admin@academy.com";
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    console.log("Admin already exists, skipping.");
  } else {
    const hashed = await hashPassword("admin123");
    await User.create({
      name: "Academy Admin",
      email: adminEmail,
      phone: "+254 700 000 000",
      password: hashed,
      role: "ADMIN",
    });
    console.log("Created admin: admin@academy.com / admin123");
  }

  // --- Default fee structures ---
  const defaultFees = [
    { name: "Registration Fee", amount: 2000, frequency: "ONE_TIME" as const, description: "One-time registration for new players" },
    { name: "Monthly Training Fee", amount: 5000, frequency: "MONTHLY" as const, description: "Standard monthly training fee" },
    { name: "Tournament Fee", amount: 3000, frequency: "ONE_TIME" as const, description: "Per-tournament participation fee" },
    { name: "Annual Subscription", amount: 30000, frequency: "YEARLY" as const, description: "Full year academy subscription" },
  ];

  for (const fee of defaultFees) {
    const exists = await FeeStructure.findOne({ name: fee.name });
    if (exists) {
      console.log(`Fee "${fee.name}" already exists, skipping.`);
    } else {
      await FeeStructure.create(fee);
      console.log(`Created fee: ${fee.name} — KES ${fee.amount}`);
    }
  }

  console.log("\nSeed complete.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
