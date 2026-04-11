import { App } from '@/app/App'

describe('App', () => {
  it('Рендерит главный компонент без ошибки', () => {
    expect(() => <App />).not.toThrow()
  })
})
