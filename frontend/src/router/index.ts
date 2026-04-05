import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/health',
    component: {
      template:
        '<p class="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-slate-200">Маршрутизация подключена.</p>',
    },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
