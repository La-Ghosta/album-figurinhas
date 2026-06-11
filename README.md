# Álbum de Figurinhas — Seleções ⚽

Álbum de figurinhas virtual das seleções de futebol, feito com Vue 3 e a API-Football. Escolha um país, veja o elenco em cards de figurinha e clique num jogador para abrir uma carta de detalhes.

### 🔗 [Acesse o álbum aqui](https://la-ghosta.github.io/album-figurinhas/)

## Funcionalidades

- Dropdown com os países carregados da API ao abrir a aplicação
- Ao escolher uma seleção, o app busca o ID do time e em seguida o elenco
- Figurinhas dos jogadores em grid responsivo, com foto, nome, posição (colorida por função) e número
- Clique num jogador para abrir uma carta de detalhes estilo FIFA

## Rodando localmente

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