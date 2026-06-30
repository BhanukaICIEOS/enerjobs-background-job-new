import { Types } from 'mongoose';
import { CompanySubscription, ICompanySubscription } from '../models/companySubscription.model';
import { SubscriptionPlan, ISubscriptionPlan } from '../models/subscriptionPlan.model';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

function startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

class SubscriptionRepository {
    findPremiumDueForRenewalReminder(): Promise<ICompanySubscription[]> {
        const today = startOfToday();
        const in7Days = new Date(today); in7Days.setDate(in7Days.getDate() + 7);
        const in8Days = new Date(today); in8Days.setDate(in8Days.getDate() + 8);

        // Dedup: skip if a reminder was already sent during the current 7-day window
        // (reminderSentAt >= nextRenewalDate - 8 days means it was sent for this cycle)
        return CompanySubscription.find({
            status: SubscriptionStatus.PREMIUM,
            nextRenewalDate: { $gte: in7Days, $lt: in8Days },
            $or: [
                { reminderSentAt: { $exists: false } },
                { reminderSentAt: null },
                {
                    $expr: {
                        $lt: [
                            '$reminderSentAt',
                            { $subtract: ['$nextRenewalDate', 8 * 24 * 60 * 60 * 1000] },
                        ],
                    },
                },
            ],
        }).lean();
    }

    async markReminderSent(id: Types.ObjectId): Promise<void> {
        await CompanySubscription.updateOne({ _id: id }, { $set: { reminderSentAt: new Date() } });
    }

    findExpiredPremiumSubscriptions(): Promise<ICompanySubscription[]> {
        return CompanySubscription.find({
            status: { $in: [SubscriptionStatus.PREMIUM, SubscriptionStatus.CANCELLED] },
            nextRenewalDate: { $lte: startOfToday() },
        }).lean();
    }

    async bulkDowngradeToFree(
        subscriptionIds: Types.ObjectId[],
        freePlanId: Types.ObjectId
    ): Promise<number> {
        const result = await CompanySubscription.updateMany(
            { _id: { $in: subscriptionIds } },
            {
                $set: {
                    planId: freePlanId,
                    status: SubscriptionStatus.FREE,
                    nextRenewalDate: null,
                    cancelledAt: new Date(),
                },
            }
        );
        return result.modifiedCount;
    }

    findFreePlan(): Promise<ISubscriptionPlan | null> {
        return SubscriptionPlan.findOne({ name: 'FREE', isActive: true }).lean();
    }
}

export const subscriptionRepository = new SubscriptionRepository();
