import request from 'supertest'
import app from '@/main/config/app'
import { MongodbCategory } from "@/external/repositories/mongodb"
import { MongoHelper } from "@/external/repositories/mongodb/helper"

describe('list all categories route', () => {
    const categoriesArray: MongodbCategory[] = []

    categoriesArray.push({
        name: "category 0",
        group: "group 0",
        iconName: "icon 0",
        primaryColor: "color 0",
        _id: null,
    })
    categoriesArray.push({
        name: "category 1",
        group: "group 1",
        iconName: "icon 1",
        primaryColor: "color 1",
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

    test('should list all categories', async () => {
        await request(app)
            .get('/api/category')
            .expect(200)
            .then((res) => {
                expect(res.body.length).toBe(2)
            })
    })
})