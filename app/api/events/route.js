import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await dbConnect();
        const events = await Event.find({}).sort({ order: 1 });
        return NextResponse.json(events);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const data = await request.json();

        // In this app, the user typically sends an array of all events from the AdminPanel
        if (Array.isArray(data)) {
            // Clear existing and replace with new set (maintaining the app's current logic of bulk save)
            await Event.deleteMany({});
            const events = await Event.insertMany(data);
            return NextResponse.json(events);
        } else {
            // Single event creation
            const event = await Event.create(data);
            return NextResponse.json(event);
        }
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: 'Failed to save events', details: error.message }, { status: 500 });
    }
}
