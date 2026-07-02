import { Category, ICategory } from '../models/category.model';

class TaxonomyRepository {
    findAllForSeo(): Promise<ICategory[]> {
        return Category.find({})
            .select('_id slugs name')
            .lean() as unknown as Promise<ICategory[]>;
    }
}

export const taxonomyRepository = new TaxonomyRepository();
