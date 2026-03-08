import dbConnect from '@/lib/mongodb';
import FrontPage from '@/models/FrontPage';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await dbConnect();
        const data = await FrontPage.findOne({});
        return NextResponse.json(data || {});
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch front page data' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const data = await request.json();

        let doc = await FrontPage.findOne({});
        if (doc) {
            doc = await FrontPage.findOneAndUpdate({}, data, { new: true });
        } else {
            doc = await FrontPage.create(data);
        }

        return NextResponse.json(doc);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save front page data' }, { status: 500 });
    }
}
