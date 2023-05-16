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

    // TODO finds e exists should ignore deleted itens
    async exists(id: string): Promise<boolean> {
        const found = await this.findById(id)
        if(found) {
            return true
        }

        return false
    }

    /**
     * Desconsidera o dia, busca pelo mes e ano da fatura
     */
    async findByDueDate(date: Date, accountId: string): Promise<CreditCardInvoiceData> {
        const invoice = this.data.find(invoice => invoice.accountId === accountId && invoice.dueDate.getUTCMonth() == date.getUTCMonth() && invoice.dueDate.getUTCFullYear() == date.getUTCFullYear())
        return invoice || null
    }

    async updateAmount(id: string, amount: number): Promise<void> {
        const invoice = await this.findById(id)
        if(invoice) {
            invoice.amount = amount
        }
    }

    async getLastClosedInvoice(accountId: string): Promise<CreditCardInvoiceData> {
        const c = new Date()
        const currentDate = new Date(Date.UTC(c.getFullYear(), c.getMonth(), c.getDate()))

        const invoices = this.data
            .filter(invoice => invoice.accountId === accountId && invoice.closeDate <= currentDate)
            .sort((a,b) => {
                if(a.closeDate < b.closeDate) return -1
                if(a.closeDate > b.closeDate) return 1
                return 0
            })
            .reverse()

        return invoices[0] || null
    }

    async batchUpdateAmount(invoices: { invoiceId: string; amount: number }[]): Promise<void> {
        for(const invoice of invoices) {
            await this.updateAmount(invoice.invoiceId, invoice.amount)
        }
    }
}