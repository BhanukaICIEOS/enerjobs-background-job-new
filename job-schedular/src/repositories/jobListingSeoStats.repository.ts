import { PipelineStage } from 'mongoose';
import { Job } from '../models/job.model';

export interface SeoStats {
    jobCount: number;
    promotedCount: number;
    topJobTitles: string[];
    topCompanies: string[];
    topSkills: string[];
    avgSalaryMin: number | null;
    avgSalaryMax: number | null;
    recentCount: number;
    topCities: string[];
}

const EMPTY_STATS: SeoStats = {
    jobCount: 0, promotedCount: 0, topJobTitles: [], topCompanies: [],
    topSkills: [], avgSalaryMin: null, avgSalaryMax: null, recentCount: 0, topCities: [],
};

class JobListingSeoStatsRepository {
    async computeSeoStats(
        match: Record<string, unknown>,
        includeTopCities: boolean
    ): Promise<SeoStats> {
        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
        const recentThreshold = new Date(Date.now() - THIRTY_DAYS_MS);

        const pipeline: PipelineStage[] = [
            { $match: match },
            {
                $facet: {
                    jobCount: [{ $count: 'n' }],
                    promotedCount: [{ $match: { isPromoted: true } }, { $count: 'n' }],
                    topJobTitles: [
                        { $match: { title: { $exists: true, $ne: null } } },
                        { $group: { _id: '$title', n: { $sum: 1 } } },
                        { $sort: { n: -1 } },
                        { $limit: 5 },
                        { $project: { _id: 0, title: '$_id' } },
                    ],
                    topCompanies: [
                        { $match: { companyName: { $exists: true, $ne: null } } },
                        { $group: { _id: '$companyName', n: { $sum: 1 } } },
                        { $sort: { n: -1 } },
                        { $limit: 5 },
                        { $project: { _id: 0, name: '$_id' } },
                    ],
                    topSkills: [
                        { $match: { requirements: { $exists: true, $ne: [] } } },
                        { $unwind: '$requirements' },
                        { $group: { _id: '$requirements', n: { $sum: 1 } } },
                        { $sort: { n: -1 } },
                        { $limit: 5 },
                        { $project: { _id: 0, skill: '$_id' } },
                    ],
                    avgSalary: [
                        { $match: { minSalary: { $exists: true, $gt: 0 } } },
                        { $group: { _id: null, avgMin: { $avg: '$minSalary' }, avgMax: { $avg: '$maxSalary' } } },
                    ],
                    recentCount: [
                        { $match: { createdAt: { $gte: recentThreshold } } },
                        { $count: 'n' },
                    ],
                    ...(includeTopCities && {
                        topCities: [
                            { $match: { cityId: { $exists: true, $ne: null } } },
                            { $group: { _id: '$cityId', n: { $sum: 1 } } },
                            { $sort: { n: -1 } },
                            { $limit: 5 },
                            { $lookup: { from: 'regions', localField: '_id', foreignField: '_id', as: 'city' } },
                            { $unwind: '$city' },
                            { $project: { _id: 0, name: '$city.name.pl' } },
                        ],
                    }),
                },
            },
        ];

        const [result] = await Job.aggregate(pipeline).exec();
        if (!result) return EMPTY_STATS;

        const avgSalaryData = result.avgSalary?.[0];
        return {
            jobCount: result.jobCount?.[0]?.n ?? 0,
            promotedCount: result.promotedCount?.[0]?.n ?? 0,
            topJobTitles: (result.topJobTitles ?? []).map((r: { title: string }) => r.title),
            topCompanies: (result.topCompanies ?? []).map((r: { name: string }) => r.name),
            topSkills: (result.topSkills ?? []).map((r: { skill: string }) => r.skill),
            avgSalaryMin: avgSalaryData?.avgMin != null ? Math.round(avgSalaryData.avgMin) : null,
            avgSalaryMax: avgSalaryData?.avgMax != null ? Math.round(avgSalaryData.avgMax) : null,
            recentCount: result.recentCount?.[0]?.n ?? 0,
            topCities: (result.topCities ?? []).map((r: { name: string }) => r.name),
        };
    }
}

export const jobListingSeoStatsRepository = new JobListingSeoStatsRepository();
