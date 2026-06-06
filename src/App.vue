<script setup>
import { ref, computed, onMounted } from 'vue'

const token = import.meta.env.VITE_API_FOOTBALL_KEY

const paises = ref([])
const paisSelecionado = ref('')

const jogadores = ref([])
const carregandoPaises = ref(false)
const carregandoElenco = ref(false)
const erro = ref('')

// Jogador clicado (abre a cartinha)
const jogadorSelecionado = ref(null)
function abrirCard(jogador) {
  jogadorSelecionado.value = jogador
}
function fecharCard() {
  jogadorSelecionado.value = null
}

// País selecionado (bandeira + nome no topo)
const paisAtual = computed(() =>
  paises.value.find((p) => p.name === paisSelecionado.value)
)

// Tradução das posições (a API devolve em inglês)
const posicaoPT = {
  Goalkeeper: 'Goleiro',
  Defender: 'Defensor',
  Midfielder: 'Meio-campo',
  Attacker: 'Atacante'
}
// Abreviação pra cartinha
const abrevPosicao = {
  Goalkeeper: 'GOL',
  Defender: 'ZAG',
  Midfielder: 'MEI',
  Attacker: 'ATA'
}
// Classe de cor por posição
function classePosicao(pos) {
  const mapa = {
    Goalkeeper: 'pos-gk',
    Defender: 'pos-def',
    Midfielder: 'pos-mid',
    Attacker: 'pos-att'
  }
  return mapa[pos] || 'pos-other'
}

// 1. Carrega os países no início (Requisito 1)
async function carregarPaises() {
  carregandoPaises.value = true
  erro.value = ''
  try {
    const resposta = await fetch('https://v3.football.api-sports.io/teams/countries', {
      method: 'GET',
      headers: { 'x-apisports-key': token }
    })
    const dados = await resposta.json()
    paises.value = dados.response
  } catch (e) {
    erro.value = 'Falha ao carregar os países.'
    console.error(e)
  } finally {
    carregandoPaises.value = false
  }
}

// 2. Ao mudar o país: busca o ID e depois o elenco (Requisito 2)
async function carregarElenco() {
  const pais = paisSelecionado.value
  if (!pais) return

  carregandoElenco.value = true
  erro.value = ''
  jogadores.value = []

  try {
    const respTime = await fetch(
      `https://v3.football.api-sports.io/teams?name=${encodeURIComponent(pais)}`,
      { method: 'GET', headers: { 'x-apisports-key': token } }
    )
    const dadosTime = await respTime.json()

    if (!dadosTime.response?.length) {
      erro.value = `Nenhuma seleção encontrada para "${pais}".`
      return
    }
    const teamId = dadosTime.response[0].team.id

    const respElenco = await fetch(
      `https://v3.football.api-sports.io/players/squads?team=${teamId}`,
      { method: 'GET', headers: { 'x-apisports-key': token } }
    )
    const dadosElenco = await respElenco.json()

    if (!dadosElenco.response?.length) {
      erro.value = 'Elenco não encontrado para essa seleção.'
      return
    }
    jogadores.value = dadosElenco.response[0].players || []
  } catch (e) {
    erro.value = 'Falha ao carregar o elenco.'
    console.error(e)
  } finally {
    carregandoElenco.value = false
  }
}

onMounted(carregarPaises)
</script>

<template>
  <main>
    <header class="topo">
      <h1>Álbum de Figurinhas</h1>
      <p class="subtitulo">Escolha uma seleção e monte o elenco</p>

      <select v-model="paisSelecionado" @change="carregarElenco" :disabled="carregandoPaises">
        <option value="" disabled>
          {{ carregandoPaises ? 'Carregando países...' : 'Selecione um país' }}
        </option>
        <option v-for="pais in paises" :key="pais.name" :value="pais.name">
          {{ pais.name }}
        </option>
      </select>
    </header>

    <section v-if="paisAtual" class="banner">
      <img :src="paisAtual.flag" :alt="paisAtual.name" class="bandeira" />
      <h2>{{ paisAtual.name }}</h2>
    </section>

    <p v-if="erro" class="aviso erro">{{ erro }}</p>
    <p v-if="carregandoElenco" class="aviso">Carregando elenco...</p>

    <section class="grid">
      <article
        v-for="jogador in jogadores"
        :key="jogador.id"
        class="card"
        :class="classePosicao(jogador.position)"
        @click="abrirCard(jogador)"
      >
        <div class="card-top">
          <span v-if="jogador.number" class="numero">{{ jogador.number }}</span>
          <img :src="jogador.photo" :alt="jogador.name" class="foto" loading="lazy" />
        </div>
        <div class="card-body">
          <h3 class="nome">{{ jogador.name }}</h3>
          <span class="badge">{{ posicaoPT[jogador.position] || jogador.position }}</span>
        </div>
      </article>
    </section>

    <!-- Cartinha estilo FIFA ao clicar no jogador -->
    <Transition name="fade">
      <div v-if="jogadorSelecionado" class="modal-overlay" @click="fecharCard">
        <div class="fut-card" @click.stop>
          <button class="fechar" @click="fecharCard" aria-label="Fechar">×</button>

          <div class="fut-top">
            <div class="fut-rating">
              <span class="num">{{ jogadorSelecionado.number || '—' }}</span>
              <span class="pos">{{ abrevPosicao[jogadorSelecionado.position] || '—' }}</span>
            </div>
            <img v-if="paisAtual" :src="paisAtual.flag" :alt="paisAtual.name" class="fut-flag" />
          </div>

          <img :src="jogadorSelecionado.photo" :alt="jogadorSelecionado.name" class="fut-foto" />

          <h3 class="fut-nome">{{ jogadorSelecionado.name }}</h3>

          <div class="fut-info">
            <div><span class="rotulo">Idade</span><span class="valor">{{ jogadorSelecionado.age || '—' }}</span></div>
            <div><span class="rotulo">Número</span><span class="valor">{{ jogadorSelecionado.number || '—' }}</span></div>
            <div><span class="rotulo">Posição</span><span class="valor">{{ posicaoPT[jogadorSelecionado.position] || jogadorSelecionado.position }}</span></div>
            <div><span class="rotulo">Seleção</span><span class="valor">{{ paisAtual?.name || '—' }}</span></div>
          </div>
        </div>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;
}

