# M1News AI

**Assistente inteligente de redação e publicação para o M1NewsTV**

Aplicação online

Acesse o M1News AI:
https://m1news-ai.onrender.com/

O **M1News AI** é uma aplicação web desenvolvida para auxiliar o processo de produção de matérias jornalísticas do **M1NewsTV**, automatizando tarefas de preparação, organização e publicação de conteúdo.

A aplicação recebe a URL de uma matéria, extrai seu conteúdo, utiliza inteligência artificial para gerar informações editoriais e de SEO e permite que o responsável revise o material antes de enviá-lo como **rascunho para o WordPress**.

---

## Funcionalidades

### Processamento de matérias

* Inserção da URL da matéria de origem.
* Extração automática do conteúdo da página.
* Identificação de título e conteúdo através do processo de extração.
* Preservação do conteúdo original da matéria.
* Preparação do conteúdo para revisão editorial.

### Inteligência Artificial

A aplicação utiliza inteligência artificial para auxiliar na preparação da matéria.

A IA pode gerar:

* Título;
* Descrição;
* Subtítulo;
* Tags;
* Categorias;
* Frase-chave foco;
* Slug;
* Meta descrição.

O conteúdo original da matéria não deve ser reescrito pela IA.

### SEO

Integração com campos utilizados pelo **Yoast SEO**, permitindo preparar:

* Frase-chave foco;
* Slug;
* Meta descrição.

O objetivo é deixar a matéria preparada para revisão e otimização antes da publicação.

### Tags e categorias

O sistema permite:

* Visualizar as tags sugeridas;
* Adicionar novas tags;
* Criar tags automaticamente no WordPress quando necessário;
* Localizar categorias existentes;
* Associar as categorias selecionadas ao post.

### Processamento de imagens

As imagens das matérias passam por processamento antes do envio ao WordPress.

O sistema utiliza **Sharp** para:

* Baixar a imagem original;
* Corrigir a orientação EXIF;
* Redimensionar a imagem mantendo sua proporção;
* Limitar a largura máxima;
* Converter a imagem para **WebP**;
* Verificar as dimensões finais;
* Enviar a imagem processada ao WordPress;
* Definir a imagem como imagem destacada.

A interface também apresenta as dimensões da imagem processada para conferência.

### Autenticação

A aplicação possui sistema de autenticação próprio, com:

* Login;
* Cadastro de usuários;
* Senhas protegidas;
* Rotas de autenticação;
* Controle de acesso à aplicação.

### Revisão antes da publicação

O conteúdo não é publicado diretamente.

O fluxo foi desenvolvido para que o usuário possa:

1. Gerar a matéria;
2. Revisar as informações;
3. Editar o conteúdo;
4. Conferir tags;
5. Conferir categorias;
6. Conferir informações de SEO;
7. Conferir a imagem;
8. Enviar o material para o WordPress como **rascunho**.

---

# Arquitetura do projeto

A estrutura principal do projeto é organizada da seguinte maneira:

```text
m1newstv-ai/
│
├── public/
│   ├── images/
│   │   ├── M1_logo.png
│   │   └── favicon-32x32.png
│   │
│   ├── js/
│   │   ├── app.js
│   │   ├── login.js
│   │   └── register.js
│   │
│   ├── index.html
│   ├── login.html
│   └── register.html
│
├── src/
│   ├── config/
│   │   └── database.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── materiaRoutes.js
│   │
│   ├── services/
│   │   ├── aiService.js
│   │   ├── articleExtractor.js
│   │   └── wordpressService.js
│   │
│   ├── utils/
│   │   └── logger.js
│   │
│   └── server.js
│
├── .env
├── .gitignore
├── package.json
└── package-lock.json
```

## Imagens

### Logo

![M1News AI Logo](public/images/M1_logo.png)

### Interface

![M1News AI Dashboard](public/images/favicon-32x32.png)

---

# Tecnologias

## Backend

* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**
* **Sharp**
* **dotenv**

## Inteligência Artificial

* **Google Gemini API**
* **Google GenAI SDK**

## Extração de conteúdo

* **JSDOM**
* **Mozilla Readability**

## Frontend

* **HTML5**
* **JavaScript**
* **Tailwind CSS**

## CMS

* **WordPress REST API**
* **Yoast SEO**

## Infraestrutura

* **GitHub**
* **Render**

---

# Fluxo da aplicação

```text
                    ┌──────────────────┐
                    │      Usuário     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   URL da matéria │
                    └────────┬─────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Extração da matéria │
                  │ JSDOM + Readability │
                  └──────────┬──────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Inteligência    │
                    │    Artificial    │
                    └────────┬─────────┘
                             │
                             ▼
              ┌────────────────────────────┐
              │ Preparação das informações │
              │ título / tags / SEO / etc. │
              └─────────────┬──────────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │ Revisão pelo      │
                  │ usuário           │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │ Processamento da   │
                  │ imagem             │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │ WordPress REST API │
                  └─────────┬──────────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │  Rascunho Criado   │
                  └────────────────────┘
```

---

# Inteligência Artificial

A IA possui uma função de apoio editorial.

Ela **não substitui a revisão humana** e não deve alterar o conteúdo original da matéria.

O objetivo é reduzir tarefas repetitivas da redação, como:

