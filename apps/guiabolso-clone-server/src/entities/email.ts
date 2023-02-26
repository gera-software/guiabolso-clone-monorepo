import { left } from "@/shared"
import { InvalidEmailError } from "./errors"

export class Email {
    private readonly value: string
    
    private constructor(email: string) {
        this.value = email
    }

    public static create(email: string) {
        return left(new InvalidEmailError('Email é obrigatório'))
    } 
}