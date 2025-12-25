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


	await prisma.savings.createMany({
		data: [
			{
				name: "Emergency Fund",
				type: "emergency",
				bankName: "BPI",
				accountNumber: "1234567890",
				currentAmount: 1000,
				goalAmount: 10000,
				notes: "This is my emergency fund",
				userId: userId as string,
			},
			{
				name: "Vacation Fund",
				type: "vacation",
				bankName: "BPI",
				accountNumber: "1234567890",
				currentAmount: 1000,
				goalAmount: 10000,
				notes: "This is my vacation fund",
				userId: userId as string,
			},
		]
	})

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
