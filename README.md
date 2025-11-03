## Instalação

Clonar o repositório

```bash
  git clone [https://github.com/JoannaBraccini/GrowTwitter-BackEnd2]
```

Instalar as depêndencias do projeto

```bash
  yarn install | npm install
```

Iniciar o projeto

```bash
  yarn run dev | yarn dev | npm run dev
```

## Documentação da API

GrowTwitter API

Descrição: A API GrowTwitter permite gerenciar usuários e autenticação para um aplicativo similar ao Twitter. Inclui endpoints para registrar e autenticar usuários, além de operações CRUD (Create, Read, Update, Delete) para gerenciar perfis de usuário.

Endpoints Principais:
Auth:

POST /signup: Registre um novo usuário.

POST /login: Autentique um usuário existente.

User:

GET /users: Recupere uma lista de usuários com ou sem base em parâmetros de consulta.

GET /users/:id: Recupere detalhes de um usuário específico.

PUT /users/:id: Atualize informações de um usuário.

DELETE /users/:id: Exclua um usuário.

POST /users/follow/:id: Siga um usuário específico.

Tweet:

POST /tweets: Crie ou responda um tweet.

GET /tweets: Recupere uma lista de tweets com ou sem base em parâmetros de consulta.

GET /tweets/:id: Recupere detalhes de um tweet específico.

PUT /tweets/:id: Atualize conteúdo de um tweet.

DELETE /tweets/:id: Exclua um tweet ou resposta.

POST /tweets/like/:id: Curta um tweet específico.

POST /tweets/retweet/:id: Compartilhe um tweet específico.

Essa API é projetada para facilitar o gerenciamento de usuários em um aplicativo de rede social, proporcionando uma maneira eficiente de autenticar e gerenciar perfis de usuário.

Criada como parte dos projetos práticos do curso Starter Web Full Stack da Growdev - Brasil, 2024.

## Deploy

**Backend (API):** https://growtwitter-api-er4d.onrender.com

**Documentação Swagger:** https://growtwitter-api-er4d.onrender.com/docs

**Documentação Postman:** https://documenter.getpostman.com/view/34248306/2sAY52df2o
