import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'
import {capabilityIds} from './schemaTypes/capabilityArea'
import {structure} from './structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET
if (!projectId || projectId === 'your-project-id' || !dataset) {
  throw new Error('Studio configuration missing: set a real SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET in studio/.env.local. See studio/.env.example.')
}

const fixedTypes = new Set(['profile', 'siteContent', 'capabilityArea'])
const collectionTypes = new Set(['project', 'experience', 'technology'])

export default defineConfig({
  name: 'portfolio', title: 'Portfolio Studio', projectId, dataset,
  plugins: [structureTool({structure})],
  schema: {
    types: schemaTypes,
    templates: previous => [
      ...previous.filter(template => template.schemaType !== 'capabilityArea'),
      ...capabilityIds.map(id => ({
        id: `capability-${id}`, title: `Capability: ${id}`, schemaType: 'capabilityArea', value: {stableId: id},
      })),
    ],
  },
  document: {
    newDocumentOptions: previous => previous.filter(option => collectionTypes.has(option.templateId)),
    actions: (previous, context) => previous.filter(action => {
      if (fixedTypes.has(context.schemaType)) return action.action !== 'duplicate' && action.action !== 'delete'
      if (collectionTypes.has(context.schemaType)) return action.action !== 'duplicate'
      return true
    }),
  },
})
