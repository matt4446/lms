import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { env } from "$env/dynamic/private";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    debug: true, // Enable debug logging
    emailAndPassword: {
        enabled: true
    },
    //trustedOrigins: ['http://localhost:5174'],
    // socialProviders: {
    //     google: {
    //         clientId: env.GOOGLE_CLIENT_ID!,
    //         clientSecret: env.GOOGLE_CLIENT_SECRET!,
    //     }
    // },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user"
            }
        }
    }
});
