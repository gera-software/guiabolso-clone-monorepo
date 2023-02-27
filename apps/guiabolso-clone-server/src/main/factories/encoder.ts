import { BcryptEncoder } from "@/external/encoder"
import { Encoder } from "@/usecases/ports"

export const makeEncoder = (): Encoder => {
    return new BcryptEncoder(parseInt(process.env.BCRYPT_ROUNDS ?? '10'))
  }