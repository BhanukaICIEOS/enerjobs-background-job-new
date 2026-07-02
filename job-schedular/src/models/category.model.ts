import mongoose, { Schema } from 'mongoose';

export interface ICategory {
    _id: mongoose.Types.ObjectId;
    name: { en: string; pl: string };
    slugs: { en?: string; pl: string };
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
    {
        name: {
            en: { type: String, required: true },
            pl: { type: String, required: true },
        },
        slugs: {
            en: { type: String, required: false },
            pl: { type: String, required: true },
        },
    },
    { timestamps: true }
);

export const Category = mongoose.model<ICategory>('Category', categorySchema, 'categories');
