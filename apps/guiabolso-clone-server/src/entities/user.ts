import { Either, left, right } from "@/shared"
import { InvalidEmailError, InvalidNameError } from "@/entities/errors"

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

    public static create(userData: UserData): Either<InvalidNameError | InvalidEmailError, User> {
        if(!userData.name) {
            return left(new InvalidNameError(userData.name))
        }
        if(!userData.email) {
            return left(new InvalidEmailError(userData.email))
        }

        return right(new User(userData.name, userData.email))
    }


}