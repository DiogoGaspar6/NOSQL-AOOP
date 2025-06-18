# 🎬 Movie Chatbot - Assistente de Filmes Inteligente

[![Netlify Status](https://api.netlify.com/api/v1/badges/d640061d-5871-48be-ae3e-0a3da41219c9/deploy-status)](https://cineworld-aoop.netlify.app)
[![Node.js Version](https://img.shields.io/badge/node.js-18.x-brightgreen.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Code Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://standardjs.com/)

> Um chatbot inteligente de filmes que utiliza IA para fornecer recomendações personalizadas baseadas no perfil do utilizador.

## 📋 Índice

- [🎯 Sobre o Projeto](#-sobre-o-projeto)
- [✨ Funcionalidades](#-funcionalidades)
- [🏗️ Arquitetura](#️-arquitetura)
- [🚀 Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [📦 Instalação](#-instalação)
- [⚙️ Configuração](#️-configuração)
- [🎮 Como Usar](#-como-usar)
- [🔧 Desenvolvimento](#-desenvolvimento)
- [🌐 Deploy](#-deploy)
- [📊 Estrutura do Projeto](#-estrutura-do-projeto)
- [🤝 Contribuição](#-contribuição)
- [📄 Licença](#-licença)

## 🎯 Sobre o Projeto

O **Movie Chatbot** é um assistente inteligente de filmes que combina a potência da IA (Google Gemini) com uma base de dados robusta de filmes (MongoDB) para fornecer recomendações personalizadas e análises detalhadas.

### Características Principais

- 🤖 **IA Avançada**: Utiliza o Google Gemini para interpretação de linguagem natural
- 🎭 **Perfis Personalizados**: Diferentes tipos de utilizador (Casual, Crítico, Entusiasta)
- 🔍 **Busca Inteligente**: Sistema de extração de palavras-chave e busca contextual
- 📱 **Interface Moderna**: Interface web responsiva e intuitiva
- ⚡ **Performance**: Otimizado para respostas rápidas e eficientes

## ✨ Funcionalidades

### 🎪 Tipos de Utilizador

| Tipo | Descrição | Exemplo de Resposta |
|------|-----------|-------------------|
| **👤 Casual** | Assistente amigável e acessível | "Olá! Vou-te ajudar a encontrar filmes incríveis!" |
| **🎭 Crítico** | Análise técnica e criteriosa | "Este filme apresenta uma narrativa complexa com..." |
| **🎪 Entusiasta** | Curiosidades e contexto histórico | "Sabias que este filme foi inspirado em..." |

### 🔍 Capacidades de procura

- **Busca por Título**: "Inception", "Star Wars"
- **Busca por Género**: "filmes de ação", "comédias românticas"
- **Busca por Época**: "filmes dos anos 90", "clássicos dos anos 50"
- **Busca Contextual**: "filmes similares a Inception"
- **Busca Especializada**: "filmes cult com avaliações baixas"

### 💬 Exemplos de Perguntas

```
"Quais são os melhores filmes de ação?"
"Recomenda-me filmes similares a Inception"
"Encontra pérolas escondidas dos anos 90"
"Filmes cult com avaliações baixas"
"Qual é a diferença entre Star Wars e Star Trek?"
```

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External APIs │
│   (HTML/CSS/JS) │◄──►│   (Node.js)     │◄──►│   (Gemini API)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   MongoDB       │
                       │   (Database)    │
                       └─────────────────┘
```

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de dados NoSQL
- **Axios** - Cliente HTTP

### Frontend
- **HTML5** - Estrutura da página
- **CSS3** - Estilização moderna
- **JavaScript (ES6+)** - Interatividade

### IA e APIs
- **Google Gemini** - Modelo de linguagem natural
- **Netlify Functions** - Serverless functions

### Ferramentas de Desenvolvimento
- **Git** - Controlo de versões
- **Netlify** - Deploy e hosting
- **Dotenv** - Gestão de variáveis de ambiente

## 📦 Instalação

### Pré-requisitos

- Node.js (versão 18 ou superior)
- MongoDB (local ou Atlas)
- Conta Google Cloud (para API Gemini)

### Passos de Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/DiogoGaspar6/movie-chatbot.git
cd movie-chatbot
```

2. **Instala as dependências**
```bash
npm install
```

3. **Configura as variáveis de ambiente**
```bash
cp .env.example .env
```

4. **Edita o arquivo `.env`**
```env
MONGODB_URI=mongodb://localhost:27017/movies
GEMINI_API_KEY=sua_chave_api_aqui
DBNAME=movies_db
MONGODB_COLLECTION=movies
```

5. **Inicia o servidor**
```bash
npm start
```

## ⚙️ Configuração

### Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `MONGODB_URI` | URL de conexão MongoDB | `mongodb://localhost:27017/movies` |
| `GEMINI_API_KEY` | Chave da API Google Gemini | `AIzaSy...` |
| `DBNAME` | Nome da base de dados | `movies_db` |
| `MONGODB_COLLECTION` | Nome da coleção | `movies` |

### Configuração da API Gemini

1. Acede a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Cria uma nova API Key
3. Copia a chave para a variável `GEMINI_API_KEY`

## 🎮 Como Usar

### Interface Web

1. Abre o navegador em `http://localhost:3001`
2. Seleciona o teu tipo de perfil (Casual, Crítico, Entusiasta)
3. Faz perguntas sobre filmes na caixa de texto
4. Recebe recomendações personalizadas

### API Endpoint

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "filmes de ação",
    "userType": "casual"
  }'
```

### Exemplos de Resposta

```json
{
  "resposta": "Encontrei alguns filmes de ação incríveis para ti! 🎬\n\n1. **Mad Max: Fury Road** (2015) - Ação, Aventura\n⭐ Avaliação: 8.1/10\n📖 Uma perseguição épica num mundo pós-apocalíptico..."
}
```

## 🔧 Desenvolvimento

### Scripts Disponíveis

```bash
npm start          # Inicia o servidor
npm run dev        # Modo desenvolvimento com nodemon
npm run build      # Build para produção
```

### Estrutura de Desenvolvimento

```
movie-chatbot/
├── scripts/
│   ├── chatbot.js      # Lógica principal do chatbot
│   └── database.js     # Configuração da base de dados
├── pages/
│   ├── index.html      # Página principal
│   └── chat.html       # Interface do chat
├── styles/
│   └── chat.css        # Estilos da interface
├── netlify/
│   └── functions/      # Funções serverless
└── index.js            # Servidor Express
```

## 🌐 Deploy

### Deploy no Netlify

1. **Conecta o repositório**
   - Vai para [Netlify](https://app.netlify.com)
   - Clica em "New site from Git"
   - Seleciona o teu repositório

2. **Configura as variáveis de ambiente**
   - Vai para "Site settings" > "Environment variables"
   - Adiciona todas as variáveis do `.env`

3. **Deploy automático**
   - O Netlify fará deploy automático a cada push

### Configuração do Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "."

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

## 📊 Estrutura do Projeto

```
📁 movie-chatbot/
├── 📁 scripts/
│   ├── 🤖 chatbot.js          # Classe principal do chatbot
│   └── 🗄️ database.js         # Configuração MongoDB
├── 📁 pages/
│   ├── 🏠 index.html          # Página inicial
│   └── 💬 chat.html           # Interface do chat
├── 📁 styles/
│   └── 🎨 chat.css            # Estilos CSS
├── 📁 netlify/
│   └── 📁 functions/
│       └── 🤖 chat_bot.mjs    # Função serverless
├── 📄 index.js                # Servidor Express
├── 📄 package.json            # Dependências
├── 📄 netlify.toml           # Configuração Netlify
└── 📄 README.md              # Documentação
```

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faz um fork do projeto
2. Cria uma branch para a tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit das tuas alterações (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abre um Pull Request

### Guidelines de Contribuição

- Mantém o código limpo e bem documentado
- Segue as convenções de nomenclatura existentes
- Testa as tuas alterações antes de submeter
- Atualiza a documentação quando necessário

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - vê o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ por Diogo Gaspar**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/DiogoGaspar6)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/diogoogaspar)
