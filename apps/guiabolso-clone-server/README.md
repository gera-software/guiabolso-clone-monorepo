# guiabolso-clone-server
API do Guiabolso clone

## Dependencies
- MongoDB
- [Pluggy Account](https://pluggy.ai/)
- SMTP Service (ex: gmail)

## Setup
Criar um arquivo .env na raiz do projeto para definir as seguintes variáveis de ambiente:

- MONGO_URL
- JWT_SECRET
- BCRYPT_ROUNDS
- PORT
- PLUGGY_CLIENT_ID
- PLUGGY_CLIENT_SECRET
- SMTP_SERVICE
- SMTP_USER
- SMTP_PASSWORD
- FRONTEND_URL

Você pode se basear no arquivo .example.env

## Install
`npm install`

## Locally Run
~~ O seguinte comando vai inicializar um servidor que poderá ser acessado em http://localhost:5000 ~~

`npm run dev`

==Obs: Por algum conflito com o typescript, esse comando não funciona...==

Por enquanto use o comando `npm run build && npm run start` para rodar um build da aplicação

## Build
`npm run build`

## Publishing
TODO

## Tests
- `npm run test` para rodar todos os testes (CI)
- `npm run test:verbose` para rodar todos os testes com erros detalhados
- `npm run test:unit` para rodar testes unitários
- `npm run test:integration` para rodar testes de integração
