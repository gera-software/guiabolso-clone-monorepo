import { CreditCardInvoiceData, CreditCardInvoiceRepository } from "@/usecases/ports"

export class InMemoryCreditCardInvoiceRepository implements CreditCardInvoiceRepository {
    private readonly _data: CreditCardInvoiceData[]
    private idCounter: number = 0

    constructor (data: CreditCardInvoiceData[]) {
        this._data = data
    }

    public get data() {
        return this._data
    }

    async add(invoice: CreditCardInvoiceData): Promise<CreditCardInvoiceData> {
        invoice.id = this.idCounter.toString()
        this.idCounter++
        this.data.push(invoice)
        return invoice
    }

    async findById(id: string): Promise<CreditCardInvoiceData> {
        const invoice = this.data.find(invoice => invoice.id == id)
        return invoice || null
    }

    async exists(id: string): Promise<boolean> {
        const found = await this.findById(id)
        if(found) {
            return true
        }

        return false
    }

}