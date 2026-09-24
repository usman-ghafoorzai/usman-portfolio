import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PortfolioContentProvider } from './app/providers/PortfolioContentProvider'
import { loadPortfolioContent } from './application/portfolio-content'
import { createProductionContentGateway } from './bootstrap-content'

async function bootstrap() {
  const rootElement = document.getElementById('root')
  if (!rootElement) throw new Error('Portfolio root element was not found')

  const gateway = createProductionContentGateway({
    VITE_SANITY_PROJECT_ID: import.meta.env.VITE_SANITY_PROJECT_ID,
    VITE_SANITY_DATASET: import.meta.env.VITE_SANITY_DATASET,
  })
  const content = await loadPortfolioContent(gateway)
  createRoot(rootElement).render(
    <StrictMode>
      <PortfolioContentProvider content={content}>
        <App />
      </PortfolioContentProvider>
    </StrictMode>,
  )
}

void bootstrap().catch((error: unknown) => {
  console.error('Failed to bootstrap portfolio', error)
})
