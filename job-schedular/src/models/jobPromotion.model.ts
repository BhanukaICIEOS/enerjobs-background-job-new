import mongoose, { Schema, Types } from 'mongoose';
import { JobPromotionStatus } from '../enums/job-promotion-status.enum';

export interface IJobPromotion {
    _id: Types.ObjectId;
    paymentId: Types.ObjectId;
    companyId: Types.ObjectId;
    jobId: Types.ObjectId;
    jobTitle: string;
    durationDays: number;
    status: JobPromotionStatus;
    promotionStartDate: Date;
    expirationDate: Date;
    reminderSentAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

const jobPromotionSchema = new Schema<IJobPromotion>(
    {
        paymentId:          { type: Schema.Types.ObjectId, ref: 'Payment', required: true, index: true },
        companyId:          { type: Schema.Types.ObjectId, ref: 'CompanyProfile', required: true, index: true },
        jobId:              { type: Schema.Types.ObjectId, ref: 'JobListing', required: true, index: true },
        jobTitle:           { type: String, required: true },
        durationDays:       { type: Number, required: true },
        status:             { type: String, enum: Object.values(JobPromotionStatus), default: JobPromotionStatus.ACTIVE, index: true },
        promotionStartDate: { type: Date, required: true, default: Date.now },
        expirationDate:     { type: Date, required: true, index: true },
        reminderSentAt:     { type: Date, default: null },
    },
    { collection: 'jobpromotions', timestamps: true }
);

export const JobPromotion = mongoose.model<IJobPromotion>('JobPromotion', jobPromotionSchema);
