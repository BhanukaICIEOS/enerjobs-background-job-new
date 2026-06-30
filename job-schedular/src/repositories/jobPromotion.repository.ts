import mongoose from 'mongoose';
import { JobPromotion, IJobPromotion } from '../models/jobPromotion.model';
import { JobPromotionStatus } from '../enums/job-promotion-status.enum';

function startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

class JobPromotionRepository {
    findActiveExpiringIn3Days(): Promise<IJobPromotion[]> {
        const today = startOfToday();
        const in3Days = new Date(today); in3Days.setDate(in3Days.getDate() + 3);
        const in4Days = new Date(today); in4Days.setDate(in4Days.getDate() + 4);

        // Dedup: skip if a reminder was already sent for this promotion
        return JobPromotion.find({
            status: JobPromotionStatus.ACTIVE,
            expirationDate: { $gte: in3Days, $lt: in4Days },
            $or: [
                { reminderSentAt: { $exists: false } },
                { reminderSentAt: null },
            ],
        }).lean() as unknown as Promise<IJobPromotion[]>;
    }

    findExpiredActivePromotions(): Promise<IJobPromotion[]> {
        return JobPromotion.find({
            status: JobPromotionStatus.ACTIVE,
            expirationDate: { $lte: new Date() },
        }).lean() as unknown as Promise<IJobPromotion[]>;
    }

    async markReminderSent(id: mongoose.Types.ObjectId): Promise<void> {
        await JobPromotion.updateOne({ _id: id }, { $set: { reminderSentAt: new Date() } });
    }

    async bulkMarkExpired(ids: mongoose.Types.ObjectId[]): Promise<number> {
        const result = await JobPromotion.updateMany(
            { _id: { $in: ids } },
            { $set: { status: JobPromotionStatus.EXPIRED } }
        );
        return result.modifiedCount;
    }
}

export const jobPromotionRepository = new JobPromotionRepository();
