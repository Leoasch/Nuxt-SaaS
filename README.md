# Nuxt SaaS

**Português** | [English](README.en.md)

Sistema de gestão para pequenos comércios: produtos, estoque, vendas e clientes, com várias organizações por conta e permissões por cargo.

**Demonstração:** [nuxt-saas.onrender.com](https://nuxt-saas.onrender.com). Clique em **Explorar a demonstração** para entrar na conta de exemplo (Carla, proprietária da Moda Urbana Boutique). Os dados são restaurados todos os dias às 03:00 (horário de Brasília). O servidor gratuito hiberna quando fica sem uso, então o primeiro acesso pode levar cerca de um minuto.

## Funcionalidades

- **Contas:** cadastro com e-mail e senha, confirmação de e-mail, redefinição de senha e login com Google.
- **Organizações:** várias por conta, convites por e-mail, cargos (Proprietário, Administrador, Gerente, Funcionário) e transferência de propriedade.
- **Produtos:** SKU, código de barras, preço de custo e de venda, estoque mínimo e até 10 fotos por produto.
- **Estoque:** entradas e saídas com motivo e histórico, e alerta de estoque baixo.
- **Vendas:** vários produtos por venda, preço ajustável por item, forma de pagamento, cancelamento que devolve o estoque e filtros por produto e período.
- **Clientes:** cadastro com e-mail, telefone e documento.
- **Painel:** receita, vendas, ticket médio e clientes ativos, gráfico de receita, produtos mais vendidos e mais lucrativos.
- **Interface:** em português e inglês, com tema claro e escuro.

## Tecnologias

- [Nuxt 4](https://nuxt.com), [Nuxt UI 4](https://ui.nuxt.com) (Tailwind CSS 4), [@nuxtjs/i18n](https://i18n.nuxtjs.org) e [Chart.js](https://www.chartjs.org)
- API no servidor do Nuxt (Nitro), com sessões do [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils), validação com [Zod](https://zod.dev) e limite de requisições com [nuxt-api-shield](https://github.com/rrd108/nuxt-api-shield)
- PostgreSQL com [Sequelize](https://sequelize.org) e migrações com [Umzug](https://github.com/sequelize/umzug)
- Armazenamento compatível com S3 para as imagens (MinIO no desenvolvimento)
- E-mails com [Nodemailer](https://nodemailer.com) ([Mailpit](https://mailpit.axllent.org) no desenvolvimento)
- Hospedagem da demonstração: [Render](https://render.com) (aplicação), [Neon](https://neon.com) (Postgres) e [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/) (imagens)

## Como rodar localmente

Requisitos: Node.js 22 ou mais recente, [pnpm](https://pnpm.io) e Docker.

1. Instale as dependências:

   ```bash
   pnpm install
   ```

2. Crie o arquivo `.env` a partir do exemplo:

   ```bash
   cp .env.example .env
   ```

   Os valores padrão já funcionam com o `docker-compose.yml`. Preencha apenas `NUXT_SESSION_PASSWORD` com um texto aleatório de pelo menos 32 caracteres, por exemplo o resultado de `openssl rand -hex 32`. Sem ele, o servidor de desenvolvimento gera uma senha nova a cada vez que inicia, e todos os usuários são desconectados.

3. Suba o Postgres, o MinIO e o Mailpit:

   ```bash
   docker compose up -d
   ```

   | Serviço | Endereço |
   | --- | --- |
   | Postgres | `localhost:5432` |
   | MinIO (S3) | `localhost:9000`, painel em [localhost:9001](http://localhost:9001) (usuário e senha `minioadmin`) |
   | Mailpit | SMTP em `localhost:1025`, caixa de entrada em [localhost:8025](http://localhost:8025) |

   O bucket de imagens é criado automaticamente quando o servidor inicia. Todos os e-mails enviados localmente (confirmação, redefinição de senha e convites) aparecem na caixa de entrada do Mailpit.

4. Preencha o banco com os dados de demonstração (opcional, veja abaixo):

   ```bash
   pnpm seed
   ```

5. Inicie o servidor de desenvolvimento em `http://localhost:3000`:

   ```bash
   pnpm dev
   ```

### Login com Google (opcional)

Crie um cliente OAuth do tipo "Aplicativo da Web" no [Google Cloud Console](https://console.cloud.google.com/apis/credentials), adicione `http://localhost:3000/auth/google` como URI de redirecionamento autorizado e preencha `NUXT_OAUTH_GOOGLE_CLIENT_ID` e `NUXT_OAUTH_GOOGLE_CLIENT_SECRET` no `.env`. Sem essas variáveis, o restante da aplicação funciona normalmente.

## Dados de demonstração

`pnpm seed` cria 10 usuários, 3 organizações (eletrônicos, casa e cozinha, moda) com membros e convites pendentes, 75 clientes, 90 produtos com fotos reais de cada produto e 90 dias de vendas, cancelamentos e movimentações de estoque. As fotos vêm do [DummyJSON](https://dummyjson.com) e ficam em cache em `.data/seed-cache`, então só a primeira execução precisa de internet.

- Rodar de novo não faz nada enquanto os dados de demonstração existirem. `pnpm seed --reset` apaga somente o que o seed criou e cria tudo de novo (os seus próprios dados nunca são alterados). É também assim que as datas são atualizadas, já que as vendas são geradas a partir do dia em que o comando roda.
- O comando se recusa a rodar com `NODE_ENV=production`, a menos que você passe `--force`.
- Todos os usuários criados têm a senha `Password123!`, por exemplo `ana@seed.example.com` (proprietária da TechNova), `felipe@seed.example.com` (funcionário), `julia@seed.example.com` (dois convites pendentes) ou `lucas@seed.example.com` (sem organização). A lista completa aparece quando o seed termina.

## Migrações

O esquema do banco é versionado em `server/database/migrations` e aplicado com o [Umzug](https://github.com/sequelize/umzug), que registra o que já rodou na tabela `SequelizeMeta`. As migrações pendentes rodam automaticamente quando o servidor inicia (e antes do `pnpm seed`), então um clone novo não precisa de nenhum passo extra. Elas também podem ser rodadas manualmente:

```bash
pnpm db:migrate          # aplica as migrações pendentes
pnpm db:migrate:down     # desfaz a última migração aplicada
pnpm db:migrate:status   # lista as migrações aplicadas e pendentes
```

Um banco criado antes das migrações existirem (pelo antigo `sequelize.sync()`) é detectado na primeira execução: a migração base é marcada como aplicada e só as seguintes rodam.

Para mudar o esquema, adicione um novo arquivo numerado ao lado dos outros (por exemplo `0004-add-supplier-to-products.ts`) exportando `up` e `down`, inclua-o na lista em `migrations/index.ts` e atualize o model correspondente. Nunca edite uma migração que já foi aplicada; escreva uma nova.

## Verificações

```bash
pnpm lint
pnpm typecheck
```

As duas rodam no GitHub Actions a cada push.

## Produção

Gere o build de produção:

```bash
pnpm build
```

Visualize o build localmente:

```bash
pnpm preview
```

Em produção, defina todas as variáveis do `.env.example` com os valores do ambiente. Use `NUXT_DATABASE_SSL=true` para um Postgres que exige TLS (como o Neon) e `NUXT_APP_URL` com o endereço público, que é usado nos links dos e-mails. Veja a [documentação de deploy do Nuxt](https://nuxt.com/docs/getting-started/deployment) para mais detalhes.

## Demonstração pública

Definir `NUXT_PUBLIC_DEMO_EMAIL` com uma conta do seed (por exemplo `carla@seed.example.com`) ativa o modo de demonstração:

- a página de login mostra o botão "Explorar a demonstração", que entra nessa conta e abre a organização dela;
- todas as contas do seed (`@seed.example.com`) ficam protegidas: mudanças de senha, perfil, e-mail e foto, exclusão da conta, edição e exclusão de organizações, transferência de propriedade, convites e mudanças de membros são recusadas, e e-mails de redefinição de senha não são enviados para elas.

Deixe essa variável vazia no desenvolvimento, onde os usuários do seed funcionam como qualquer outra conta.

Para preencher um banco hospedado a partir da sua máquina, mantenha as configurações dele em um arquivo separado e aponte o seed para ele. Somente esse arquivo é lido, e qualquer configuração faltando interrompe o script:

```bash
pnpm seed --env-file .env.deploy
pnpm db:migrate:status --env-file .env.deploy
```

O workflow `reset-demo` do GitHub Actions roda `pnpm seed --reset` todas as noites às 03:00 (horário de Brasília), desfazendo o que os visitantes mudaram e trazendo as vendas para as datas atuais. Ele precisa destes secrets no repositório: `NUXT_DATABASE_HOST`, `NUXT_DATABASE_PORT`, `NUXT_DATABASE_NAME`, `NUXT_DATABASE_USER`, `NUXT_DATABASE_PASSWORD`, `NUXT_DATABASE_SSL`, `NUXT_S3_ENDPOINT`, `NUXT_S3_REGION`, `NUXT_S3_BUCKET`, `NUXT_S3_ACCESS_KEY_ID` e `NUXT_S3_SECRET_ACCESS_KEY`. Também pode ser iniciado manualmente pela aba Actions. O GitHub pausa workflows agendados após 60 dias sem atividade no repositório; reative-o pela mesma aba.

## Licença

[MIT](LICENSE)
