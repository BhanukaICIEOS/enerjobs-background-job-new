import { Region, IRegion } from '../models/region.model';

class RegionRepository {
    findVoivodeshipsForSeo(): Promise<IRegion[]> {
        return Region.find({
            level: 'voivodeship',
            $or: [{ isActive: true }, { jobCount: { $gt: 0 } }],
        })
            .select('_id slug name')
            .lean() as unknown as Promise<IRegion[]>;
    }

    findCitiesForSeo(): Promise<IRegion[]> {
        return Region.find({
            level: 'city',
            $or: [{ isActive: true }, { jobCount: { $gt: 0 } }],
        })
            .select('_id slug name')
            .lean() as unknown as Promise<IRegion[]>;
    }
}

export const regionRepository = new RegionRepository();
