import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NavigationShowcase } from './features/figma/NavigationShowcase'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<NavigationShowcase />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
