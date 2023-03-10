import { MongodbCategoryRepository } from "@/external/repositories/mongodb";
import { CategoryRepository } from "@/usecases/ports";

export const makeCategoryRepository = (): CategoryRepository => {
    return new MongodbCategoryRepository()
}