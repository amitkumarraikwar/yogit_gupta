import mongoose from 'mongoose';

const GlobalStylesSchema = new mongoose.Schema({
    pageBackground: String,
    headingFont: String,
    headingSize: String,
    headingColor: String,
    bodyFont: String,
    bodySize: String,
    bodyColor: String,
    imageColumns: Number,
}, {
    timestamps: true,
});

export default mongoose.models.GlobalStyles || mongoose.model('GlobalStyles', GlobalStylesSchema);
