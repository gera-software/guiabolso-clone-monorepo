# Guiabolso Clone PWA
Interface web mobile

## Dependencies
- MongoDB
- [Pluggy Account](https://pluggy.ai/)

## Setup
Criar um arquivo .env na raiz do projeto para definir as seguintes variáveis de ambiente:

- VITE_MONGO_URI
- VITE_SERVER_URL
- VITE_PLUGGY_CLIENT_ID
- VITE_PLUGGY_CLIENT_SECRET
- VITE_APP_MODE

Você pode se basear no arquivo .example.env

## Install
`npm install`

## Locally Run
O seguinte comando vai inicializar uma instancia local de um servidor do Netlify que poderá ser acessado em http://localhost:8888

`npm run dev`

Obs: O Netlify é bem lento para inicializar, mas é necessário para rodar localmente as serveless functions que ainda estão sendo utilizadas. 
Mas a ideia é substituir todas as serveless functions por endpoints na API do servidor.

## Build
TODO

## Publishing
TODO