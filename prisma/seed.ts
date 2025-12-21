import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import prisma from "@/lib/prisma";
import { PrismaClient } from "../lib/generated/prisma/client";

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
		where: { email: "rustymiguelramos@gmail.com" },
	});

	// Option 2: Get user by email (uncomment and use if you prefer)
	// const user = await prisma.user.findUnique({
	// 	where: { email: process.env.SEED_USER_EMAIL || "your-email@example.com" }
	// });

	// if (!user) {
	// 	throw new Error("No user found in database. Please create a user first before seeding.");
	// }

	const userId = user?.id;



	await prisma.expenses.createMany({
		data: [
			{
				description: "Foodssss",
				amount: 100,
				userId: user?.id as string,
				expenseCategoryId: "9c62aba6-3c3c-40aa-9912-96e5c01b6715",
				incomeId: "2a358cee-3b05-4d68-b3e8-0c2cf77be034",
			},
		],
	});
	console.log(`✅ Seeded ${5} income sources and ${6} expense categories`);
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
