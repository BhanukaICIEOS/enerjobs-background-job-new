import mongoose, { Schema } from 'mongoose';

export type RegionLevel = 'country' | 'voivodeship' | 'city';

export interface IRegion {
    _id: mongoose.Types.ObjectId;
    name: { en: string; pl: string };
    slug: string;
    level: RegionLevel;
    parentId: mongoose.Types.ObjectId | null;
    jobCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const regionSchema = new Schema<IRegion>(
    {
        name: {
            en: { type: String, required: true },
            pl: { type: String, required: true },
        },
        slug: { type: String, required: true, trim: true },
        level: { type: String, enum: ['country', 'voivodeship', 'city'], required: true },
        parentId: { type: Schema.Types.ObjectId, ref: 'Region', default: null },
        jobCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: false },
    },
    { timestamps: true }
);

regionSchema.index({ level: 1 });
regionSchema.index({ isActive: 1, level: 1 });

export const Region = mongoose.model<IRegion>('Region', regionSchema, 'regions');
