import {defineCliConfig} from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET
if (!projectId || projectId === 'your-project-id' || !dataset) {
  throw new Error('Studio configuration missing: set a real SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET in studio/.env.local. See studio/.env.example.')
}

export default defineCliConfig({api: {projectId, dataset}})
