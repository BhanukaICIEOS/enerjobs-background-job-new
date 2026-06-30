import mongoose from 'mongoose';
import { Job, IJob } from '../models/job.model';

function startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

class JobRepository {
    findActiveExpired(): Promise<IJob[]> {
        return Job.find({
            status: 'ACTIVE',
            expirationDate: { $lte: new Date() },
        }).lean() as unknown as Promise<IJob[]>;
    }

    findActiveExpiringIn7Days(): Promise<IJob[]> {
        const today = startOfToday();
        const in7Days = new Date(today); in7Days.setDate(in7Days.getDate() + 7);
        const in8Days = new Date(today); in8Days.setDate(in8Days.getDate() + 8);

        return Job.find({
            status: 'ACTIVE',
            expirationDate: { $gte: in7Days, $lt: in8Days },
            $or: [
                { reminderSentAt: { $exists: false } },
                { reminderSentAt: null },
            ],
        }).lean() as unknown as Promise<IJob[]>;
    }

    /**
     * Finds ACTIVE jobs for PREMIUM companies where the 7-day refresh cooldown
     * has cleared and no refresh-available notification has been sent for the
     * current refresh cycle.
     * Uses $lookup against company_subscriptions to enforce the PREMIUM filter.
     */
    findJobsWithCooldownCleared(): Promise<IJob[]> {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return Job.aggregate<IJob>([
            {
                $match: {
                    status: 'ACTIVE',
                    isRefreshed: true,
                    refreshedAt: { $lte: sevenDaysAgo },
                    // $or: [
                    //     { refreshNotificationSentAt: { $exists: false } },
                    //     { refreshNotificationSentAt: null },
                    //     { $expr: { $lt: ['$refreshNotificationSentAt', '$refreshedAt'] } },
                    // ],
                },
            },
            {
                $lookup: {
                    from: 'company_subscriptions',
                    localField: 'companyId',
                    foreignField: 'companyId',
                    as: 'subscription',
                },
            },
            {
                $match: { 'subscription.status': 'PREMIUM' },
            },
            {
                $project: { subscription: 0 },
            },
        ]);
    }

    async markReminderSent(id: mongoose.Types.ObjectId): Promise<void> {
        await Job.updateOne({ _id: id }, { $set: { reminderSentAt: new Date() } });
    }

    async markRefreshNotificationSent(id: mongoose.Types.ObjectId): Promise<void> {
        await Job.updateOne({ _id: id }, { $set: { refreshNotificationSentAt: new Date(), isRefreshed: false } });
    }

    async bulkMarkExpired(ids: mongoose.Types.ObjectId[]): Promise<number> {
        const result = await Job.updateMany(
            { _id: { $in: ids } },
            { $set: { status: 'EXPIRED' } }
        );
        return result.modifiedCount;
    }
}

export const jobRepository = new JobRepository();
