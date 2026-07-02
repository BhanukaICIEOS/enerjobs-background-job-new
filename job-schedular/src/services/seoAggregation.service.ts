import { Types } from 'mongoose';
import { regionRepository } from '../repositories/region.repository';
import { taxonomyRepository } from '../repositories/taxonomy.repository';
import { pseoPageRepository } from '../repositories/pseoPage.repository';
import { seoStatsAggregatorService } from './seoStatsAggregator.service';

const TWENTY_SEVEN_HOURS_MS = 27 * 60 * 60 * 1000;

class SeoAggregationService {
    private isRunning = false;

    async computeAll(): Promise<void> {
        if (this.isRunning) {
            console.log('SEO aggregation already running — skipping this tick');
            return;
        }

        this.isRunning = true;
        try {
            await this.runAllPhases();
        } finally {
            this.isRunning = false;
        }
    }

    private async runAllPhases(): Promise<void> {
        const [voivodeships, categories] = await Promise.all([
            regionRepository.findVoivodeshipsForSeo(),
            taxonomyRepository.findAllForSeo(),
        ]);

        console.log(`SEO aggregation started: ${voivodeships.length} voivodeships x ${categories.length} categories`);

        const now = new Date();
        const expiresAt = new Date(now.getTime() + TWENTY_SEVEN_HOURS_MS);
        let regionOk = 0;
        let regionFail = 0;

        // Phase 1 — region-only pages
        for (const voivodeship of voivodeships) {
            try {
                const voivodeshipId = voivodeship._id as Types.ObjectId;
                const stats = await seoStatsAggregatorService.computeRegionStats(voivodeshipId);
                await pseoPageRepository.upsert({
                    type: 'region',
                    regionId: voivodeshipId,
                    categoryId: null,
                    slug: voivodeship.slug,
                    combinedSlug: null,
                    ...stats,
                    computedAt: now,
                    expiresAt,
                });
                regionOk++;
            } catch (err) {
                regionFail++;
                console.error(`Failed to compute region stats for ${voivodeship.slug}`, err);
            }
        }

        console.log(`Phase 1 done — region pages: ${regionOk} ok, ${regionFail} failed`);

        // Phase 2 — category x region combined pages
        let combinedOk = 0;
        let combinedFail = 0;

        for (const voivodeship of voivodeships) {
            for (const category of categories) {
                const categorySlug = category.slugs?.pl ?? '';
                if (!categorySlug) continue;

                try {
                    const voivodeshipId = voivodeship._id as Types.ObjectId;
                    const categoryId = category._id as Types.ObjectId;

                    const stats = await seoStatsAggregatorService.computeCombinedStats(voivodeshipId, categoryId);

                    await pseoPageRepository.upsert({
                        type: 'category-region',
                        regionId: voivodeshipId,
                        categoryId,
                        slug: voivodeship.slug,
                        combinedSlug: `${categorySlug}__${voivodeship.slug}`,
                        ...stats,
                        computedAt: now,
                        expiresAt,
                    });
                    combinedOk++;
                } catch (err) {
                    combinedFail++;
                    console.error(`Failed to compute combined stats for ${categorySlug}__${voivodeship.slug}`, err);
                }
            }
        }

        console.log(`Phase 2 done — combined pages: ${combinedOk} ok, ${combinedFail} failed`);

        // Phase 3 — city x category combined pages
        const cities = await regionRepository.findCitiesForSeo();

        console.log(`Phase 3: computing city x category pages for ${cities.length} cities`);

        let cityOk = 0;
        let cityFail = 0;

        for (const city of cities) {
            for (const category of categories) {
                const categorySlug = category.slugs?.pl ?? '';
                if (!categorySlug) continue;

                try {
                    const cityId = city._id as Types.ObjectId;
                    const categoryId = category._id as Types.ObjectId;

                    const stats = await seoStatsAggregatorService.computeCityCombinedStats(cityId, categoryId);

                    await pseoPageRepository.upsert({
                        type: 'category-region',
                        regionId: cityId,
                        categoryId,
                        slug: city.slug,
                        combinedSlug: `${categorySlug}__${city.slug}`,
                        ...stats,
                        computedAt: now,
                        expiresAt,
                    });
                    cityOk++;
                } catch (err) {
                    cityFail++;
                    console.error(`Failed to compute city stats for ${categorySlug}__${city.slug}`, err);
                }
            }
        }

        console.log(`Phase 3 done — city combined pages: ${cityOk} ok, ${cityFail} failed`);
        console.log('SEO aggregation complete.');
    }
}

export const seoAggregationService = new SeoAggregationService();
