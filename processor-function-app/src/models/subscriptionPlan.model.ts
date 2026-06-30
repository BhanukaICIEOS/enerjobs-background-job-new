import mongoose, { Schema, Types } from 'mongoose';

export interface ISubscriptionPlan {
    _id: Types.ObjectId;
    name: string;
    price: number;
    billingCycleDays: number;
    maxActiveListings: number;
    listingDurationDays: number;
    canRefreshJobs: boolean;
    canPromoteJobs: boolean;
    canPublishArticles: boolean;
    canUploadLogo: boolean;
    canUploadCover: boolean;
    hasExtendedDescription: boolean;
    hasWebsiteUrl: boolean;
    hasExtendedDashboard: boolean;
    hasAdvancedAnalytics: boolean;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
    {
        name:                   { type: String, required: true, unique: true, uppercase: true, trim: true },
        price:                  { type: Number, required: true },
        billingCycleDays:       { type: Number, required: true },
        maxActiveListings:      { type: Number, required: true },
        listingDurationDays:    { type: Number, required: true },
        canRefreshJobs:         { type: Boolean, required: true, default: false },
        canPromoteJobs:         { type: Boolean, required: true, default: false },
        canPublishArticles:     { type: Boolean, required: true, default: false },
        canUploadLogo:          { type: Boolean, required: true, default: false },
        canUploadCover:         { type: Boolean, required: true, default: false },
        hasExtendedDescription: { type: Boolean, required: true, default: false },
        hasWebsiteUrl:          { type: Boolean, required: true, default: false },
        hasExtendedDashboard:   { type: Boolean, required: true, default: false },
        hasAdvancedAnalytics:   { type: Boolean, required: true, default: false },
        isActive:               { type: Boolean, required: true, default: true },
    },
    { timestamps: true }
);

export const SubscriptionPlan = mongoose.model<ISubscriptionPlan>(
    'SubscriptionPlan',
    subscriptionPlanSchema
);
