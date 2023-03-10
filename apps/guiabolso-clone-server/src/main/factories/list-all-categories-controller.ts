import { ListAllCategories } from "@/usecases/list-all-categories"
import { ListAllCategoriesController } from "@/web-controllers"
import { Controller } from "@/web-controllers/ports"
import { makeCategoryRepository } from "@/main/factories"

export const makeListAllCategoriesController = (): Controller => {
    const categoryRepository = makeCategoryRepository()
    const usecase = new ListAllCategories(categoryRepository)
    const controller = new ListAllCategoriesController(usecase)
    return controller
}