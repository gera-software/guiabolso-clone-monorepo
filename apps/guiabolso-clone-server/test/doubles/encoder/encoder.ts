import { Encoder } from "@/usecases/ports";

export class FakeEncoder implements Encoder {
    
    public async encode(plain: string): Promise<string> {
        return plain + 'ENCRYPTED'
    }

    public async compare(plain: string, hashed: string): Promise<boolean> {
        if (plain + 'ENCRYPTED' === hashed) {
            return true
        }
        return false
    }

}