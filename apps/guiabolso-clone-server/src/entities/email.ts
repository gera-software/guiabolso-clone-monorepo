import { left, right } from "@/shared"
import { InvalidEmailError } from "@/entities/errors"

export class Email {
    public readonly value: string
    
    private constructor(email: string) {
        this.value = email
    }

    public static create(email: string) {
        if(!email) {
            return left(new InvalidEmailError('Email required'))
        }

        return right(new Email(email))
    } 
}