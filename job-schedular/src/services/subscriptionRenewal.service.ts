import { Types } from 'mongoose';
import { subscriptionRepository } from '../repositories/subscription.repository';
import { queueService } from './queue.service';

class SubscriptionRenewalService {
    /**
     * Finds PREMIUM subscriptions with nextRenewalDate exactly 7 days from today
     * and pushes a renewal_reminder message to the subscription queue for each.
     * Returns the number of messages pushed.
     */
    async processRenewalReminders(): Promise<number> {
        const subscriptions = await subscriptionRepository.findPremiumDueForRenewalReminder();
        if (subscriptions.length === 0) return 0;

        for (const sub of subscriptions) {
            await queueService.sendSubscriptionMessage({
                type: 'renewal_reminder',
                companyId: (sub.companyId as Types.ObjectId).toString(),
                renewalDate: sub.nextRenewalDate!.toISOString(),
            });
            await subscriptionRepository.markReminderSent(sub._id as Types.ObjectId);
        }

        return subscriptions.length;
    }
}

export const subscriptionRenewalService = new SubscriptionRenewalService();
