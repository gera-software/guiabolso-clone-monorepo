import { MongodbCategory, MongodbCategoryRepository } from "@/external/repositories/mongodb"
import { MongoHelper } from "@/external/repositories/mongodb/helper"
import { CategoryData } from "@/usecases/ports"

describe('Mongodb Category repository', () => {
    const categoriesArray: MongodbCategory[] = []

    categoriesArray.push({
        name: "category 0",
        group: "group 0",
        iconName: "icon 0",
        primaryColor: "color 0",
        ignored: true,
        _id: null,
    })
    categoriesArray.push({
        name: "category 1",
        group: "group 1",
        iconName: "icon 1",
        primaryColor: "color 1",
        ignored: false,
        _id: null,
    })

    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL)
        const categoryCollection = MongoHelper.getCollection('categories')
        await categoryCollection.insertMany(categoriesArray)
    })
    
    afterAll(async () => {
        await MongoHelper.clearCollection('categories')
        await MongoHelper.disconnect()
    })
    
    beforeEach(async () => {
        // await MongoHelper.clearCollection('categories')
    })

    test('when a category is not find by id, should return null', async () => {
        const notFoundId = '62f95f4a93d61d8fff971668'
        const sut = new MongodbCategoryRepository()
        const result = await sut.findById(notFoundId)
        expect(result).toBeNull()
    })

    test('when a category is find by id, should return the category', async () => {
        const sut = new MongodbCategoryRepository()
        const result = await sut.findById(categoriesArray[0]._id.toString()) as CategoryData
        expect(result).not.toBeNull()
        expect(result.id).toBe(categoriesArray[0]._id.toString())
        expect(result.name).toBe(categoriesArray[0].name)
        expect(result.group).toBe(categoriesArray[0].group)
        expect(result.iconName).toBe(categoriesArray[0].iconName)
        expect(result.primaryColor).toBe(categoriesArray[0].primaryColor)
        expect(result.ignored).toBe(categoriesArray[0].ignored)
    })

    
    test('when a category exists, should return true', async () => {
        const sut = new MongodbCategoryRepository()
        const result = await sut.exists(categoriesArray[0]._id.toString())
        expect(result).toBeTruthy()
    })

    test('should list all categories', async () => {
        const sut = new MongodbCategoryRepository()
        const result = await sut.fetchAll()
        expect(result.length).toBe(2)
    })

})