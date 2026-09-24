import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createProductionContentGateway } from './bootstrap-content'
import { loadPortfolioContent } from './application/portfolio-content'
import { sanitySnapshotFixture } from './content/adapters/sanity/sanity-snapshot.fixture'
import { SANITY_PORTFOLIO_QUERY } from './content/adapters/sanity/sanity-portfolio-query'

const { fetch, createClient } = vi.hoisted(() => {
  const fetch = vi.fn()
  return { fetch, createClient: vi.fn(() => ({ fetch })) }
})
vi.mock('./content/adapters/sanity/sanity-client', () => ({ createPublishedSanityClient: createClient }))

const environment = { VITE_SANITY_PROJECT_ID: 'example-project', VITE_SANITY_DATASET: 'example-dataset' }

beforeEach(() => {
  fetch.mockReset()
  createClient.mockClear()
})

describe('production content composition', () => {
  for (const name of ['VITE_SANITY_PROJECT_ID', 'VITE_SANITY_DATASET'] as const) {
    it.each([undefined, '', '   ', 42])(`rejects invalid ${name}: %s before creating a client`, value => {
      expect(() => createProductionContentGateway({ ...environment, [name]: value })).toThrow(name)
      expect(createClient).not.toHaveBeenCalled()
      expect(fetch).not.toHaveBeenCalled()
    })
  }

  it('accepts valid configuration and loads the Sanity gateway without live network access', async () => {
    const snapshot = sanitySnapshotFixture()
    fetch.mockResolvedValue(snapshot)
    const gateway = createProductionContentGateway(environment)
    expect(createClient).toHaveBeenCalledWith({ projectId: 'example-project', dataset: 'example-dataset' })
    expect(fetch).not.toHaveBeenCalled()
    const content = await loadPortfolioContent(gateway)
    expect(fetch).toHaveBeenCalledWith(SANITY_PORTFOLIO_QUERY)
    expect(content.profile.name).toBe(snapshot.profile.name)
    expect(content.projects.map(project => project.id)).toEqual(['project-first', 'project-a', 'project-z'])
  })

  it('propagates CMS read failures instead of returning local fixtures', async () => {
    const error = new Error('CMS unavailable')
    fetch.mockRejectedValue(error)
    await expect(loadPortfolioContent(createProductionContentGateway(environment))).rejects.toBe(error)
  })
})
