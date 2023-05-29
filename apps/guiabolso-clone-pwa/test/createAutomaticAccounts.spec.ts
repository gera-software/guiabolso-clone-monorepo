import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import serverApiWrapper from '../src/helpers/serverApiWrapper'
import { createAutomaticAccounts } from '../src/helpers/createAutomaticAccounts'
import { Item } from 'pluggy-sdk'

describe("create automatic accounts unit test", () => {

    const spy = vi.spyOn(serverApiWrapper, 'connectAutomaticAccounts')

    beforeEach(() => {
        vi.resetAllMocks()
    })

    test('Should return accounts', async () => {
        const item: Item = {
            "id": "d0ab10e7-c52d-45c9-8f88-e6d4ce44daa5",
            "connector": {
                "id": 2,
                "name": "Pluggy Bank",
                "primaryColor": "ef294b",
                "institutionUrl": "https://pluggy.ai",
                "country": "BR",
                "type": "PERSONAL_BANK",
                "credentials": [
                    {
                        "label": "User",
                        "name": "user",
                        "type": "text",
                        "placeholder": "",
                        "validation": "^user-.{2,50}$",
                        "validationMessage": "O user deve começar com \"user-\"",
                        "optional": false
                    },
                    {
                        "label": "Password",
                        "name": "password",
                        "type": "password",
                        "placeholder": "",
                        "validation": "^.{6,20}$",
                        "validationMessage": "A senha deve ter entre 6 e 20 caracteres",
                        "optional": false
                    }
                ],
                "imageUrl": "https://cdn.pluggy.ai/assets/connector-icons/sandbox.svg",
                "hasMFA": false,
                "health": {
                    "status": "ONLINE",
                    "stage": null
                },
                "products": [
                    "ACCOUNTS",
                    "CREDIT_CARDS",
                    "TRANSACTIONS",
                    "PAYMENT_DATA",
                    "INVESTMENTS",
                    "INVESTMENTS_TRANSACTIONS",
                    "OPPORTUNITIES",
                    "IDENTITY",
                    // "PORTFOLIO",
                    // "INCOME_REPORTS"
                ],
                "createdAt": new Date("2020-09-07T00:08:06.588Z")
            },
            "createdAt": new Date("2023-05-29T20:59:15.805Z"),
            "updatedAt": new Date("2023-05-29T20:59:39.821Z"),
            "status": "UPDATED",
            "executionStatus": "SUCCESS",
            "lastUpdatedAt": new Date("2023-05-29T20:59:39.793Z"),
            "webhookUrl": null,
            "error": null,
            "clientUserId": null,
            "consecutiveFailedLoginAttempts": 0,
            "statusDetail": null,
            "parameter": null,
            "userAction": null,
            // "nextAutoSyncAt": null
        }
        spy.mockResolvedValue([{ account: 's'},{ account: 'b'},])

        const userId = 'valid'

        const data = await createAutomaticAccounts(item, userId)
        expect(data).toEqual([{ account: 's'},{ account: 'b'},])
    })

    test('Should return another accounts', async () => {
        const item: Item = {
            "id": "d0ab10e7-c52d-45c9-8f88-e6d4ce44daa5",
            "connector": {
                "id": 2,
                "name": "Pluggy Bank",
                "primaryColor": "ef294b",
                "institutionUrl": "https://pluggy.ai",
                "country": "BR",
                "type": "PERSONAL_BANK",
                "credentials": [
                    {
                        "label": "User",
                        "name": "user",
                        "type": "text",
                        "placeholder": "",
                        "validation": "^user-.{2,50}$",
                        "validationMessage": "O user deve começar com \"user-\"",
                        "optional": false
                    },
                    {
                        "label": "Password",
                        "name": "password",
                        "type": "password",
                        "placeholder": "",
                        "validation": "^.{6,20}$",
                        "validationMessage": "A senha deve ter entre 6 e 20 caracteres",
                        "optional": false
                    }
                ],
                "imageUrl": "https://cdn.pluggy.ai/assets/connector-icons/sandbox.svg",
                "hasMFA": false,
                "health": {
                    "status": "ONLINE",
                    "stage": null
                },
                "products": [
                    "ACCOUNTS",
                    "CREDIT_CARDS",
                    "TRANSACTIONS",
                    "PAYMENT_DATA",
                    "INVESTMENTS",
                    "INVESTMENTS_TRANSACTIONS",
                    "OPPORTUNITIES",
                    "IDENTITY",
                    // "PORTFOLIO",
                    // "INCOME_REPORTS"
                ],
                "createdAt": new Date("2020-09-07T00:08:06.588Z")
            },
            "createdAt": new Date("2023-05-29T20:59:15.805Z"),
            "updatedAt": new Date("2023-05-29T20:59:39.821Z"),
            "status": "UPDATED",
            "executionStatus": "SUCCESS",
            "lastUpdatedAt": new Date("2023-05-29T20:59:39.793Z"),
            "webhookUrl": null,
            "error": null,
            "clientUserId": null,
            "consecutiveFailedLoginAttempts": 0,
            "statusDetail": null,
            "parameter": null,
            "userAction": null,
            // "nextAutoSyncAt": null
        }
        spy.mockResolvedValueOnce([{ account: 'v'},{ account: 'b'},])

        const userId = 'valid'

        const data = await createAutomaticAccounts(item, userId)
        expect(data).toEqual([{ account: 'v'},{ account: 'b'},])
    })
})