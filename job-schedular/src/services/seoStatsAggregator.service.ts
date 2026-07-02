import { Types } from 'mongoose';
import { jobListingSeoStatsRepository, SeoStats } from '../repositories/jobListingSeoStats.repository';

class SeoStatsAggregatorService {
    computeRegionStats(voivodeshipId: Types.ObjectId): Promise<SeoStats> {
        return jobListingSeoStatsRepository.computeSeoStats(
            { voivodeshipId: new Types.ObjectId(voivodeshipId), status: 'ACTIVE' },
            true
        );
    }

    computeCombinedStats(voivodeshipId: Types.ObjectId, categoryId: Types.ObjectId): Promise<SeoStats> {
        return jobListingSeoStatsRepository.computeSeoStats(
            {
                voivodeshipId: new Types.ObjectId(voivodeshipId),
                categoryId: new Types.ObjectId(categoryId),
                status: 'ACTIVE',
            },
            false
        );
    }

    computeCityCombinedStats(cityId: Types.ObjectId, categoryId: Types.ObjectId): Promise<SeoStats> {
        return jobListingSeoStatsRepository.computeSeoStats(
            {
                cityId: new Types.ObjectId(cityId),
                categoryId: new Types.ObjectId(categoryId),
                status: 'ACTIVE',
            },
            false
        );
    }
}

export const seoStatsAggregatorService = new SeoStatsAggregatorService();
