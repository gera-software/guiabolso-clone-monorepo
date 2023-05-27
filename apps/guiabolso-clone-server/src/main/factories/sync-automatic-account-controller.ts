import { Controller } from "@/web-controllers/ports";
import { makeFinancialDataProvider } from "@/main/factories/financial-data-provider";
import { makeAccountRepository } from "@/main/factories/account-repository";
import { makeInstitutionRepository } from "@/main/factories/institution-repository";
import { makeUserRepository } from "@/main/factories/user-repository";
import { makeTransactionRepository } from "@/main/factories/transaction-repository";
import { makeCreditCardInvoiceRepository } from "@/main/factories/credit-card-invoice-repository";
import { SyncAutomaticBankAccount } from "@/usecases/sync-automatic-bank-account";
import { SyncAutomaticCreditCardAccount } from "@/usecases/sync-automatic-credit-card-account";
import { SyncAutomaticAccount } from "@/usecases/sync-automatic-account";
import { SyncAutomaticAccountController } from "@/web-controllers";

export const makeSyncAutomaticAccountController = (): Controller => {
    const dataProvider = makeFinancialDataProvider()
    const accountRepository = makeAccountRepository()
    const institutionRepository = makeInstitutionRepository()
    const userRepository = makeUserRepository()
    const transactionRepository = makeTransactionRepository()
    const invoiceRepository = makeCreditCardInvoiceRepository()
    const syncAutomaticBankAccount = new SyncAutomaticBankAccount(accountRepository, transactionRepository, dataProvider)
    const syncAutomaticCreditCardAccount = new SyncAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository, transactionRepository, invoiceRepository, dataProvider)
    const usecase = new SyncAutomaticAccount(accountRepository, syncAutomaticBankAccount, syncAutomaticCreditCardAccount)

    const controller = new SyncAutomaticAccountController(usecase)

    return controller
}