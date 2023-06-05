export type EmailValidationResult = {
    data: {
        id: string,
        email: string,
    },
    iat: number,
    exp: number,
    emailValidationToken: string,
}