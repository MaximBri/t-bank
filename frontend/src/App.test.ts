import { createPinia } from 'pinia'
import { mount } from '@vue/test-utils'

import App from './App.vue'

describe('App', () => {
  it('renders the new Vue stack headline', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia()],
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
          RouterView: {
            template: '<div />',
          },
        },
      },
    })

    expect(wrapper.text()).toMatch(/Стек фронтенда переведён на Vue 3/i)
  })
})
