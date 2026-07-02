import mongoose, { Schema } from 'mongoose';

export type PSEOPageType = 'region' | 'category-region';

export interface IPSEOPage {
    _id: mongoose.Types.ObjectId;
    type: PSEOPageType;
    regionId: mongoose.Types.ObjectId;
    categoryId: mongoose.Types.ObjectId | null;
    slug: string;
    combinedSlug: string | null;
    jobCount: number;
    promotedCount: number;
    topJobTitles: string[];
    topCompanies: string[];
    topSkills: string[];
    avgSalaryMin: number | null;
    avgSalaryMax: number | null;
    recentCount: number;
    topCities: string[];
    computedAt: Date;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const pseoPageSchema = new Schema<IPSEOPage>(
    {
        type: { type: String, enum: ['region', 'category-region'], required: true },
        regionId: { type: Schema.Types.ObjectId, ref: 'Region', required: true },
        categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
        slug: { type: String, required: true, trim: true },
        combinedSlug: { type: String, default: null, trim: true },
        jobCount: { type: Number, default: 0 },
        promotedCount: { type: Number, default: 0 },
        topJobTitles: { type: [String], default: [] },
        topCompanies: { type: [String], default: [] },
        topSkills: { type: [String], default: [] },
        avgSalaryMin: { type: Number, default: null },
        avgSalaryMax: { type: Number, default: null },
        recentCount: { type: Number, default: 0 },
        topCities: { type: [String], default: [] },
        computedAt: { type: Date, required: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

pseoPageSchema.index({ slug: 1, type: 1 });
pseoPageSchema.index({ combinedSlug: 1 });
pseoPageSchema.index({ regionId: 1, categoryId: 1 });
pseoPageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PSEOPage = mongoose.model<IPSEOPage>('PSEOPage', pseoPageSchema, 'pSEOPages');
