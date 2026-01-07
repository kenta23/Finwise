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

	await prisma.expenseCategories.create({
		data: {
			name: "Health",
		}
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
