import mongoose, { Schema, Types } from 'mongoose';
import { CompanySize } from '../enums/company-size.enum';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

export interface ICompanyProfile {
    _id: Types.ObjectId;
    companyName: string;
    description: string;
    industryCategoryId: number;
    companySize: CompanySize;
    headquartersLocation: string;
    logo?: string;
    banner?: string;
    websiteUrl?: string;
    profileViews?: number;
    websiteClicks?: number;
    subscriptionStatus: SubscriptionStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

const companyProfileSchema = new Schema<ICompanyProfile>(
    {
        companyName:           { type: String, required: true, trim: true, index: true },
        description:           { type: String, required: true, trim: true },
        industryCategoryId:    { type: Number, required: true },
        companySize:           { type: String, required: true, enum: Object.values(CompanySize) },
        headquartersLocation:  { type: String, required: true, trim: true },
        logo:                  { type: String, trim: true },
        banner:                { type: String, trim: true },
        websiteUrl:            { type: String, trim: true },
        profileViews:          { type: Number, default: 0 },
        websiteClicks:         { type: Number, default: 0 },
        subscriptionStatus:    { type: String, enum: Object.values(SubscriptionStatus), default: SubscriptionStatus.FREE },
    },
    { collection: 'company_profiles', timestamps: true }
);

export const CompanyProfile = mongoose.model<ICompanyProfile>('CompanyProfile', companyProfileSchema);
