import { Connector, Item, ItemStatus, Account as PluggyAccount, PluggyClient } from 'pluggy-sdk'
import { PluggyDataProvider } from "@/external/financial-data-provider"
import { DataProviderError, UnexpectedError } from '@/usecases/errors'
import { AccountData } from '@/usecases/ports'
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
                }
            ]
            mockedPluggyClient.prototype.fetchConnectors.mockResolvedValueOnce({ results: arrayConnectors })

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
        })
    })

    describe('get connect token', () => {
        test('should returns a generic connect token', async () => {
            const validAccessToken = 'valid-access-token'
            mockedPluggyClient.prototype.createConnectToken.mockResolvedValueOnce({ accessToken: validAccessToken })

            const clientId = 'valid-client-id'
            const clientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(clientId, clientSecret)

            const result = (await sut.getConnectToken()).value
            expect(result).toBe(validAccessToken)
        })

        test('should returns a specific connect token', async () => {
            const validAccessToken = 'valid-access-token'
            mockedPluggyClient.prototype.createConnectToken.mockImplementationOnce(async (itemId) => ({ accessToken: validAccessToken + itemId }))

            const clientId = 'valid-client-id'
            const clientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(clientId, clientSecret)

            const itemId = 'valid-item-id'
            const result = (await sut.getConnectToken(itemId)).value
            expect(result).toBe(validAccessToken + itemId)
        })

        test('should returns DataProviderError if invalid authorization token', async () => {
            mockedPluggyClient.prototype.createConnectToken.mockRejectedValueOnce({ code: 403, message: "Missing or invalid authorization token" })

            const invalidClientId = 'invalid-client-id'
            const invalidClientSecret = 'invalid-client-secret'
            const sut = new PluggyDataProvider(invalidClientId, invalidClientSecret)

            const itemId = 'valid-item-id'
            const result = (await sut.getConnectToken(itemId)).value as Error
            expect(result).toBeInstanceOf(DataProviderError)
        })

        test('should returns DataProviderError if has a internal server error', async () => {
            mockedPluggyClient.prototype.createConnectToken.mockRejectedValueOnce({ code: 500, message: "Internal Server Error" })

            const validClientId = 'valid-client-id'
            const validClientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(validClientId, validClientSecret)

            const itemId = 'valid-item-id'
            const result = (await sut.getConnectToken(itemId)).value as Error
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
            expect(result).toBeInstanceOf(UnexpectedError)
        })

        test('should return a error if provider api has an internal error', async () => {
            mockedPluggyClient.prototype.fetchItem.mockRejectedValueOnce({ code: 500, message: "Internal Server Error" })
            const validClientId = 'valid-client-id'
            const validClientSecret = 'valid-client-secret'
            const sut = new PluggyDataProvider(validClientId, validClientSecret)

            const itemId = 'valid-item-id'
            const result = (await sut.getAccountsByItemId(itemId)).value as Error
            expect(result).toBeInstanceOf(UnexpectedError)
        })

        test('should return a list of accounts', async () => {
            const validItemId = "a5d1ca6c-24c0-41c7-8b44-9272cc868663"

            const item: Item = {
                "id": validItemId,
                "createdAt": new Date("2021-12-28T21:48:02.863Z"),
                // "updatedAt": new Date("2021-12-28T21:48:02.952Z"),
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
                },
                "status": ItemStatus.UPDATING,
                "executionStatus": "CREATED",
                "lastUpdatedAt": null,
                "webhookUrl": null,
                // "error": null,
                "clientUserId": "My User App Id",
                "parameter": null,
                // "userAction": null,
                // "statusDetail": {
                //   "accounts": {
                //     "isUpdated": true,
                //     "lastUpdatedAt": "2022-03-08T22:43:04.796Z",
                //     "warnings": []
                //   },
                //   "identity": {
                //     "isUpdated": false,
                //     "lastUpdatedAt": null,
                //     "warnings": []
                //   },
                //   "creditCards": {
                //     "isUpdated": true,
                //     "lastUpdatedAt": "2022-03-08T22:43:04.796Z",
                //     "warnings": []
                //   },
                //   "investments": {
                //     "isUpdated": true,
                //     "lastUpdatedAt": "2022-03-08T22:43:04.796Z",
                //     "warnings": [
                //       {
                //         "code": "001",
                //         "message": "You lack permissions to view Investments on this account",
                //         "providerMessage": "Meu perfil não permite visualizar investimentos"
                //       }
                //     ]
                //   },
                //   "transactions": {
                //     "isUpdated": true,
                //     "lastUpdatedAt": "2022-03-08T22:43:04.796Z",
                //     "warnings": []
                //   },
                //   "paymentData": null
                // },
                // "nextAutoSyncAt": null
            }

            const bankAccount: PluggyAccount = {
                "id": "a658c848-e475-457b-8565-d1fffba127c4",
                "type": "BANK",
                "subtype": "CHECKINGS_ACCOUNT",
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
                }
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
                }
            }
            
            mockedPluggyClient.prototype.fetchItem.mockResolvedValueOnce(item)

            mockedPluggyClient.prototype.fetchAccounts.mockResolvedValueOnce({
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
})