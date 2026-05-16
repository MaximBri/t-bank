import { beforeEach, describe, expect, it } from 'vitest'
import { initialEventFiltersState } from './constants'
import { useEventFiltersStore } from './useEventFiltersStore'
import { EventFilterStatus } from './types'

describe('useEventFiltersStore', () => {
  beforeEach(() => {
    useEventFiltersStore.setState(initialEventFiltersState)
  })

  it('начальное состояние: search пустой', () => {
    expect(useEventFiltersStore.getState().search).toBe('')
  })

  it('начальное состояние: status равен All', () => {
    expect(useEventFiltersStore.getState().status).toBe(EventFilterStatus.All)
  })

  it('setSearch обновляет search', () => {
    useEventFiltersStore.getState().setSearch('поход')
    expect(useEventFiltersStore.getState().search).toBe('поход')
  })

  it('setStatus обновляет status', () => {
    useEventFiltersStore.getState().setStatus(EventFilterStatus.Active)
    expect(useEventFiltersStore.getState().status).toBe(EventFilterStatus.Active)
  })

  it('reset возвращает начальное состояние', () => {
    useEventFiltersStore.getState().setSearch('что-то')
    useEventFiltersStore.getState().setStatus(EventFilterStatus.Completed)
    useEventFiltersStore.getState().reset()
    expect(useEventFiltersStore.getState().search).toBe('')
    expect(useEventFiltersStore.getState().status).toBe(EventFilterStatus.All)
  })

  it('setStartDate и setEndDate работают независимо', () => {
    useEventFiltersStore.getState().setStartDate('2026-01-01')
    useEventFiltersStore.getState().setEndDate('2026-12-31')
    expect(useEventFiltersStore.getState().startDate).toBe('2026-01-01')
    expect(useEventFiltersStore.getState().endDate).toBe('2026-12-31')
  })

  it('setMinParticipants обновляет minParticipants', () => {
    useEventFiltersStore.getState().setMinParticipants('5')
    expect(useEventFiltersStore.getState().minParticipants).toBe('5')
  })

  it('setMaxParticipants обновляет maxParticipants', () => {
    useEventFiltersStore.getState().setMaxParticipants('50')
    expect(useEventFiltersStore.getState().maxParticipants).toBe('50')
  })

  it('все setters работают вместе', () => {
    useEventFiltersStore.getState().setSearch('тест')
    useEventFiltersStore.getState().setStatus(EventFilterStatus.Planned)
    useEventFiltersStore.getState().setStartDate('2026-06-01')
    useEventFiltersStore.getState().setEndDate('2026-06-30')
    useEventFiltersStore.getState().setMinParticipants('10')
    useEventFiltersStore.getState().setMaxParticipants('100')

    const state = useEventFiltersStore.getState()
    expect(state.search).toBe('тест')
    expect(state.status).toBe(EventFilterStatus.Planned)
    expect(state.startDate).toBe('2026-06-01')
    expect(state.endDate).toBe('2026-06-30')
    expect(state.minParticipants).toBe('10')
    expect(state.maxParticipants).toBe('100')
  })
})
