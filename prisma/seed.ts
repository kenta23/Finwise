import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import prisma from "@/lib/prisma";
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// const prisma = new PrismaClient({ adapter });

async function main() {
	// Add your seed data here
	console.log("Seeding database...");

	// Get the first user from the database (or use a specific email)
	// Option 1: Get first user
	const user = await prisma.user.findUnique({
		where: { email: "rustymiguelramos@gmail.com" }
	});

	// Option 2: Get user by email (uncomment and use if you prefer)
	// const user = await prisma.user.findUnique({
	// 	where: { email: process.env.SEED_USER_EMAIL || "your-email@example.com" }
	// });

	if (!user) {
		throw new Error("No user found in database. Please create a user first before seeding.");
	}

	const userId = user.id;


	await prisma.expenses.createMany({
		data: [
			{
				category: "food",
				description: "Restaurant",
				amount: 3500,
				userId,
			},
			{
				category: "transportation",
				description: "Uber ride",
				amount: 2500,
				userId,
			},
			{
				category: "entertainment",
				description: "Movie tickets",
				amount: 2000,
				userId,
			},
			{
				category: "food",
				description: "Grocery shopping",
				amount: 5000,
				userId,
			},
			{
				category: "utilities",
				description: "Electricity bill",
				amount: 3000,
				userId,
			}
		]
	});

	console.log(`✅ Seeded ${5} expenses for user: ${user.email}`);
}
main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		await pool.end();
	});

