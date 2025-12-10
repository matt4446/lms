import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { env } from '$env/dynamic/private';

const rawConnectionString = env.DATABASE_URL || "postgres://postgres:postgres@localhost:51213/drillskill";

function getConnectionString(connectionString: string): string {
    if (connectionString.startsWith('postgres://') || connectionString.startsWith('postgresql://')) {
        return connectionString;
    }
    
    // Parse .NET style connection string
    const config: any = {
        host: 'localhost',
        port: '5432',
        database: 'drillskill',
        user: 'postgres',
        password: ''
    };
    
    const parts = connectionString.split(';');
    for (const part of parts) {
        const [key, value] = part.split('=');
        if (key && value) {
            const k = key.trim().toLowerCase();
            if (k === 'host' || k === 'server') config.host = value.trim();
            if (k === 'port') config.port = value.trim();
            if (k === 'database') config.database = value.trim();
            if (k === 'username' || k === 'user id' || k === 'user') config.user = value.trim();
            if (k === 'password') config.password = value.trim();
        }
    }
    
    return `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
}

const connectionString = getConnectionString(rawConnectionString);
console.log("Prisma connecting to:", connectionString.replace(/:[^:@]*@/, ':****@')); // Log masked URL

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };
