import mongoose, { Schema, Types } from 'mongoose';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import { PaymentMethodType } from '../enums/payment-method-type.enum';

export interface ICompanySubscription {
    _id: Types.ObjectId;
    companyId: Types.ObjectId;
    planId: Types.ObjectId;
    status: SubscriptionStatus;
    paymentMethod?: PaymentMethodType;
    startDate: Date;
    nextRenewalDate?: Date;
    cancelledAt?: Date;
    reminderSentAt?: Date;
    stripeCustomerId?: string;
    stripeLastPaymentIntentId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const companySubscriptionSchema = new Schema<ICompanySubscription>(
    {
        companyId:                 { type: Schema.Types.ObjectId, ref: 'CompanyProfile', required: true, unique: true, index: true },
        planId:                    { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true, index: true },
        status:                    { type: String, enum: Object.values(SubscriptionStatus), default: SubscriptionStatus.FREE, index: true },
        paymentMethod:             { type: String, enum: Object.values(PaymentMethodType) },
        startDate:                 { type: Date, required: true, default: Date.now },
        nextRenewalDate:           { type: Date, index: true },
        cancelledAt:               { type: Date },
        reminderSentAt:            { type: Date, default: null },
        stripeCustomerId:          { type: String },
        stripeLastPaymentIntentId: { type: String },
    },
    { collection: 'company_subscriptions', timestamps: true }
);

export const CompanySubscription = mongoose.model<ICompanySubscription>(
    'CompanySubscription',
    companySubscriptionSchema
);
