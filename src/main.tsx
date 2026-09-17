import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PortfolioContentProvider } from './app/providers/PortfolioContentProvider'
import { loadPortfolioContent } from './application/portfolio-content'
import { localPortfolioContentGateway } from './content/adapters/local/local-portfolio-content-gateway'

async function bootstrap() {
  const rootElement = document.getElementById('root')
  if (!rootElement) throw new Error('Portfolio root element was not found')

  const content = await loadPortfolioContent(localPortfolioContentGateway)
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
