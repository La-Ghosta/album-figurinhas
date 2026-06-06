<script setup>
import { ref, onMounted } from 'vue'

const token = import.meta.env.VITE_API_FOOTBALL_KEY

const paises = ref([])
const paisSelecionado = ref('')

const jogadores = ref([])
const carregandoPaises = ref(false)
const carregandoElenco = ref(false)
const erro = ref('')

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
    // 2a. Descobre o ID da seleção pelo nome
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

    // 2b. Usa o ID pra buscar o elenco
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
    <h1>Álbum de Figurinhas — Seleções</h1>

    <p v-if="carregandoPaises">Carregando países...</p>

    <select v-else v-model="paisSelecionado" @change="carregarElenco">
      <option value="" disabled>Selecione um país</option>
      <option v-for="pais in paises" :key="pais.name" :value="pais.name">
        {{ pais.name }}
      </option>
    </select>

    <p v-if="erro">{{ erro }}</p>
    <p v-if="carregandoElenco">Carregando elenco...</p>

    <!-- Renderização crua só pra confirmar o fluxo (estilo vem depois) -->
    <ul v-if="jogadores.length">
      <li v-for="jogador in jogadores" :key="jogador.id">
        <img :src="jogador.photo" :alt="jogador.name" width="40" height="40" />
        {{ jogador.name }} — {{ jogador.position }}
      </li>
    </ul>
  </main>
</template>

<style scoped>
main {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, sans-serif;
}
select {
  padding: 0.5rem;
  font-size: 1rem;
  min-width: 260px;
}
ul {
  list-style: none;
  padding: 0;
  margin-top: 1.5rem;
}
li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 0;
}
img {
  border-radius: 50%;
  object-fit: cover;
}
</style>