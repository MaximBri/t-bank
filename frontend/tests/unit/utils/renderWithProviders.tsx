import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type { PropsWithChildren, ReactElement } from 'react'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'

type RenderWithProvidersOptions = RenderOptions & {
  routerProps?: MemoryRouterProps
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: 0, gcTime: 0 },
      mutations: { retry: 0 },
    },
  })
}

export function renderWithProviders(
  ui: ReactElement,
  { routerProps, ...options }: RenderWithProvidersOptions = {},
) {
  const queryClient = makeQueryClient()

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter {...routerProps}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) }
}
