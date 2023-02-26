import { Either, left, right } from "@/shared"
import { InvalidEmailError, InvalidNameError, InvalidPasswordError } from "@/entities/errors"
import { Email, Password } from "@/entities"
import { UserData } from "@/usecases/ports"

export class User {
    public readonly name: string
    public readonly email: Email
    public readonly password: Password

    private constructor(name: string, email: Email, password: Password) {
        this.name = name
        this.email = email
        this.password = password
    }

    public static create(userData: UserData): Either<InvalidNameError | InvalidEmailError | InvalidPasswordError, User> {
        if(!userData.name) {
            return left(new InvalidNameError(userData.name))
        }

        const emailOrError = Email.create(userData.email)
        if(emailOrError.isLeft()) {
            return left(emailOrError.value)
        }

        const passwordOrError = Password.create(userData.password)
        if(passwordOrError.isLeft()) {
            return left(passwordOrError.value)
        }

        const emailObject: Email = emailOrError.value as Email
        const passwordObject: Password = passwordOrError.value

        return right(new User(userData.name, emailObject, passwordObject))
    }


}