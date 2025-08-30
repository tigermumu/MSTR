import React from 'react'
import { createRoot } from 'react-dom/client'
import StablecoinHome from './StablecoinHome'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StablecoinHome />
  </React.StrictMode>
)
