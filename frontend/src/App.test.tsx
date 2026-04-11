import { App } from './App'

describe('App', () => {
  it('Рендерит главный компонент без ошибки', () => {
    expect(() => <App />).not.toThrow()
  })
})
