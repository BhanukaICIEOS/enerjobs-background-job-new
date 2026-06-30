import mongoose from 'mongoose';
import { jobPromotionRepository } from '../repositories/jobPromotion.repository';
import { queueService } from './queue.service';

class PromotionExpiryService {
    async processExpiringPromotionReminders(): Promise<number> {
        const promotions = await jobPromotionRepository.findActiveExpiringIn3Days();
        if (promotions.length === 0) return 0;

        for (const promo of promotions) {
            await queueService.sendPromotionMessage({
                type: 'promotion_expiry_reminder',
                promotionId: (promo._id as mongoose.Types.ObjectId).toString(),
                companyId:   (promo.companyId as mongoose.Types.ObjectId).toString(),
                jobTitle:    promo.jobTitle,
                expiresAt:   promo.expirationDate.toISOString(),
            });
            await jobPromotionRepository.markReminderSent(promo._id as mongoose.Types.ObjectId);
        }

        return promotions.length;
    }

    async processExpiredPromotions(): Promise<number> {
        const promotions = await jobPromotionRepository.findExpiredActivePromotions();
        if (promotions.length === 0) return 0;

        const ids = promotions.map(p => p._id as mongoose.Types.ObjectId);
        const updatedCount = await jobPromotionRepository.bulkMarkExpired(ids);

        for (const promo of promotions) {
            await queueService.sendPromotionMessage({
                type: 'promotion_expired',
                promotionId: (promo._id as mongoose.Types.ObjectId).toString(),
                companyId:   (promo.companyId as mongoose.Types.ObjectId).toString(),
                jobTitle:    promo.jobTitle,
            });
        }

        return updatedCount;
    }
}

export const promotionExpiryService = new PromotionExpiryService();
