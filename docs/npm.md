# Uso do npm no projeto

Este projeto usa `npm workspaces` para gerenciar tres pacotes a partir da raiz:

- `@campainha/mobile`: app Expo em `apps/mobile`
- `@campainha/web`: pagina publica Vite em `apps/web`
- `@campainha/shared`: tipos e utilitarios em `packages/shared`

## Requisitos

- Node.js 18 ou superior
- npm 9 ou superior

Confira as versoes instaladas:

```bash
node -v
npm -v
```

## Instalar dependencias

Execute a instalacao sempre na raiz do repositorio:

```bash
npm install
```

O npm cria um unico `package-lock.json` na raiz e instala as dependencias dos workspaces. Evite rodar `npm install` separadamente dentro de `apps/mobile`, `apps/web` ou `packages/shared`, salvo quando estiver corrigindo um problema especifico.

## Rodar comandos

Os comandos mais usados podem ser executados direto da raiz.

### Atalhos da raiz

```bash
npm run dev:web
npm run dev:mobile
npm run mobile:android
npm run mobile:ios
npm run mobile:web
npm run build:web
npm run preview:web
npm run typecheck
```

Tambem e possivel usar `-w` para executar scripts em um workspace especifico.

### Web publica

```bash
npm run dev -w @campainha/web
```

Outros scripts da web:

```bash
npm run build -w @campainha/web
npm run preview -w @campainha/web
npm run typecheck -w @campainha/web
```

Portas configuradas:

- Dev: `5173`
- Preview: `4173`

### App mobile

```bash
npm run start -w @campainha/mobile
```

Outros scripts do mobile:

```bash
npm run android -w @campainha/mobile
npm run ios -w @campainha/mobile
npm run web -w @campainha/mobile
npm run typecheck -w @campainha/mobile
```

Portas configuradas:

- Expo/Metro: `8081`
- Expo Web: `19006`

### Pacote compartilhado

```bash
npm run typecheck -w @campainha/shared
```

## Validar TypeScript em todo o projeto

Na raiz, rode:

```bash
npm run typecheck
```

Esse comando executa a checagem de tipos do mobile, da web e do pacote compartilhado.

## Adicionar dependencias

Instale dependencias no workspace que realmente usa o pacote.

Para adicionar uma dependencia na web:

```bash
npm install nome-do-pacote -w @campainha/web
```

Para adicionar uma dependencia no mobile:

```bash
npm install nome-do-pacote -w @campainha/mobile
```

Para adicionar uma dependencia de desenvolvimento:

```bash
npm install -D nome-do-pacote -w @campainha/web
```

Para remover uma dependencia:

```bash
npm uninstall nome-do-pacote -w @campainha/web
```

## Variaveis de ambiente

Use `.env.example` como referencia e crie um arquivo `.env` na raiz do projeto. A web esta configurada para ler esse `.env` da raiz.

Cada app espera suas proprias variaveis:

- Web: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Mobile: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` e `EXPO_PUBLIC_WEB_PUBLIC_URL`

## Problemas comuns

Se um pacote local, como `@campainha/shared`, nao for encontrado, rode `npm install` na raiz para recriar os links dos workspaces.

Se a porta ja estiver em uso, encerre o processo que esta usando a porta ou ajuste temporariamente o script no workspace.

Se o Expo apresentar cache antigo, tente:

```bash
npm run start -w @campainha/mobile -- --clear
```

Se as dependencias ficarem inconsistentes, remova `node_modules` e reinstale a partir da raiz:

```bash
npm install
```
