import { Types } from 'mongoose';
import { CompanyProfile } from '../models/companyProfile.model';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

class CompanyProfileRepository {
    async bulkUpdateSubscriptionStatus(
        companyIds: Types.ObjectId[],
        status: SubscriptionStatus
    ): Promise<void> {
        await CompanyProfile.updateMany(
            { _id: { $in: companyIds } },
            { $set: { subscriptionStatus: status } }
        );
    }
}

export const companyProfileRepository = new CompanyProfileRepository();
