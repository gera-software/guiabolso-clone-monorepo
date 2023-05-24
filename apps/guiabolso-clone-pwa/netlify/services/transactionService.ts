import { AccountType, CreditCardInvoice, CurrencyCodes, Transaction } from "../types";
import * as AccountRepository from "../repositories/accountRepository";
import * as TransactionRepository from "../repositories/transactionRepository";
import * as CreditCardInvoiceRepository from "../repositories/creditCardInvoiceRepository";

/**
 * Adiciona uma transação no cartão de crédito
 * 
 * Verificar o fechamento e vencimento do cartão para definir a fatura de qual mês em que será lançada a transação
 * 
 * @param transaction 
 */
export async function addCreditCardTransaction(transaction: Transaction): Promise<Transaction | null | undefined> {
    if(transaction.accountType == AccountType.CREDIT_CARD && transaction.category?.name !== 'Pagamento de cartão') {
        // indentificar invoice dueDate and ClosingDate 
        const { dueDate, closingDate } = await calculateInvoiceDates(transaction)

        // move a transação para a data de vencimento da fatura correspondente
        transaction.date = dueDate
    
        // link transaction to invoice
        const invoice = await findOrCreateInvoiceToTransaction(transaction, dueDate, closingDate)
        transaction.creditCardInvoiceId = invoice?._id
    }

    let doc: Transaction | null = await TransactionRepository.create(transaction);
    
    await AccountRepository.addToAvailableCreditLimit(transaction.accountId.toString(), transaction.amount.valueOf());
    
    // UPDATE BALANCE
    // TODO bug: devido a diferença de fuso horário entre back e front, ele pode não encontrar a fatura
    const lastClosedInvoice = await CreditCardInvoiceRepository.getLastClosedInvoice(transaction.accountId.toString())
    console.log('LAST CLOSED INVOICE', lastClosedInvoice)
    if(lastClosedInvoice) {
        const transactions = await TransactionRepository.fetchByCreditCardInvoice(lastClosedInvoice._id)
        const balance = transactions.reduce((accumulator: number, transaction: Transaction) => {
            console.log(transaction.amount.valueOf())
           return accumulator += transaction.amount.valueOf()
        }, 0)
        console.log('NEW BALANCE', balance)
        await AccountRepository.setBalance(transaction.accountId.toString(), balance)
    }

    return doc
}

/**
 * Adiciona uma transação na conta corrente
 * @param transaction 
 * @returns 
 */
export async function addCheckingAccountTransaction(transaction: Transaction): Promise<Transaction | null | undefined> {
    let doc: Transaction | null = await TransactionRepository.create(transaction);
    await AccountRepository.addToBalance(transaction.accountId.toString(), transaction.amount.valueOf());
    
    console.log(doc)
    return doc
}

/**
 * Adiciona uma transação à vista (dinheiro vivo)
 * @param transaction 
 * @returns 
 */
export async function addCashTransaction(transaction: Transaction): Promise<Transaction | null | undefined> {
    let doc: Transaction | null = await TransactionRepository.create(transaction);
    await AccountRepository.addToBalance(transaction.accountId.toString(), transaction.amount.valueOf());
    
    console.log(doc)
    return doc
}

/**
 * Calculate invoice dueDate and closingDate, based only on transaction informations
 * @param transaction 
 */
async function calculateInvoiceDates(transaction: Transaction) {
        const invoiceDate = new Date(transaction.invoiceDate ?? '')
        let invoiceMonth = invoiceDate.getUTCMonth() // between 0 and 11
        let invoiceYear = invoiceDate.getUTCFullYear()

        const account = await AccountRepository.getById(transaction.accountId)
        const closeDay = +(account?.creditData?.closeDay ?? 0)
        const dueDay = +(account?.creditData?.dueDay ?? 0)
        
        const closingDate = new Date(Date.UTC(+invoiceYear, +invoiceMonth, closeDay, 0, 0, 0))

        const dueDate = new Date(Date.UTC(+invoiceYear, +invoiceMonth, dueDay, 0, 0, 0))

        // move a transação para a data de vencimento da fatura correspondente
        if(invoiceDate >= closingDate) {
            dueDate.setUTCMonth(dueDate.getUTCMonth() + 1)
            closingDate.setUTCMonth(closingDate.getUTCMonth() + 1)
            // console.log('dentro da fatura do mes que vem', dueDate.toISOString())
        } else {
            // console.log('dentro da fatura do mes atual', dueDate.toISOString())
        }
        
        return {
            dueDate,
            closingDate,
        }
}

