import { Either, left } from "@/shared"
import { InvalidNameError } from "@/entities/errors"

export interface UserData {
    name: string,
    email: string,
}

export class User {
    public readonly name: string
    public readonly email: string

    private constructor(name: string, email: string) {
        this.name = name
        this.email = email
    }

    static create(userData: UserData): Either<InvalidNameError, UserData> {
        return left(new InvalidNameError(userData.name))
    }
}