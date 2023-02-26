import { Either, left, right } from "@/shared"
import { InvalidPasswordError } from "@/entities/errors"

export class Password {
    public readonly value: string

    private constructor(value: string) {
        this.value = value
    }

    public static create(password: string): Either<InvalidPasswordError, Password> {
        if(!password) {
            return left(new InvalidPasswordError("Password can't be empty"))
        }

        return right(new Password(password))
    }
}