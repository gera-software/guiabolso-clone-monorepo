import { left } from "@/shared"
import { InvalidPasswordError } from "@/entities/errors"

export class Password {
    // public readonly value: string

    private constructor(value: string) {

    }

    public static create(password: string) {
        return left(new InvalidPasswordError("Password can't be empty"))
    }
}