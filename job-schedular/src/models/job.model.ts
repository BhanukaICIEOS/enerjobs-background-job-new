import mongoose, { Schema } from 'mongoose';

export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'CLOSED' | 'ARCHIVED';

export interface IJob {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    status: ListingStatus;
    expirationDate?: Date;
    companyId: mongoose.Types.ObjectId;
    isPromoted?: boolean;
    isRefreshed?: boolean;
    refreshedAt?: Date | null;
    refreshNotificationSentAt?: Date | null;
    reminderSentAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
    {
        title:                      { type: String, required: true },
        description:                { type: String, required: true },
        status:                     { type: String, enum: ['DRAFT', 'ACTIVE', 'EXPIRED', 'CLOSED', 'ARCHIVED'] },
        expirationDate:             { type: Date, required: false },
        companyId:                  { type: Schema.Types.ObjectId, ref: 'Company', required: true },
        isPromoted:                 { type: Boolean, default: false },
        isRefreshed:                { type: Boolean, default: false },
        refreshedAt:                { type: Date, default: null },
        refreshNotificationSentAt:  { type: Date, default: null },
        reminderSentAt:             { type: Date, default: null },
    },
    { timestamps: true }
);

export const Job = mongoose.model<IJob>('Job', jobSchema, 'job_listings');
