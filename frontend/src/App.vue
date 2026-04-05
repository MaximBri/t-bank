<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useCounterStore } from './stores/counter'

const counterStore = useCounterStore()
const { count } = storeToRefs(counterStore)
</script>

<template>
  <main class="min-h-screen bg-slate-950 text-slate-50">
    <section class="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-6 px-6 py-16">
      <p class="text-sm uppercase tracking-[0.3em] text-cyan-300">T-Ивент</p>
      <h1 class="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
        Стек фронтенда переведён на Vue 3 по требованиям README.
      </h1>
      <p class="max-w-2xl text-lg text-slate-300">
        Подключены Vue Router, Pinia, Axios, Tailwind CSS, Jest и vue-query. Сейчас это стартовый каркас,
        а не готовый продукт.
      </p>
      <div class="flex flex-wrap items-center gap-4">
        <button
          class="rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
          type="button"
          @click="counterStore.increment"
        >
          Проверка Pinia: {{ count }}
        </button>
        <RouterLink class="text-cyan-300 underline underline-offset-4" to="/health">
          Проверка роутинга
        </RouterLink>
      </div>
      <RouterView />
    </section>
  </main>
</template>
