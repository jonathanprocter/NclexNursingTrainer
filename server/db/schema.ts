import { z } from 'zod';
import { sql } from '@vercel/postgres';

export const UserSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string(),
    createdAt: z.date(),
    updatedAt: z.date()
});

export const AnalyticsSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    eventType: z.string(),
    eventData: z.record(z.unknown()),
    timestamp: z.date()
});

export type User = z.infer<typeof UserSchema>;
export type Analytics = z.infer<typeof AnalyticsSchema>;

export async function syncSchema() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS analytics (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id),
                event_type TEXT NOT NULL,
                event_data JSONB NOT NULL DEFAULT '{}',
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        return true;
    } catch (error) {
        console.error('Schema sync error:', error);
        return false;
    }
}
