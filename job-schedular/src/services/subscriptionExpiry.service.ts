import { Types } from 'mongoose';
import { subscriptionRepository } from '../repositories/subscription.repository';
import { queueService } from './queue.service';

class SubscriptionExpiryService {
    /**
     * Finds PREMIUM subscriptions whose nextRenewalDate has passed,
     * bulk-downgrades company_subscription + company_profiles to FREE,
     * then pushes an expiry_notification message per company to the subscription queue.
     * Returns the number of subscriptions downgraded.
     */
    async processExpiredSubscriptions(): Promise<number> {
        const freePlan = await subscriptionRepository.findFreePlan();
        if (!freePlan) throw new Error('FREE plan not found in SubscriptionPlan collection');

        const expired = await subscriptionRepository.findExpiredPremiumSubscriptions();
        if (expired.length === 0) return 0;

        const subscriptionIds = expired.map(s => s._id as Types.ObjectId);
        const companyIds      = expired.map(s => s.companyId as Types.ObjectId);

        await subscriptionRepository.bulkDowngradeToFree(subscriptionIds, companyIds, freePlan._id as Types.ObjectId);

        for (const sub of expired) {
            await queueService.sendSubscriptionMessage({
                type: 'expiry_notification',
                companyId: (sub.companyId as Types.ObjectId).toString(),
            });
        }

        return expired.length;
    }
}

export const subscriptionExpiryService = new SubscriptionExpiryService();
