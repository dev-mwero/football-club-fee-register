import { hashPassword } from "../lib/auth";
import { connectDB } from "../lib/db";
import { FeeRecord } from "../models/FeeRecord";
import { FeeStructure } from "../models/FeeStructure";
import { Player } from "../models/Player";
import { User } from "../models/User";

async function seed() {
  console.log("Seeding database...\n");

  await connectDB();

  // --- 1. Admin ---
  const adminEmail = "admin@academy.com";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: "Academy Admin",
      email: adminEmail,
      phone: "+254 700 000 000",
      password: await hashPassword("admin123"),
      role: "ADMIN",
    });
    console.log("Created admin: admin@academy.com / admin123");
  } else {
    console.log("Admin already exists, skipping.");
  }

  // --- 2. Fee structures ---
  const feeDefs = [
    {
      name: "Registration Fee",
      amount: 2000,
      frequency: "ONE_TIME" as const,
      description: "One-time registration for new players",
    },
    {
      name: "Monthly Training Fee",
      amount: 5000,
      frequency: "MONTHLY" as const,
      description: "Standard monthly training fee",
    },
    {
      name: "Tournament Fee",
      amount: 3000,
      frequency: "ONE_TIME" as const,
      description: "Per-tournament participation fee",
    },
    {
      name: "Annual Subscription",
      amount: 30000,
      frequency: "YEARLY" as const,
      description: "Full year academy subscription",
    },
  ];

  const fees: Record<string, string> = {};
  for (const def of feeDefs) {
    let fee = await FeeStructure.findOne({ name: def.name });
    if (!fee) {
      fee = await FeeStructure.create(def);
      console.log(`Created fee: ${def.name} — KES ${def.amount}`);
    } else {
      console.log(`Fee "${def.name}" already exists, skipping.`);
    }
    fees[def.name] = fee._id.toString();
  }

  // --- 3. Parents + Players ---
  const parentData = [
    {
      name: "Jane Mwangi",
      email: "jane.mwangi@email.com",
      phone: "+254 722 100 001",
      children: [
        {
          fullName: "Kevin Mwangi",
          dob: "2014-03-15",
          position: "Forward",
          category: "U-12",
        },
        {
          fullName: "Sarah Mwangi",
          dob: "2016-07-22",
          position: "Midfielder",
          category: "U-10",
        },
      ],
    },
    {
      name: "Peter Otieno",
      email: "peter.otieno@email.com",
      phone: "+254 722 100 002",
      children: [
        {
          fullName: "Brian Otieno",
          dob: "2012-11-02",
          position: "Defender",
          category: "U-14",
        },
      ],
    },
    {
      name: "Grace Kimani",
      email: "grace.kimani@email.com",
      phone: "+254 722 100 003",
      children: [
        {
          fullName: "David Kimani",
          dob: "2010-05-10",
          position: "Goalkeeper",
          category: "U-16",
        },
        {
          fullName: "Esther Kimani",
          dob: "2013-09-18",
          position: "Midfielder",
          category: "U-12",
        },
        {
          fullName: "James Kimani",
          dob: "2015-01-30",
          position: "Forward",
          category: "U-10",
        },
      ],
    },
    {
      name: "Samuel Wanjala",
      email: "samuel.wanjala@email.com",
      phone: "+254 722 100 004",
      children: [
        {
          fullName: "Michael Wanjala",
          dob: "2008-08-14",
          position: "Defender",
          category: "U-18",
        },
        {
          fullName: "Diana Wanjala",
          dob: "2011-12-05",
          position: "Forward",
          category: "U-14",
        },
      ],
    },
  ];

  const registrationFee = fees["Registration Fee"];
  const monthlyFee = fees["Monthly Training Fee"];

  for (const parent of parentData) {
    const hashed = await hashPassword("parent123");
    let user = await User.findOne({ email: parent.email });

    if (!user) {
      user = await User.create({
        name: parent.name,
        email: parent.email,
        phone: parent.phone,
        password: hashed,
        role: "PARENT",
      });
      console.log(`Created parent: ${parent.email} / parent123`);
    } else {
      console.log(`Parent ${parent.email} already exists, skipping.`);
    }

    for (const child of parent.children) {
      const existing = await Player.findOne({ fullName: child.fullName });
      if (existing) {
        console.log(`  Player "${child.fullName}" already exists, skipping.`);
        continue;
      }

      const player = await Player.create({
        fullName: child.fullName,
        dateOfBirth: new Date(child.dob),
        position: child.position,
        teamCategory: child.category,
        parent: user._id,
        status: "ACTIVE",
      });
      console.log(`  Created player: ${child.fullName} (${child.category})`);

      // Assign registration fee (assume paid)
      const regRecord = await FeeRecord.findOne({
        player: player._id,
        feeStructure: registrationFee,
      });
      if (!regRecord) {
        const reg = await FeeStructure.findById(registrationFee);
        await FeeRecord.create({
          player: player._id,
          feeStructure: registrationFee,
          amountDue: reg?.amount,
          amountPaid: reg?.amount,
          balance: 0,
          status: "PAID",
        });
        console.log(`    ✓ Registration fee PAID`);
      }

      // Assign monthly training fee (mix of statuses)
      const monthRecord = await FeeRecord.findOne({
        player: player._id,
        feeStructure: monthlyFee,
      });
      if (!monthRecord) {
        const month = await FeeStructure.findById(monthlyFee);
        const amount = month?.amount;

        let status: "PAID" | "PARTIAL" | "UNPAID";
        let paid: number;

        if (child.fullName === "Kevin Mwangi") {
          status = "PAID";
          paid = amount;
        } else if (child.fullName === "Brian Otieno") {
          status = "UNPAID";
          paid = 0;
        } else if (child.fullName === "David Kimani") {
          status = "PARTIAL";
          paid = Math.floor(amount * 0.6);
        } else if (child.fullName === "Esther Kimani") {
          status = "PAID";
          paid = amount;
        } else if (child.fullName === "James Kimani") {
          status = "UNPAID";
          paid = 0;
        } else {
          status = "PARTIAL";
          paid = Math.floor(amount * 0.4);
        }

        await FeeRecord.create({
          player: player._id,
          feeStructure: monthlyFee,
          amountDue: amount,
          amountPaid: paid,
          balance: amount - paid,
          status,
        });
        console.log(
          `    ${status === "PAID" ? "✓" : status === "PARTIAL" ? "~" : "✗"} Monthly fee ${status}`,
        );
      }
    }
  }

  console.log("\nSeed complete.");
  console.log("─── Login credentials ───");
  console.log("Admin:  admin@academy.com / admin123");
  console.log("Parent: jane.mwangi@email.com / parent123");
  console.log("Parent: peter.otieno@email.com / parent123");
  console.log("Parent: grace.kimani@email.com / parent123");
  console.log("Parent: samuel.wanjala@email.com / parent123");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
