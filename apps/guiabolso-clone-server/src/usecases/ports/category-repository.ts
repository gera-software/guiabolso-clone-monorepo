import { CategoryData } from "@/usecases/ports"

export interface CategoryRepository {
    findById(id: string): Promise<CategoryData>
    fetchAll(): Promise<CategoryData[]>
    exists(id: string): Promise<boolean>
}