import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Careers from './Careers.jsx'

// Simple path check, no router library needed:
// goldcard-hr-system.vercel.app/careers   -> public candidate page
// goldcard-hr-system.vercel.app/ (anything else) -> internal HR system
const isCareers = window.location.pathname.startsWith('/careers')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isCareers ? <Careers /> : <App />}
  </React.StrictMode>,
)
