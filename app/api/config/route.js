import dbConnect from '@/lib/mongodb';
import GlobalStyles from '@/models/GlobalStyles';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await dbConnect();
        const config = await GlobalStyles.findOne({});
        return NextResponse.json(config || {});
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch global styles' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const data = await request.json();

        // Replace or Update the single global styles document
        let config = await GlobalStyles.findOne({});
        if (config) {
            config = await GlobalStyles.findOneAndUpdate({}, data, { new: true });
        } else {
            config = await GlobalStyles.create(data);
        }

        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save global styles' }, { status: 500 });
    }
}