* criação de títulos;
* criação de descrições;
* elaboração de subtítulos;
* seleção de tags;
* sugestão de categorias;
* preparação de informações para SEO.

O material gerado deve ser revisado antes do envio ao WordPress.

---

# Tratamento de imagens

As imagens são processadas utilizando o **Sharp**.

O fluxo atual inclui:

```text
Imagem original
      ↓
Download
      ↓
Leitura dos metadados
      ↓
Correção da orientação EXIF
      ↓
Redimensionamento proporcional
      ↓
Conversão para WebP
      ↓
Verificação das dimensões
      ↓
Upload para WordPress
      ↓
Imagem destacada
```

A largura máxima utilizada no processamento é de **1080px**, aumentando imagens menores sem cortar a imagem.

---

# Variáveis de ambiente

As credenciais e informações sensíveis não devem ser armazenadas diretamente no código.

Crie um arquivo `.env` localmente:

```env
PORT=3000

MONGODB_URI=sua_connection_string

GEMINI_API_KEY=sua_chave_gemini

WORDPRESS_URL=https://seu-site.com
WORDPRESS_USER=seu_usuario
WORDPRESS_APP_PASSWORD=sua_app_password
```

> Os nomes das variáveis devem corresponder exatamente aos utilizados no código da aplicação.

**Nunca publique o arquivo `.env` no GitHub.**

O arquivo deve estar incluído no `.gitignore`.

---

# Instalação

## 1. Clonar o repositório

```bash
git clone https://github.com/JeandersonAmaral/M1NewsTV-AI.git
```

Entrar no projeto:

```bash
cd M1NewsTV-AI
```

---

## 2. Instalar as dependências

```bash
npm install
```

---

## 3. Configurar as variáveis de ambiente

Crie o arquivo:

```text
.env
```

e configure as variáveis necessárias.

---

## 4. Executar a aplicação

```bash
node src/server.js
```

A aplicação ficará disponível localmente em:

```text
http://localhost:3000
```

---

# Deploy

O projeto pode ser hospedado em plataformas compatíveis com aplicações Node.js, como o **Render**.

Configuração utilizada:

### Root Directory

```text
src
```

### Build Command

```bash
npm install
```

### Start Command

```bash
node src/server.js
```

As variáveis presentes no `.env` devem ser configuradas no painel da plataforma de hospedagem.

---

# Integrações

## WordPress

A comunicação com o WordPress é realizada através da REST API.

O sistema pode:

* Buscar categorias;
* Buscar tags;
* Criar tags;
* Enviar imagens;
* Atualizar metadados das imagens;
* Criar posts;
* Associar tags;
* Associar categorias;
* Definir imagem destacada;
* Criar posts como rascunho.

---

# Organização do código

### `src/server.js`

Responsável pela inicialização da aplicação, configuração do Express, arquivos estáticos e registro das rotas.

### `src/routes/`

Contém as rotas da aplicação.

* `authRoutes.js` — autenticação;
* `materiaRoutes.js` — processamento e gerenciamento das matérias.

### `src/services/`

Contém a lógica principal dos serviços.

* `aiService.js` — comunicação com a inteligência artificial;
* `articleExtractor.js` — extração do conteúdo das matérias;
* `wordpressService.js` — integração com o WordPress.

### `src/config/`

Configurações externas da aplicação.

* `database.js` — conexão com o MongoDB.

### `src/utils/`

Funções auxiliares.

* `logger.js` — sistema de logs da aplicação.

### `public/`

Arquivos da interface web.

Contém:

* páginas HTML;
* JavaScript do frontend;
* imagens;
* recursos visuais.

---

# Segurança

O projeto utiliza variáveis de ambiente para informações sensíveis.

Não devem ser versionados:

```text
.env
```

Também não devem ser armazenados no código-fonte:

* chaves de API;
* senhas;
* credenciais do WordPress;
* strings de conexão do MongoDB;
* tokens;
* outras informações privadas.

Para autenticação no WordPress, recomenda-se utilizar **Application Passwords** em vez da senha principal da conta.

---

# Status do projeto

**Em desenvolvimento**

O M1News AI está sendo desenvolvido continuamente, com foco em automatizar e aprimorar o fluxo de produção editorial do M1NewsTV.

Novas funcionalidades e melhorias podem ser adicionadas ao longo do desenvolvimento.

---

# Próximas evoluções

Possíveis melhorias futuras:

* [ ] Sistema de permissões por usuário;
* [ ] Dashboard administrativo;
* [ ] Controle de status das matérias;
* [ ] Melhorias no processo de revisão;
* [ ] Mais ferramentas de SEO;
* [ ] Logs de processamento disponíveis na interface;
* [ ] Controle de usuários;
* [ ] Melhorias no processamento de imagens;
* [ ] Integração com outros serviços editoriais.

---

# Autor

**Jeanderson Amaral**

Engenheiro de Software e responsável pelo desenvolvimento do **M1News AI**.

Projeto desenvolvido para auxiliar o fluxo de produção de conteúdo do **M1NewsTV**.

---

## Licença

Este projeto é de uso privado e destinado ao ecossistema do M1NewsTV.

A utilização, distribuição ou modificação do código deve ser autorizada pelo responsável pelo projeto.

## Contato:
Cel: 21 981100393
E mail: Jeandersonfil@gmail.com
