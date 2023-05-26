import { Connector, Item, ItemStatus, Account as PluggyAccount, PluggyClient } from 'pluggy-sdk'
import { PluggyDataProvider } from "@/external/financial-data-provider"
import { DataProviderError } from '@/usecases/errors'
import { AccountData, TransactionData } from '@/usecases/ports'
import { AccountType } from '@/entities'
jest.mock('pluggy-sdk')
const mockedPluggyClient = jest.mocked(PluggyClient)

describe('Pluggy Data Provider', () => {
    beforeEach(() => {
        mockedPluggyClient.mockClear()
    })

    describe('get available automatic institutions', () => {
        test('should return a list of available institutions', async () => {
            const arrayConnectors: Connector[] = [
                {
                    id: 201,
                    name: 'Itaú',
                    imageUrl: 'url itau',
                    primaryColor: 'fff',
                    type: 'PERSONAL_BANK',
                    institutionUrl: '',
                    country: '',
                    credentials: null,
                    hasMFA: false,
                    products: [],
                    createdAt: new Date(),
                },
                {
                    id: 202,
                    name: 'Nubank',
                    imageUrl: 'url nubank',
                    primaryColor: '000',
                    type: 'BUSINESS_BANK',
                    institutionUrl: '',
                    country: '',
                    credentials: null,
                    hasMFA: false,
                    products: [],
                    createdAt: new Date(),
                }
            ]
            mockedPluggyClient.prototype.fetchConnectors.mockResolvedValueOnce({
                total: 2,
                totalPages: 1,
                page: 1,
                results: arrayConnectors
             })

            const clientId = 'valid-client-id'
            const clientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(clientId, clientSecret)

            const result = await sut.getAvailableAutomaticInstitutions()
            expect(result.length).toBe(2)
            expect(result[0]).toEqual({
                id: null,
                providerConnectorId: '201',
                name: 'Itaú',
                imageUrl: 'url itau',
                primaryColor: '#fff',
                type: 'PERSONAL_BANK',
            })
            expect(result[1]).toEqual({
                id: null,
                providerConnectorId: '202',
                name: 'Nubank',
                imageUrl: 'url nubank',
                primaryColor: '#000',
                type: 'BUSINESS_BANK',
            })

            expect(mockedPluggyClient.prototype.fetchConnectors).toHaveBeenCalledTimes(1)
            expect(mockedPluggyClient.prototype.fetchConnectors).toHaveBeenCalledWith({ types: [ 'PERSONAL_BANK' ], sandbox: true })
        })
    })

    describe('get connect token', () => {
        test('should returns a generic connect token', async () => {
            const validAccessToken = 'valid-access-token'
            mockedPluggyClient.prototype.createConnectToken.mockResolvedValueOnce({ accessToken: validAccessToken })

            const clientId = 'valid-client-id'
            const clientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(clientId, clientSecret)

            const result = (await sut.getConnectToken({})).value
            expect(result).toBe(validAccessToken)
        })

        test('should returns a specific connect token', async () => {
            const validAccessToken = 'valid-access-token'
            mockedPluggyClient.prototype.createConnectToken.mockImplementationOnce(async (itemId) => ({ accessToken: validAccessToken + itemId }))

            const clientId = 'valid-client-id'
            const clientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(clientId, clientSecret)

            const itemId = 'valid-item-id'
            const result = (await sut.getConnectToken({itemId})).value
            expect(result).toBe(validAccessToken + itemId)
            expect(mockedPluggyClient.prototype.createConnectToken).toHaveBeenCalledWith(itemId, {})

        })

        test('should receive an optional clientUserId', async () => {
            const validAccessToken = 'valid-access-token'
            mockedPluggyClient.prototype.createConnectToken.mockImplementationOnce(async (itemId, options) => ({ accessToken: validAccessToken + itemId + options.clientUserId}))

            const clientId = 'valid-client-id'
            const clientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(clientId, clientSecret)

            const itemId = 'valid-item-id'
            const clientUserId = 'any-user-id'
            const result = (await sut.getConnectToken({itemId, clientUserId})).value
            expect(result).toBe(validAccessToken + itemId + clientUserId)
            expect(mockedPluggyClient.prototype.createConnectToken).toHaveBeenCalledWith(itemId, {clientUserId})

        })

        test('should returns DataProviderError if invalid authorization token', async () => {
            mockedPluggyClient.prototype.createConnectToken.mockRejectedValueOnce({ code: 403, message: "Missing or invalid authorization token" })

            const invalidClientId = 'invalid-client-id'
            const invalidClientSecret = 'invalid-client-secret'
            const sut = new PluggyDataProvider(invalidClientId, invalidClientSecret)

            const itemId = 'valid-item-id'
            const result = (await sut.getConnectToken({itemId})).value as Error
            expect(result).toBeInstanceOf(DataProviderError)
        })

        test('should returns DataProviderError if has a internal server error', async () => {
            mockedPluggyClient.prototype.createConnectToken.mockRejectedValueOnce({ code: 500, message: "Internal Server Error" })

            const validClientId = 'valid-client-id'
            const validClientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(validClientId, validClientSecret)

            const itemId = 'valid-item-id'
            const result = (await sut.getConnectToken({itemId})).value as Error
            expect(result).toBeInstanceOf(DataProviderError)
        })
    })

    describe('getAccountsByItemId', () => {
        test('should return a error if item not found', async () => {
            mockedPluggyClient.prototype.fetchItem.mockRejectedValueOnce({ code: 404, message: "item not found" })
            const validClientId = 'valid-client-id'
            const validClientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(validClientId, validClientSecret)

            const itemId = 'invalid-item-id'
            const result = (await sut.getAccountsByItemId(itemId)).value as Error
            expect(result).toBeInstanceOf(DataProviderError)
        })

        test('should return a error if provider api has an internal error', async () => {
            mockedPluggyClient.prototype.fetchItem.mockRejectedValueOnce({ code: 500, message: "Internal Server Error" })
            const validClientId = 'valid-client-id'
            const validClientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(validClientId, validClientSecret)

            const itemId = 'valid-item-id'
            const result = (await sut.getAccountsByItemId(itemId)).value as Error
            expect(result).toBeInstanceOf(DataProviderError)
        })

        test('should return a list of accounts without pagination of results', async () => {
            const validItemId = "a5d1ca6c-24c0-41c7-8b44-9272cc868663"

            const item: Item = {
                "id": validItemId,
                "createdAt": new Date("2021-12-28T21:48:02.863Z"),
                "updatedAt": new Date("2021-12-28T21:48:02.952Z"),
                "connector": {
                    "id": 201,
                    "name": "Itaú",
                    "primaryColor": "EC7000",
                    "institutionUrl": "https://www.itau.com.br",
                    "country": "BR",
                    "type": "PERSONAL_BANK",
                    "credentials": [
                    {
                        "label": "Agência",
                        "name": "agency",
                        "type": "number",
                        "placeholder": "Agência",
                        "validation": "^\\d{4}$",
                        "validationMessage": "O agencia deve ter 4 dígito"
                    },
                    {
                        "label": "Conta",
                        "name": "account",
                        "type": "number",
                        "placeholder": "Conta",
                        "validation": "^\\d{4,6}$",
                        "validationMessage": "O conta deve ter 6 dígito"
                    },
                    {
                        "label": "Senha",
                        "name": "password",
                        "type": "number",
                        "placeholder": "Senha",
                        "validation": "^\\d{6}$",
                        "validationMessage": "O senha deve ter 6 dígito"
                    }
                    ],
                    "imageUrl": "https://res.cloudinary.com/dkr0vihmp/image/upload/v1588853552/connectors-logos/itau_ntodvn.png",
                    "hasMFA": false,
                    "products": [],
                    "createdAt": new Date(),

                },
                "status": "UPDATING",
                "executionStatus": "CREATED",
                "lastUpdatedAt": null,
                "webhookUrl": null,
                "error": null,
                "clientUserId": "My User App Id",
                "parameter": null,
                "userAction": null,
                "statusDetail": {
                  "accounts": {
                    "isUpdated": true,
                    "lastUpdatedAt": new Date("2022-03-08T22:43:04.796Z"),       
                  },
                  "identity": {
                    "isUpdated": false,
                    "lastUpdatedAt": null,
                  },
                  "creditCards": {
                    "isUpdated": true,
                    "lastUpdatedAt": new Date("2022-03-08T22:43:04.796Z"),
                  },
                  "investments": {
                    "isUpdated": true,
                    "lastUpdatedAt": new Date("2022-03-08T22:43:04.796Z"),
                  },
                  "transactions": {
                    "isUpdated": true,
                    "lastUpdatedAt": new Date("2022-03-08T22:43:04.796Z"),
                  },
                  "paymentData": null
                },
                "consecutiveFailedLoginAttempts": 0,
                // "nextAutoSyncAt": null
            }

            const bankAccount: PluggyAccount = {
                "id": "a658c848-e475-457b-8565-d1fffba127c4",
                "type": "BANK",
                "subtype": "CHECKING_ACCOUNT",
                "number": "0001/12345-0",
                "name": "Conta Corrente",
                "marketingName": "GOLD Conta Corrente",
                "balance": 120950,
                "itemId": validItemId,
                "taxNumber": "416.799.495-00",
                "owner": "John Doe",
                "currencyCode": "BRL",
                "bankData": {
                  "transferNumber": "0001/12345-0",
                  "closingBalance": 120950
                },
                "creditData": null,
            }

            const creditAccount: PluggyAccount = {
                "id": "a658c848-e475-457b-8565-d1fffba127c5",
                "type": "CREDIT",
                "subtype": "CREDIT_CARD",
                "number": "xxxx8670",
                "name": "Mastercard Black",
                "marketingName": "PLUGGY UNICLASS MASTERCARD BLACK",
                "balance": 120950,
                "itemId": validItemId,
                "taxNumber": "416.799.495-00",
                "owner": "John Doe",
                "currencyCode": "BRL",
                "creditData": {
                  "level": "BLACK",
                  "brand": "MASTERCARD",
                  "balanceCloseDate": new Date("2022-01-03"),
                  "balanceDueDate": new Date("2022-01-10"),
                  "availableCreditLimit": 200000,
                  "balanceForeignCurrency": 0,
                  "minimumPayment": 16190,
                  "creditLimit": 300000
                },
                "bankData": null,
            }
            
            mockedPluggyClient.prototype.fetchItem.mockResolvedValueOnce(item)

            mockedPluggyClient.prototype.fetchAccounts.mockResolvedValueOnce({
                "total": 2,
                "totalPages": 1,
                "page": 1,
                "results": [ bankAccount, creditAccount ]
            })

            const validClientId = 'valid-client-id'
            const validClientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(validClientId, validClientSecret)

            const results = (await sut.getAccountsByItemId(validItemId)).value as AccountData[]
            expect(results.length).toBe(2)
            expect(results[0]).toEqual({
                "balance": bankAccount.balance, 
                "creditCardInfo": null, 
                "id": null, 
                "imageUrl": item.connector.imageUrl, 
                "institution": {
                    "id": null, 
                    "imageUrl": item.connector.imageUrl, 
                    "name": item.connector.name, 
                    "primaryColor": item.connector.primaryColor, 
                    "providerConnectorId": ''+item.connector.id, 
                    "type": item.connector.type
                }, 
                "name": bankAccount.name, 
                "providerAccountId": bankAccount.id, 
                "syncType": "AUTOMATIC", 
                "synchronization": {
                    "createdAt": item.createdAt, 
                    "providerItemId": item.id
                }, 
                "type": "BANK", 
                "userId": null,
            })

            expect(results[1]).toEqual({
                "balance": -creditAccount.balance, 
                "creditCardInfo": {
                    "availableCreditLimit": creditAccount.creditData.availableCreditLimit, 
                    "creditLimit": 300000, 
                    "brand": creditAccount.creditData.brand, 
                    "closeDay": creditAccount.creditData.balanceCloseDate.getUTCDate(), 
                    "dueDay": creditAccount.creditData.balanceDueDate.getUTCDate()
                }, 
                "id": null, 
                "imageUrl": item.connector.imageUrl, 
                "institution": {
                    "id": null, 
                    "imageUrl": item.connector.imageUrl, 
                    "name": item.connector.name, 
                    "primaryColor": item.connector.primaryColor, 
                    "providerConnectorId": ''+item.connector.id, 
                    "type": item.connector.type
                },
                "name": creditAccount.name, 
                "providerAccountId": creditAccount.id, 
                "syncType": "AUTOMATIC", 
                "synchronization": {
                    "createdAt": item.createdAt, 
                    "providerItemId": item.id
                }, 
                "type": "CREDIT_CARD", 
                "userId": null,
            })
        })

        test('should return a list of accounts with pagination of results', async () => {
            const validItemId = "a5d1ca6c-24c0-41c7-8b44-9272cc868663"

            const item: Item = {
                "id": validItemId,
                "createdAt": new Date("2021-12-28T21:48:02.863Z"),
                "updatedAt": new Date("2021-12-28T21:48:02.952Z"),
                "connector": {
                    "id": 201,
                    "name": "Itaú",
                    "primaryColor": "EC7000",
                    "institutionUrl": "https://www.itau.com.br",
                    "country": "BR",
                    "type": "PERSONAL_BANK",
                    "credentials": [
                    {
                        "label": "Agência",
                        "name": "agency",
                        "type": "number",
                        "placeholder": "Agência",
                        "validation": "^\\d{4}$",
                        "validationMessage": "O agencia deve ter 4 dígito"
                    },
                    {
                        "label": "Conta",
                        "name": "account",
                        "type": "number",
                        "placeholder": "Conta",
                        "validation": "^\\d{4,6}$",
                        "validationMessage": "O conta deve ter 6 dígito"
                    },
                    {
                        "label": "Senha",
                        "name": "password",
                        "type": "number",
                        "placeholder": "Senha",
                        "validation": "^\\d{6}$",
                        "validationMessage": "O senha deve ter 6 dígito"
                    }
                    ],
                    "imageUrl": "https://res.cloudinary.com/dkr0vihmp/image/upload/v1588853552/connectors-logos/itau_ntodvn.png",
                    "hasMFA": false,
                    "products": [],
                    "createdAt": new Date(),

                },
                "status": "UPDATING",
                "executionStatus": "CREATED",
                "lastUpdatedAt": null,
                "webhookUrl": null,
                "error": null,
                "clientUserId": "My User App Id",
                "parameter": null,
                "userAction": null,
                "statusDetail": {
                  "accounts": {
                    "isUpdated": true,
                    "lastUpdatedAt": new Date("2022-03-08T22:43:04.796Z"),
                  },
                  "identity": {
                    "isUpdated": false,
                    "lastUpdatedAt": null,
                  },
                  "creditCards": {
                    "isUpdated": true,
                    "lastUpdatedAt": new Date("2022-03-08T22:43:04.796Z"),
                  },
                  "investments": {
                    "isUpdated": true,
                    "lastUpdatedAt": new Date("2022-03-08T22:43:04.796Z"),
                  },
                  "transactions": {
                    "isUpdated": true,
                    "lastUpdatedAt": new Date("2022-03-08T22:43:04.796Z"),
                  },
                  "paymentData": null
                },
                "consecutiveFailedLoginAttempts": 0,
                // "nextAutoSyncAt": null
            }

            const bankAccount: PluggyAccount = {
                "id": "a658c848-e475-457b-8565-d1fffba127c4",
                "type": "BANK",
                "subtype": "CHECKING_ACCOUNT",
                "number": "0001/12345-0",
                "name": "Conta Corrente",
                "marketingName": "GOLD Conta Corrente",
                "balance": 120950,
                "itemId": validItemId,
                "taxNumber": "416.799.495-00",
                "owner": "John Doe",
                "currencyCode": "BRL",
                "bankData": {
                    "transferNumber": "0001/12345-0",
                    "closingBalance": 120950
                },
                creditData: null,
            }

            const creditAccount: PluggyAccount = {
                "id": "a658c848-e475-457b-8565-d1fffba127c5",
                "type": "CREDIT",
                "subtype": "CREDIT_CARD",
                "number": "xxxx8670",
                "name": "Mastercard Black",
                "marketingName": "PLUGGY UNICLASS MASTERCARD BLACK",
                "balance": 120950,
                "itemId": validItemId,
                "taxNumber": "416.799.495-00",
                "owner": "John Doe",
                "currencyCode": "BRL",
                "creditData": {
                    "level": "BLACK",
                    "brand": "MASTERCARD",
                    "balanceCloseDate": new Date("2022-01-03"),
                    "balanceDueDate": new Date("2022-01-10"),
                    "availableCreditLimit": 200000,
                    "balanceForeignCurrency": 0,
                    "minimumPayment": 16190,
                    "creditLimit": 300000
                },
                bankData: null,
            }
            
            mockedPluggyClient.prototype.fetchItem.mockResolvedValueOnce(item)

            mockedPluggyClient.prototype.fetchAccounts.mockResolvedValueOnce({
                "total": 2,
                "totalPages": 1,
                "page": 1,
                "results": [ bankAccount, creditAccount ]
            })

            const validClientId = 'valid-client-id'
            const validClientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(validClientId, validClientSecret)

            const results = (await sut.getAccountsByItemId(validItemId)).value as AccountData[]
            expect(results.length).toBe(2)
            expect(results[0]).toEqual({
                "balance": bankAccount.balance, 
                "creditCardInfo": null, 
                "id": null, 
                "imageUrl": item.connector.imageUrl, 
                "institution": {
                    "id": null, 
                    "imageUrl": item.connector.imageUrl, 
                    "name": item.connector.name, 
                    "primaryColor": item.connector.primaryColor, 
                    "providerConnectorId": ''+item.connector.id, 
                    "type": item.connector.type
                }, 
                "name": bankAccount.name, 
                "providerAccountId": bankAccount.id, 
                "syncType": "AUTOMATIC", 
                "synchronization": {
                    "createdAt": item.createdAt, 
                    "providerItemId": item.id
                }, 
                "type": "BANK", 
                "userId": null,
            })

            expect(results[1]).toEqual({
                "balance": -creditAccount.balance, 
                "creditCardInfo": {
                    "availableCreditLimit": creditAccount.creditData.availableCreditLimit, 
                    "creditLimit": 300000, 
                    "brand": creditAccount.creditData.brand, 
                    "closeDay": creditAccount.creditData.balanceCloseDate.getUTCDate(), 
                    "dueDay": creditAccount.creditData.balanceDueDate.getUTCDate()
                }, 
                "id": null, 
                "imageUrl": item.connector.imageUrl, 
                "institution": {
                    "id": null, 
                    "imageUrl": item.connector.imageUrl, 
                    "name": item.connector.name, 
                    "primaryColor": item.connector.primaryColor, 
                    "providerConnectorId": ''+item.connector.id, 
                    "type": item.connector.type
                },
                "name": creditAccount.name, 
                "providerAccountId": creditAccount.id, 
                "syncType": "AUTOMATIC", 
                "synchronization": {
                    "createdAt": item.createdAt, 
                    "providerItemId": item.id
                }, 
                "type": "CREDIT_CARD", 
                "userId": null,
            })
        })
    })

    describe('getTransactionsByProviderAccountId', () => {
        test('should return a error if provider api has an internal error', async () => {
            mockedPluggyClient.prototype.fetchTransactions.mockRejectedValueOnce({ code: 500, message: "Internal Server Error" })

            const validClientId = 'valid-client-id'
            const validClientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(validClientId, validClientSecret)

            const accountId = 'valid-account-id'
            const accountType: AccountType = 'BANK'
            const providerAccountId = 'valid-account-id'
            const from = new Date('2023-03-01')
            const result = (await sut.getTransactionsByProviderAccountId(accountId, accountType, {providerAccountId, from })).value as Error
            expect(result).toBeInstanceOf(DataProviderError)


        })

        test('should return an empty array if account not found', async () => {
            mockedPluggyClient.prototype.fetchTransactions.mockResolvedValueOnce({
                "total": 0,
                "totalPages": 1,
                "page": 1,
                "results": []
            })

            const validClientId = 'valid-client-id'
            const validClientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(validClientId, validClientSecret)

            const accountId = 'valid-account-id'
            const accountType: AccountType = 'BANK'
            const providerAccountId = 'valid-account-id'
            const from = new Date('2023-03-01')
            const result = (await sut.getTransactionsByProviderAccountId(accountId, accountType, {providerAccountId, from })).value as TransactionData[]
            expect(result).toHaveLength(0)
        })

        test('should return a list of transactions from a start date to today', async () => {
            mockedPluggyClient.prototype.fetchTransactions.mockResolvedValueOnce({
                "total": 1,
                "totalPages": 1,
                "page": 1,
                "results": [
                    {
                        "id": "a8534c85-53ce-4f21-94d7-50e9d2ee4957",
                        "description": "* PROV * COMPRA TESOURO DIRETO CLIENTES",
                        "descriptionRaw": null,
                        "type": "DEBIT",
                        "currencyCode": "BRL",
                        "amount": -212.45,
                        "date": new Date("2020-10-15T00:00:00.000Z"),
                        "balance": 4439.4,
                        "category": "Fixed Income Investment",
                        "accountId": "562b795d-1653-429f-be86-74ead9502813",
                        "providerCode": null,
                        "paymentData": null,
                        "creditCardMetadata": null,
                      },
                ]
            }).mockResolvedValueOnce({                 
                "total": 0,
                "totalPages": 1,
                "page": 1,
                "results": [] 
            })

            const validClientId = 'valid-client-id'
            const validClientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(validClientId, validClientSecret)

            const accountId = 'valid-account-id'
            const accountType: AccountType = 'BANK'
            const providerAccountId = 'valid-account-id'
            const from = new Date('2023-03-01')
            const result = (await sut.getTransactionsByProviderAccountId(accountId, accountType, {providerAccountId, from })).value as TransactionData[]
            expect(mockedPluggyClient.prototype.fetchTransactions).toBeCalledWith(providerAccountId, { page: 1, from: '2023-03-01' })
            expect(result).toHaveLength(1)
        })

        test('should return a list of transactions from a start date to a end date', async () => {
            mockedPluggyClient.prototype.fetchTransactions.mockResolvedValueOnce({
                "total": 1,
                "totalPages": 1,
                "page": 1,
                "results": [
                    {
                        "id": "a8534c85-53ce-4f21-94d7-50e9d2ee4957",
                        "description": "* PROV * COMPRA TESOURO DIRETO CLIENTES",
                        "descriptionRaw": null,
                        "type": "DEBIT",
                        "currencyCode": "BRL",
                        "amount": -212.45,
                        "date": new Date("2020-10-15T00:00:00.000Z"),
                        "balance": 4439.4,
                        "category": "Fixed Income Investment",
                        "accountId": "562b795d-1653-429f-be86-74ead9502813",
                        "providerCode": null,
                        "paymentData": null,
                        "creditCardMetadata": null,
                      },
                ]
            }).mockResolvedValueOnce({ 
                "total": 0,
                "totalPages": 1,
                "page": 1,
                "results": []
             })

            const validClientId = 'valid-client-id'
            const validClientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(validClientId, validClientSecret)

            const accountId = 'valid-account-id'
            const accountType: AccountType = 'BANK'
            const providerAccountId = 'valid-account-id'
            const from = new Date('2023-03-01')
            const to = new Date('2023-05-10')
            const result = (await sut.getTransactionsByProviderAccountId(accountId, accountType, {providerAccountId, from, to })).value as TransactionData[]
            expect(mockedPluggyClient.prototype.fetchTransactions).toBeCalledWith(providerAccountId, { page: 1, from: '2023-03-01', to: '2023-05-10' })
            expect(result).toHaveLength(1)
        })

        test('should return a small list of transactions without pagination of results', async () => {
            mockedPluggyClient.prototype.fetchTransactions.mockResolvedValueOnce({
                "total": 1,
                "totalPages": 1,
                "page": 1,
                "results": [
                    {
                        "id": "a8534c85-53ce-4f21-94d7-50e9d2ee4957",
                        "description": "* PROV * COMPRA TESOURO DIRETO CLIENTES",
                        "descriptionRaw": null,
                        "type": "DEBIT",
                        "currencyCode": "BRL",
                        "amount": -212.45,
                        "date": new Date("2020-10-15T00:00:00.000Z"),
                        "balance": 4439.4,
                        "category": "Fixed Income Investment",
                        "accountId": "562b795d-1653-429f-be86-74ead9502813",
                        "providerCode": null,
                        "paymentData": null,
                        "creditCardMetadata": null,
                      },
                ]
            }).mockResolvedValueOnce({ 
                "total": 0,
                "totalPages": 1,
                "page": 1,
                "results": [] 
            })

            const validClientId = 'valid-client-id'
            const validClientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(validClientId, validClientSecret)

            const accountId = 'valid-account-id'
            const accountType: AccountType = 'BANK'
            const providerAccountId = 'valid-account-id'
            const from = new Date('2023-03-01')
            const to = new Date('2023-05-10')
            const result = (await sut.getTransactionsByProviderAccountId(accountId, accountType, {providerAccountId, from, to })).value as TransactionData[]
            expect(mockedPluggyClient.prototype.fetchTransactions).toBeCalledTimes(2)
            expect(mockedPluggyClient.prototype.fetchTransactions).toHaveBeenNthCalledWith(1, providerAccountId, { page: 1, from: '2023-03-01', to: '2023-05-10' })
            expect(mockedPluggyClient.prototype.fetchTransactions).toHaveBeenNthCalledWith(2, providerAccountId, { page: 1, from: '2023-03-01', to: '2023-05-10' })
            expect(result).toHaveLength(1)
        })

        test('should return a big list of transactions with pagination of results', async () => {
            mockedPluggyClient.prototype.fetchTransactions.mockResolvedValueOnce({
                "total": 2,
                "totalPages": 2,
                "page": 1,
                "results": [
                    {
                        "id": "a8534c85-53ce-4f21-94d7-50e9d2ee4957",
                        "description": "* PROV * COMPRA TESOURO DIRETO CLIENTES",
                        "descriptionRaw": null,
                        "type": "DEBIT",
                        "currencyCode": "BRL",
                        "amount": -212.45,
                        "date": new Date("2020-10-15T00:00:00.000Z"),
                        "balance": 4439.4,
                        "category": "Fixed Income Investment",
                        "accountId": "562b795d-1653-429f-be86-74ead9502813",
                        "providerCode": null,
                        "paymentData": null,
                        "creditCardMetadata": null,
                      },
                ]
            }).mockResolvedValueOnce({
                "total": 2,
                "totalPages": 2,
                "page": 2,
                "results": [
                    {
                        "id": "a8534c85-53ce-4f21-94d7-50e9d2ee4957",
                        "description": "* PROV * COMPRA TESOURO DIRETO CLIENTES",
                        "descriptionRaw": null,
                        "type": "DEBIT",
                        "currencyCode": "BRL",
                        "amount": -212.45,
                        "date": new Date("2020-10-15T00:00:00.000Z"),
                        "balance": 4439.4,
                        "category": "Fixed Income Investment",
                        "accountId": "562b795d-1653-429f-be86-74ead9502813",
                        "providerCode": null,
                        "paymentData": null,
                        "creditCardMetadata": null,
                      },
                ]
            }).mockResolvedValueOnce({ 
                "total": 2,
                "totalPages": 2,
                "page": 3,
                "results": [] })

            const validClientId = 'valid-client-id'
            const validClientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(validClientId, validClientSecret)

            const accountId = 'valid-account-id'
            const accountType: AccountType = 'BANK'
            const providerAccountId = 'valid-account-id'
            const from = new Date('2023-03-01')
            const to = new Date('2023-05-10')
            const result = (await sut.getTransactionsByProviderAccountId(accountId, accountType, {providerAccountId, from, to })).value as TransactionData[]
            expect(mockedPluggyClient.prototype.fetchTransactions).toBeCalledTimes(3)
            expect(mockedPluggyClient.prototype.fetchTransactions).toHaveBeenNthCalledWith(1, providerAccountId, { page: 1, from: '2023-03-01', to: '2023-05-10' })
            expect(mockedPluggyClient.prototype.fetchTransactions).toHaveBeenNthCalledWith(2, providerAccountId, { page: 1, from: '2023-03-01', to: '2023-05-10' })
            expect(mockedPluggyClient.prototype.fetchTransactions).toHaveBeenNthCalledWith(3, providerAccountId, { page: 1, from: '2023-03-01', to: '2023-05-10' })
            expect(result).toHaveLength(2)

        })

        test('should return bank transactions', async () => {
            mockedPluggyClient.prototype.fetchTransactions.mockResolvedValueOnce({
                "total": 2,
                "totalPages": 1,
                "page": 1,
                "results": [
                    {
                        "id": "a8534c85-53ce-4f21-94d7-50e9d2ee4957",
                        "description": "* PROV * COMPRA TESOURO DIRETO CLIENTES",
                        "descriptionRaw": null,
                        "type": "DEBIT",
                        "currencyCode": "BRL",
                        "amount": -212.45,
                        "date": new Date("2020-10-15T00:00:00.000Z"),
                        "balance": 4439.4,
                        "category": "Fixed Income Investment",
                        "accountId": "562b795d-1653-429f-be86-74ead9502813",
                        "providerCode": null,
                        "paymentData": null,
                        "creditCardMetadata": null,
                    },
                    {
                        "id": "ff9ed929-edc4-408c-a959-d51f79ab1814",
                        "description": "AJUSTE NA POSIÇÃO PR. 14/10/2020 NC. 870947",
                        "descriptionRaw": null,
                        "type": "CREDIT",
                        "currencyCode": "BRL",
                        "amount": 159.2,
                        "date": new Date("2020-10-14T00:00:00.000Z"),
                        "balance": 2468.84,
                        "category": "Investment",
                        "accountId": "562b795d-1653-429f-be86-74ead9502813",
                        "providerCode": null,
                        "paymentData": null,
                        "creditCardMetadata": null,
                    }
                ]
            }).mockResolvedValueOnce({ 
                "total": 0,
                "totalPages": 1,
                "page": 1,
                "results": []
            })

            const validClientId = 'valid-client-id'
            const validClientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(validClientId, validClientSecret)

            const accountId = 'valid-account-id'
            const accountType: AccountType = 'BANK'
            const providerAccountId = 'valid-account-id'
            const from = new Date('2023-03-01')
            const to = new Date('2023-05-10')
            const result = (await sut.getTransactionsByProviderAccountId(accountId, accountType, {providerAccountId, from, to })).value as TransactionData[]
            expect(result).toEqual([
                {
                    id: null,
                    accountId,
                    amount: -21245,
                    descriptionOriginal: "* PROV * COMPRA TESOURO DIRETO CLIENTES",
                    date: new Date("2020-10-15T00:00:00.000Z"),
                    providerId: "a8534c85-53ce-4f21-94d7-50e9d2ee4957",
                },
                {
                    id: null,
                    accountId,
                    amount: 15920,
                    descriptionOriginal: "AJUSTE NA POSIÇÃO PR. 14/10/2020 NC. 870947",
                    date: new Date("2020-10-14T00:00:00.000Z"),
                    providerId: "ff9ed929-edc4-408c-a959-d51f79ab1814",
                }
            ])
        })

        test('should return credit card transactions', async () => {
            mockedPluggyClient.prototype.fetchTransactions.mockResolvedValueOnce({
                "total": 2,
                "totalPages": 1,
                "page": 1,
                "results": [
                    {
                        "id": "a8534c85-53ce-4f21-94d7-50e9d2ee4957",
                        "description": "Pagamento recebido",
                        "descriptionRaw": null,
                        "type": "CREDIT",
                        "currencyCode": "BRL",
                        "amount": -1416.22,
                        "date": new Date("2020-10-15T00:00:00.000Z"),
                        "balance": null,
                        "category": null,
                        "accountId": "562b795d-1653-429f-be86-74ead9502813",
                        "providerCode": null,
                        "paymentData": null,
                        "creditCardMetadata": null,
                    },
                    {
                        "id": "ff9ed929-edc4-408c-a959-d51f79ab1814",
                        "description": "Compra online",
                        "descriptionRaw": null,
                        "type": "DEBIT",
                        "currencyCode": "BRL",
                        "amount": 159.2,
                        "date": new Date("2020-10-14T00:00:00.000Z"),
                        "balance": null,
                        "category": null,
                        "accountId": "562b795d-1653-429f-be86-74ead9502813",
                        "providerCode": null,
                        "paymentData": null,
                        "creditCardMetadata": null,
                    }
                ]
            }).mockResolvedValueOnce({ 
                "total": 0,
                "totalPages": 1,
                "page": 1,
                "results": [] 
            })

            const validClientId = 'valid-client-id'
            const validClientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(validClientId, validClientSecret)

            const accountId = 'valid-account-id'
            const accountType: AccountType = 'CREDIT_CARD'
            const providerAccountId = 'valid-account-id'
            const from = new Date('2023-03-01')
            const to = new Date('2023-05-10')
            const result = (await sut.getTransactionsByProviderAccountId(accountId, accountType, {providerAccountId, from, to })).value as TransactionData[]
            expect(result).toEqual([
                {
                    id: null,
                    accountId,
                    amount: 141622,
                    descriptionOriginal: "Pagamento recebido",
                    date: new Date("2020-10-15T00:00:00.000Z"),
                    providerId: "a8534c85-53ce-4f21-94d7-50e9d2ee4957",
                },
                {
                    id: null,
                    accountId,
                    amount: -15920,
                    descriptionOriginal: "Compra online",
                    date: new Date("2020-10-14T00:00:00.000Z"),
                    providerId: "ff9ed929-edc4-408c-a959-d51f79ab1814",
                }
            ])
        })
    })
})