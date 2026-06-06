<script setup>
import { ref, onMounted } from 'vue'

const token = import.meta.env.VITE_API_FOOTBALL_KEY

const paises = ref([])           // lista que alimenta o dropdown
const paisSelecionado = ref('')  // país escolhido (v-model do select)
const carregando = ref(false)
const erro = ref('')

async function carregarPaises() {
  carregando.value = true
  erro.value = ''
  try {
    const resposta = await fetch('https://v3.football.api-sports.io/teams/countries', {
      method: 'GET',
      headers: { 'x-apisports-key': token }
    })
    const dados = await resposta.json()
    paises.value = dados.response  // array de { name, code, flag }
  } catch (e) {
    erro.value = 'Falha ao carregar os países.'
    console.error(e)
  } finally {
    carregando.value = false
  }
}

onMounted(carregarPaises)
</script>

<template>
  <main>
    <h1>Álbum de Figurinhas — Seleções</h1>

    <p v-if="carregando">Carregando países...</p>
    <p v-else-if="erro">{{ erro }}</p>

    <select v-else v-model="paisSelecionado">
      <option value="" disabled>Selecione um país</option>
      <option v-for="pais in paises" :key="pais.name" :value="pais.name">
        {{ pais.name }}
      </option>
    </select>

    <p v-if="paisSelecionado">Selecionado: {{ paisSelecionado }}</p>
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
</style>