async function findOrCreateInvoiceToTransaction(transaction: Transaction, dueDate: Date, closingDate: Date) {
    let invoice = await CreditCardInvoiceRepository.getByDueDate(transaction.accountId.toString(), dueDate)

    if(!invoice) {
        const creditCardInvoice : CreditCardInvoice = {
            dueDate: dueDate,
            closeDate: closingDate,
            amount: 0,
            currencyCode: CurrencyCodes.BRL,
            userId: transaction.userId.toString(),
            accountId: transaction.accountId.toString(),
            _isDeleted: false,
        }
        // cria a fatura
        invoice = await CreditCardInvoiceRepository.create(creditCardInvoice)
    }

    return invoice
}

export async function updateCreditCardTransaction(transaction: Transaction): Promise<Transaction | null | undefined> {
    if(transaction.accountType == AccountType.CREDIT_CARD && transaction.category?.name !== 'Pagamento de cartão') {
        // indentificar invoice dueDate and ClosingDate 
        const { dueDate, closingDate } = await calculateInvoiceDates(transaction)

        // move a transação para a data de vencimento da fatura correspondente
        transaction.date = dueDate
    
        // link transaction to invoice
        const invoice = await findOrCreateInvoiceToTransaction(transaction, dueDate, closingDate)
        transaction.creditCardInvoiceId = invoice?._id
    }

    let docBeforeUpdate: Transaction | null;

    // TODO o que acontece se você mudar uma compra de um mes para outro, vai bagunçar as faturas?
    docBeforeUpdate = await TransactionRepository.findOneAndUpdate(transaction);
    if(docBeforeUpdate) {
        const balance = -docBeforeUpdate.amount + transaction.amount.valueOf()
        // TODO talvez não seja necessario atualizar balanço quando é cartão de crédito
        const account = await AccountRepository.addToAvailableCreditLimit('' + transaction?.accountId.toString(), balance);
    }

    // UPDATE BALANCE
    const lastClosedInvoice = await CreditCardInvoiceRepository.getLastClosedInvoice(transaction.accountId.toString())
    if(lastClosedInvoice) {
        const transactions = await TransactionRepository.fetchByCreditCardInvoice(lastClosedInvoice._id)
        const balance = transactions.reduce((accumulator: number, transaction: Transaction) => {
            return accumulator += transaction.amount.valueOf()
        }, 0)
        await AccountRepository.setBalance(transaction.accountId.toString(), balance)
    }

    console.log(transaction)
    return transaction
}

export async function updateCheckingAccountTransaction(transaction: Transaction): Promise<Transaction | null | undefined> {
    let docBeforeUpdate: Transaction | null;

    docBeforeUpdate = await TransactionRepository.findOneAndUpdate(transaction);
    if(docBeforeUpdate) {
        const balance = -docBeforeUpdate.amount + transaction.amount.valueOf()
        const account = await AccountRepository.addToBalance('' + transaction?.accountId.toString(), balance);
    }

    console.log(transaction)
    return transaction
}

export async function updateCashTransaction(transaction: Transaction): Promise<Transaction | null | undefined> {
    let docBeforeUpdate: Transaction | null;

    docBeforeUpdate = await TransactionRepository.findOneAndUpdate(transaction);
    if(docBeforeUpdate) {
        const balance = -docBeforeUpdate.amount + transaction.amount.valueOf()
        const account = await AccountRepository.addToBalance('' + transaction?.accountId.toString(), balance);
    }

    console.log(transaction)
    return transaction
}

export async function removeCreditCardTransaction(transaction: Transaction): Promise<Transaction | null | undefined> {
    const result: Transaction | null = await TransactionRepository.remove(transaction._id)
    // TODO talvez não seja preciso atualizar o balanço quando for cartão de crédito
    const account = await AccountRepository.subtractFromAvailableCreditLimit('' + transaction?.accountId.toString(), transaction?.amount.valueOf());
    // console.log(account)

    // UPDATE BALANCE
    const lastClosedInvoice = await CreditCardInvoiceRepository.getLastClosedInvoice(transaction.accountId.toString())
    if(lastClosedInvoice) {
        const transactions = await TransactionRepository.fetchByCreditCardInvoice(lastClosedInvoice._id)
        const balance = transactions.reduce((accumulator: number, transaction: Transaction) => {
            return accumulator += transaction.amount.valueOf()
        }, 0)
        await AccountRepository.setBalance(transaction.accountId.toString(), balance)
    }

    return result
}

export async function removeCheckingAccountTransaction(transaction: Transaction): Promise<Transaction | null | undefined> {
    const result: Transaction | null = await TransactionRepository.remove(transaction._id)
    const account = await AccountRepository.subtractFromBalance('' + transaction?.accountId.toString(), transaction?.amount.valueOf());
    // console.log(account)

    return result
}

export async function removeCashTransaction(transaction: Transaction): Promise<Transaction | null | undefined> {
    const result: Transaction | null = await TransactionRepository.remove(transaction._id)
    const account = await AccountRepository.subtractFromBalance('' + transaction?.accountId.toString(), transaction?.amount.valueOf());
    // console.log(account)

    return result
}