import { Controller } from "@/web-controllers/ports";
import { makeAccountRepository, makeFinancialDataProvider, makeInstitutionRepository, makeUserRepository } from "@/main/factories";
import { CreateAutomaticBankAccount } from "@/usecases/create-automatic-bank-account";
import { CreateAutomaticCreditCardAccount } from "@/usecases/create-automatic-credit-card-account";
import { ConnectAutomaticAccounts } from "@/usecases/connect-automatic-accounts";
import { ConnectAutomaticAccountsController } from "@/web-controllers";

export const makeConnectAutomaticAccountsController = (): Controller => {
    const accountRepository = makeAccountRepository()
    const userRepository = makeUserRepository()
    const institutionRepository = makeInstitutionRepository()

    const financialDataProvider = makeFinancialDataProvider()
    const createAutomaticBankAccount = new CreateAutomaticBankAccount(accountRepository, userRepository, institutionRepository)
    const createAutomaticCreditCardAccount = new CreateAutomaticCreditCardAccount(accountRepository, userRepository, institutionRepository)

    const usecase = new ConnectAutomaticAccounts(financialDataProvider, createAutomaticBankAccount, createAutomaticCreditCardAccount, institutionRepository)
    const controller = new ConnectAutomaticAccountsController(usecase)

    return controller
}