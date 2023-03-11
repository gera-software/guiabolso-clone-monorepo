import { ListAllCategories } from "@/usecases/list-all-categories"
import { CategoryData } from "@/usecases/ports"
import { InMemoryCategoryRepository } from "@test/doubles/repositories"

describe('List categories use case', () => {
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

    test('should list all categories available', async () => {
        const categoryRepo = new InMemoryCategoryRepository(categoriesArray)
        const sut = new ListAllCategories(categoryRepo)
        const response = (await sut.perform({})).value as CategoryData[]
        expect(response.length).toBe(2)
    })
})