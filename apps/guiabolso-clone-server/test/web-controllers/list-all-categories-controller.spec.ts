import { ListAllCategories } from "@/usecases/list-all-categories"
import { CategoryData, UseCase } from "@/usecases/ports"
import { ListAllCategoriesController } from "@/web-controllers"
import { HttpRequest, HttpResponse } from "@/web-controllers/ports"
import { InMemoryCategoryRepository } from "@test/doubles/repositories"
import { ErrorThrowingUseCaseStub } from "@test/doubles/usecases"

const categoriesArray: CategoryData[] = []

categoriesArray.push({
    name: "category 0",
    group: "group 0",
    iconName: "icon 0",
    primaryColor: "color 0",
    ignored: true,
    id: "0",
})
categoriesArray.push({
    name: "category 1",
    group: "group 1",
    iconName: "icon 1",
    primaryColor: "color 1",
    ignored: false,
    id: "1",
})


describe('List all categories web controller', () => {
    test('should return status code 200', async () => {
        const categoryRepo = new InMemoryCategoryRepository(categoriesArray)
        const usecase = new ListAllCategories(categoryRepo)
        const sut = new ListAllCategoriesController(usecase)

        const validRequest: HttpRequest = {}

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(200)
        expect(response.body.length).toEqual(2)
    })

    test('should return status code 500 when server raises', async () => {
        const errorThrowingUseCaseStub: UseCase = new ErrorThrowingUseCaseStub()
        const sut = new ListAllCategoriesController(errorThrowingUseCaseStub)

        const validRequest: HttpRequest = {}

        const response: HttpResponse = await sut.handle(validRequest)
        expect(response.statusCode).toEqual(500)
    })
})