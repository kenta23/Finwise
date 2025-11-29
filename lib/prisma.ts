import "dotenv/config";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const globalForPrisma = global as unknown as {
	prisma: PrismaClient;
};

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({ adapter }).$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
