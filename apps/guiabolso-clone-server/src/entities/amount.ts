import { Either, left, right } from "@/shared";
import { InvalidAmountError } from "@/entities/errors";

export class Amount {
    private _value: number

    private constructor(value: number) {
        this._value = value
    }

    public get value() {
        return this._value
    } 

    public static create(value: number): Either<InvalidAmountError, Amount> {
        if(!Number.isInteger(value)) {
            return left(new InvalidAmountError)
        }

        return right(new Amount(value))
    }

    public add(value: number) {
        this._value += value
    }
}