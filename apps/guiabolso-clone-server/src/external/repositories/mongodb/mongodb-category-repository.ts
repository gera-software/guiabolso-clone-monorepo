import { CategoryData, CategoryRepository } from "@/usecases/ports";
import { ObjectId } from "mongodb";
import { MongoHelper } from "@/external/repositories/mongodb/helper";

export type MongodbCategory = {
    _id: ObjectId,
    name: string, 
    group: string, 
    iconName: string, 
    primaryColor: string,
    ignored: boolean,
}

export class MongodbCategoryRepository implements CategoryRepository {

    async findById(id: string): Promise<CategoryData> {
        const categoryCollection = MongoHelper.getCollection('categories')
        const category = await categoryCollection.findOne<MongodbCategory>({ _id: new ObjectId(id) })
        if(category) {
            return this.withApplicationId(category)
        }
        return null
    }
    
    async fetchAll(): Promise<CategoryData[]> {
        const categoryCollection = MongoHelper.getCollection('categories')
        const caegories = await categoryCollection.find<MongodbCategory>({})
            .toArray()

        return caegories.map(category => this.withApplicationId(category))
    }

    async exists(id: string): Promise<boolean> {
        const result = await this.findById(id)
        if(result != null) {
            return true
        }
        return false
    }

    private withApplicationId(dbCategory: MongodbCategory): CategoryData {
        return {
            id: dbCategory._id.toString(),
            name: dbCategory.name, 
            group: dbCategory.group, 
            iconName: dbCategory.iconName, 
            primaryColor: dbCategory.primaryColor,
            ignored: dbCategory.ignored,
        }
    }
    
}