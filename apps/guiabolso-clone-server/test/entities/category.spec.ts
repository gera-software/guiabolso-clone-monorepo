import { Category } from "@/entities"
import { InvalidGroupNameError, InvalidIconColorError, InvalidIconNameError, InvalidNameError } from "@/entities/errors"

describe("Category entity", () => {
    test("Should not create a category without name", () => {
        const name = ''
        const group = 'GROUPNAME'
        const iconName = 'icon name'
        const primaryColor = 'color'

        const error = Category.create({
            name,
            group,
            iconName,
            primaryColor,
        }).value as Error

        expect(error).toBeInstanceOf(InvalidNameError)
    })

    test("Should not create a category without group name", () => {
        const name = 'valid name'
        const group = ''
        const iconName = 'icon name'
        const primaryColor = 'color'

        const error = Category.create({
            name,
            group,
            iconName,
            primaryColor,
        }).value as Error

        expect(error).toBeInstanceOf(InvalidGroupNameError)
    })

    test("Should not create a category without icon name", () => {
        const name = 'valid name'
        const group = 'GROUPNAME'
        const iconName = ''
        const primaryColor = 'color'

        const error = Category.create({
            name,
            group,
            iconName,
            primaryColor,
        }).value as Error

        expect(error).toBeInstanceOf(InvalidIconNameError)
    })

    test("Should not create a category without a primary color", () => {
        const name = 'valid name'
        const group = 'GROUPNAME'
        const iconName = 'icon name'
        const primaryColor = ''
        
        const error = Category.create({
            name,
            group,
            iconName,
            primaryColor,
        }).value as Error

        expect(error).toBeInstanceOf(InvalidIconColorError)
    })

    test("Should create a category with valid data", () => {
        const name = 'valid name'
        const group = 'GROUPNAME'
        const iconName = 'icon name'
        const primaryColor = 'color'
        const ignored = true
        
        const category = Category.create({
            name,
            group,
            iconName,
            primaryColor,
            ignored,
        }).value as Category

        expect(category.name).toBe(name)
        expect(category.group).toBe(group)
        expect(category.iconName).toBe(iconName)
        expect(category.primaryColor).toBe(primaryColor)
        expect(category.ignored).toBe(ignored)
    })
})