# Passo a passo para configurar o Projeto

### - Criar o nosso arquivo package.json

```bash
npm init -y
```

### - Adicionar os comandos nos scripts do `packagen.json`

```
"build": "tsc",
"dev": "ts-node-dev --respawn --transpile-only ./src/server.ts"
```

### - Instalar as dependências e suas tipagens

```bash
npm i express cors dotenv prisma @prisma/client
npm i -D typescript @types/node ts-node-dev @types/express @types/cors
```

### - Inicializar o arquivo `tsconfig.json`, responsável pelas opções do compilador Typescript

```bash
npx tsc --init
```

### - Modificar as entradas

- `target`: alterar para uma versão mais recente do ECMASCRIPT `ES2022`
- `rootDir`: Apontar onde estarão os arquivos typescript `./src`
- `outDir`: Apontar onde estarão os arquivos javascript transpilados `./dist`
- `"exclude": ["node_modules"]`: adicionado no final, garante que não vai transpilar a node modules

### - Inicializar o provedor PostgreSQL

```bash
npx prisma init --datasource-provider postgresql
```

### - Criar pastas e arquivos

```bash
touch .gitignore
touch .env
touch .env-example
mkdir src
cd src
touch server.ts
cd ..
```

### - Adicionar arquivos a serem ignorados no commit, dentro do `.gitignore`

- `node_modules`
- `.env`

### - Configurar o ambiente no `.env`

PORT=porta_a_ser_usada
DATABASE_URL=caminho_do_banco

- Atualizar o `.env-example` com os nomes das variáveis mas sem os valores

### - Configurar o banco no `schema.prisma`

generator client {  
provider = "prisma-client-js"  
previewFeatures = ["postgresqlExtensions"] <small>`--caso queira usar um outro schema`</small>  
}

datasource db {  
provider = "postgresql"  
url = env("DATABASE_URL")  
extensions = [hstore(schema: "nome_do_schema")] <small>`--caso queira usar um outro schema`</small>  
}

### - Inicializar terminal

```bash
npm run dev
```

### - Inicializar Prisma Studio

```bash
npx prisma studio
```

### - Imports iniciais

```ts
import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT;
```

## - Comandos úteis

```bash
npx prisma migrate dev --name nome_da_migration
npx prisma generate
```