/* Cabeçalho */
.topo {
  text-align: center;
  margin-bottom: 2rem;
}
.topo h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
}
.subtitulo {
  color: #6b7280;
  margin: 0.25rem 0 1.25rem;
}
select {
  padding: 0.6rem 1rem;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #fff;
  min-width: 280px;
  cursor: pointer;
}

/* Banner da seleção */
.banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.bandeira {
  width: 44px;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}
.banner h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #111827;
}

/* Avisos */
.aviso {
  text-align: center;
  color: #6b7280;
  margin: 1rem 0;
}
.aviso.erro {
  color: #dc2626;
}

/* Grid de figurinhas (Requisito 3) */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 1.25rem;
}

/* Card */
.card {
  background: #fff;
  border: 1px solid #eef0f3;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.16);
}
.card-top {
  position: relative;
  height: 92px;
}
.card-top::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.35), transparent 55%);
}
.numero {
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 1.15rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.95);
  z-index: 1;
}
.foto {
  position: absolute;
  left: 50%;
  bottom: -44px;
  transform: translateX(-50%);
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  background: #e5e7eb;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
  z-index: 1;
}
.card-body {
  padding: 54px 12px 18px;
  text-align: center;
}
.nome {
  font-size: 0.98rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.55rem;
  min-height: 2.4em;
  display: flex;
  align-items: center;
  justify-content: center;
}
.badge {
  display: inline-block;
  padding: 3px 11px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

/* Cores por posição (faixa do topo + badge) */
.pos-gk .card-top { background: linear-gradient(135deg, #d97706, #f59e0b); }
.pos-gk .badge { background: #f59e0b; }
.pos-def .card-top { background: linear-gradient(135deg, #1e40af, #3b82f6); }
.pos-def .badge { background: #2563eb; }
.pos-mid .card-top { background: linear-gradient(135deg, #15803d, #22c55e); }
.pos-mid .badge { background: #16a34a; }
.pos-att .card-top { background: linear-gradient(135deg, #b91c1c, #ef4444); }
.pos-att .badge { background: #dc2626; }
.pos-other .card-top { background: linear-gradient(135deg, #4b5563, #6b7280); }
.pos-other .badge { background: #6b7280; }

/* Cartinha FIFA (modal) */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
}
.fut-card {
  position: relative;
  width: 300px;
  max-width: 90vw;
  border-radius: 18px;
  padding: 1.4rem 1.25rem 1.6rem;
  text-align: center;
  color: #2b2206;
  background: linear-gradient(160deg, #f7e08a, #e3c34d 55%, #c9a227);
  box-shadow: 0 22px 55px rgba(0, 0, 0, 0.45);
}
.fechar {
  position: absolute;
  top: 8px;
  right: 12px;
  border: none;
  background: transparent;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  color: #2b2206;
}
.fut-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0 0.25rem;
}
.fut-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}
.fut-rating .num { font-size: 2rem; font-weight: 900; }
.fut-rating .pos { font-size: 0.8rem; font-weight: 800; letter-spacing: 0.05em; margin-top: 2px; }
.fut-flag {
  width: 36px;
  height: auto;
  border-radius: 3px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}
.fut-foto {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.7);
  background: #e5e7eb;
  margin: 0.5rem 0 0.75rem;
}
.fut-nome {
  font-size: 1.15rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  border-top: 2px solid rgba(43, 34, 6, 0.35);
  padding-top: 0.6rem;
}
.fut-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem 0.5rem;
  margin-top: 0.9rem;
  text-align: left;
}
.fut-info > div { display: flex; flex-direction: column; }
.fut-info .rotulo {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}
.fut-info .valor { font-size: 0.95rem; font-weight: 700; }

/* Transição */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
.fade-enter-active .fut-card,
.fade-leave-active .fut-card { transition: transform 0.2s ease; }
.fade-enter-from .fut-card,
.fade-leave-to .fut-card { transform: scale(0.92); }
</style>