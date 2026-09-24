import { createPublishedSanityClient } from './content/adapters/sanity/sanity-client'
import { createSanityPortfolioContentGateway } from './content/adapters/sanity/sanity-portfolio-content-gateway'

type ContentEnvironment = {
  VITE_SANITY_PROJECT_ID?: unknown
  VITE_SANITY_DATASET?: unknown
}

/** Composition-root configuration only; adapters never read deployment environment values. */
export function createProductionContentGateway(environment: ContentEnvironment) {
  function required(name: keyof ContentEnvironment): string {
    const value = environment[name]
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(`Missing or invalid ${name}: expected a non-empty string`)
    }
    return value.trim()
  }

  const projectId = required('VITE_SANITY_PROJECT_ID')
  const dataset = required('VITE_SANITY_DATASET')
  const client = createPublishedSanityClient({ projectId, dataset })
  return createSanityPortfolioContentGateway(client)
}
