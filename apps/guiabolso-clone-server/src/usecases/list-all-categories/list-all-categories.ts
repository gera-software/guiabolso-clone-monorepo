import { right } from "@/shared";
import { CategoryRepository, UseCase } from "@/usecases/ports";

export class ListAllCategories implements UseCase {
    private readonly categoryRepository: CategoryRepository

    constructor(categoryRepository: CategoryRepository) {
        this.categoryRepository = categoryRepository
    }

    async perform(request: any): Promise<any> {
        const list = await this.categoryRepository.fetchAll()
        return right(list)
    }

}