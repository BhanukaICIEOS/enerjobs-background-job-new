import { Types } from 'mongoose';
import { PSEOPage, IPSEOPage, PSEOPageType } from '../models/pseoPage.model';

export interface UpsertPSEOPageData {
    type: PSEOPageType;
    regionId: Types.ObjectId;
    categoryId: Types.ObjectId | null;
    slug: string;
    combinedSlug: string | null;
    jobCount: number;
    promotedCount: number;
    topJobTitles: string[];
    topCompanies: string[];
    topSkills: string[];
    avgSalaryMin: number | null;
    avgSalaryMax: number | null;
    recentCount: number;
    topCities: string[];
    computedAt: Date;
    expiresAt: Date;
}

class PSEOPageRepository {
    /**
     * Never creates a new doc for a zero-job combination (avoids thousands of empty
     * city x category pages), but always updates an existing doc down to zero so a
     * page whose last job disappeared doesn't keep reporting a stale positive count.
     */
    async upsert(data: UpsertPSEOPageData): Promise<IPSEOPage | null> {
        const filter = {
            regionId: data.regionId,
            categoryId: data.categoryId ?? null,
        };

        const { type, regionId, categoryId, slug, combinedSlug, ...stats } = data;

        const doc = await PSEOPage.findOneAndUpdate(
            filter,
            {
                $set: stats,
                $setOnInsert: { type, regionId, categoryId, slug, combinedSlug },
            },
            { upsert: data.jobCount > 0, returnDocument: 'after' }
        ).lean();

        return doc as unknown as IPSEOPage | null;
    }
}

export const pseoPageRepository = new PSEOPageRepository();
