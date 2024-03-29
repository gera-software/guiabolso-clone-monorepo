import { Either, left, right } from "@/shared"
import { InvalidGroupNameError, InvalidIconColorError, InvalidIconNameError, InvalidNameError } from "@/entities/errors"
import { CategoryData } from "@/usecases/ports"

export class Category {
    public readonly name: string
    public readonly group: string
    public readonly iconName: string
    public readonly primaryColor: string
    public readonly ignored: boolean

    private constructor(categoryData : CategoryData) {
        this.name = categoryData.name
        this.group = categoryData.group
        this.iconName = categoryData.iconName
        this.primaryColor = categoryData.primaryColor
        this.ignored = categoryData.ignored
    }

    public static create(categoryData : CategoryData): Either<InvalidNameError | InvalidGroupNameError | InvalidIconNameError | InvalidIconColorError, Category> {
        if(!categoryData.name) {
            return left(new InvalidNameError())
        }

        if(!categoryData.group) {
            return left(new InvalidGroupNameError())
        }

        if(!categoryData.iconName) {
            return left(new InvalidIconNameError())
        }

        if(!categoryData.primaryColor) {
            return left(new InvalidIconColorError())
        }

        return right(new Category(categoryData))

    }
}