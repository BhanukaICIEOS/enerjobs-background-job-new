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
    async upsert(data: UpsertPSEOPageData): Promise<IPSEOPage> {
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
            { upsert: true, new: true }
        ).lean();

        return doc as unknown as IPSEOPage;
    }
}

export const pseoPageRepository = new PSEOPageRepository();
