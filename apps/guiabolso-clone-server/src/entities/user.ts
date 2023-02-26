import { Either, left, right } from "@/shared"
import { InvalidEmailError, InvalidNameError } from "@/entities/errors"
import { Email } from "@/entities"

export interface UserData {
    name: string,
    email: string,
}

export class User {
    public readonly name: string
    public readonly email: Email

    private constructor(name: string, email: Email) {
        this.name = name
        this.email = email
    }

    public static create(userData: UserData): Either<InvalidNameError | InvalidEmailError, User> {
        if(!userData.name) {
            return left(new InvalidNameError(userData.name))
        }

        const emailOrError = Email.create(userData.email)
        if(emailOrError.isLeft()) {
            return left(emailOrError.value)
        }

        const emailObject: Email = emailOrError.value as Email

        return right(new User(userData.name, emailObject))
    }


}