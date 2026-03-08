import mongoose from 'mongoose';

const FrontPageSchema = new mongoose.Schema({
    candidateName: { type: String, default: '' },
    workContent: { type: String, default: '' },
    bgImages: { type: [mongoose.Schema.Types.Mixed], default: [] },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    twitter: { type: String, default: '' },
}, {
    timestamps: true,
});

export default mongoose.models.FrontPage || mongoose.model('FrontPage', FrontPageSchema);
