import { left, right } from "@/shared";
import { InvalidAmountError } from "./errors";

export class Amount {
    public readonly value: number

    private constructor(value: number) {
        this.value = value
    }

    public static create(value: number) {
        if(!Number.isInteger(value)) {
            return left(new InvalidAmountError)
        }

        return right(new Amount(value))
    }
}