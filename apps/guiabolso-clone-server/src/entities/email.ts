import { Either, left, right } from "@/shared"
import { InvalidEmailError } from "@/entities/errors"

export class Email {
    public readonly value: string
    
    private constructor(email: string) {
        this.value = email
    }

    public static create(email: string): Either<InvalidEmailError, Email> {
        if(!email) {
            return left(new InvalidEmailError())
        }

        const emailRegex =
        /^[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/
    
        if(!emailRegex.test(email)) {
            return left(new InvalidEmailError())
        }

        return right(new Email(email))
    } 
}