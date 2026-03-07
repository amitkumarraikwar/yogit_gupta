import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    heading: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    images: {
        type: [mongoose.Schema.Types.Mixed],
        default: [],
    },
    styles: {
        pageBackground: String,
        headingFont: String,
        headingSize: String,
        headingColor: String,
        bodyFont: String,
        bodySize: String,
        bodyColor: String,
        imageColumns: Number,
    },
    order: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
