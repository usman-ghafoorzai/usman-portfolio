// @vitest-environment jsdom
import { act, screen } from '@testing-library/react'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { sanitySnapshotFixture } from './content/adapters/sanity/sanity-snapshot.fixture'

const { fetch, createClient, roots } = vi.hoisted(() => {
  const fetch = vi.fn()
  return { fetch, createClient: vi.fn(() => ({ fetch })), roots: [] as Root[] }
})
vi.mock('./content/adapters/sanity/sanity-client', () => ({ createPublishedSanityClient: createClient }))
vi.mock('./App.jsx', () => ({ default: () => <p>Loaded portfolio</p> }))
vi.mock('react-dom/client', async importOriginal => {
  const original = await importOriginal<typeof import('react-dom/client')>()
  return { ...original, createRoot: (...args: Parameters<typeof original.createRoot>) => {
    const root = original.createRoot(...args)
    roots.push(root)
    return root
  } }
})

beforeEach(() => {
  vi.resetModules()
  fetch.mockReset()
  createClient.mockClear()
  vi.stubEnv('VITE_SANITY_PROJECT_ID', 'example-project')
  vi.stubEnv('VITE_SANITY_DATASET', 'example-dataset')
  document.body.innerHTML = '<div id="root"></div>'
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(async () => {
  await act(async () => { for (const root of roots.splice(0)) root.unmount() })
  document.body.innerHTML = ''
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

it.each(['missing config', 'CMS transport failure', 'invalid snapshot'])('renders a safe fatal alert for %s', async failure => {
  const error = new Error('Private diagnostic: project/dataset GROQ stack trace')
  if (failure === 'missing config') vi.stubEnv('VITE_SANITY_PROJECT_ID', '')
  else if (failure === 'CMS transport failure') fetch.mockRejectedValue(error)
  else fetch.mockResolvedValue({ profile: null })

  await act(async () => { await import('./main') })
  const alert = await screen.findByRole('alert')
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Innholdet kunne ikke lastes akkurat nå.')
  expect(alert.textContent).toBe('Innholdet kunne ikke lastes akkurat nå.Prøv å oppdatere siden, eller kom tilbake litt senere.')
  expect(screen.queryByText('Loaded portfolio')).toBeNull()
  expect(console.error).toHaveBeenCalledWith('Failed to bootstrap portfolio', expect.any(Error))
  if (failure === 'CMS transport failure') expect(console.error).toHaveBeenCalledWith('Failed to bootstrap portfolio', error)
  if (failure === 'missing config') {
    expect(createClient).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
  }
})

it('mounts the content application after a successful load without a fatal alert', async () => {
  fetch.mockResolvedValue(sanitySnapshotFixture())
  await act(async () => { await import('./main') })
  expect(await screen.findByText('Loaded portfolio')).toBeTruthy()
  expect(screen.queryByRole('alert')).toBeNull()
  expect(console.error).not.toHaveBeenCalled()
})
