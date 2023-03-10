import { CategoryData, CategoryRepository } from "@/usecases/ports";

export class InMemoryCategoryRepository implements CategoryRepository {
    private readonly _data: CategoryData[]

    constructor (data: CategoryData[]) {
        this._data = data
    }

    public get data() {
        return this._data
    }

    async findById(id: string): Promise<CategoryData> {
        const category = this.data.find(category => category.id == id)
        return category || null
    }

    async fetchAll(): Promise<CategoryData[]> {
        const categories = this.data.filter(category => true)
        return categories
    }

    async exists(id: string): Promise<boolean> {
        const found = await this.findById(id)
        if(found) {
            return true
        }

        return false
    }
}