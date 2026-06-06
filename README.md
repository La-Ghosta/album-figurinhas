# Álbum de Figurinhas — Seleções

Álbum de figurinhas virtual das seleções de futebol. Escolha um país, veja o elenco em cards de figurinha e clique num jogador para abrir uma carta de detalhes. Os dados vêm da API-Football em tempo real.

## Tecnologias

- **Vue 3** — Composition API com `<script setup>`
- **Vite** — build e servidor de desenvolvimento
- **Fetch API** — requisições assíncronas com `async/await`
- **CSS** — Grid responsivo, sem bibliotecas de estilo
- **API-Football (v3)** — fonte dos dados de seleções e jogadores

## Funcionalidades

- Dropdown de países carregado da API ao abrir a aplicação
- Busca encadeada: ao escolher o país, o app descobre o ID da seleção e em seguida o elenco
- Grid de cards responsivo com foto, nome, posição (colorida por função) e número
- Carta de detalhes ao clicar no jogador, com idade, número, posição e seleção

## Como rodar

**Pré-requisitos:** [Node.js](https://nodejs.org/) 18+ e uma chave gratuita da [API-Football](https://dashboard.api-football.com/register).

1. Clone o repositório e entre na pasta:
```bash
git clone https://github.com/La-Ghosta/album-figurinhas.git
cd album-figurinhas
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env.local` na raiz com a sua chave (ela não vem no repositório):
```
VITE_API_FOOTBALL_KEY=sua_chave_aqui
```

4. Rode o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse **http://localhost:5173** no navegador.

## Como funciona

A aplicação encadeia três requisições da API-Football:

1. `GET /teams/countries` — lista os países e preenche o dropdown.
2. `GET /teams?name={país}` — descobre o ID numérico da seleção escolhida.
3. `GET /players/squads?team={id}` — usa esse ID para buscar o elenco e montar os cards.