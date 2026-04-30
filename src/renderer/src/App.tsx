import { AppProvider, useAppStore } from './store'
import Navbar from './components/layout/Navbar'
import TabBar from './components/layout/TabBar'
import WebviewContainer from './components/layout/WebviewContainer'
import Sidebar from './components/layout/Sidebar'
import './assets/browser.css'

function AppContent(): React.JSX.Element {
  const { isDarkMode } = useAppStore()

  return (
    <div className={`app-container ${isDarkMode ? 'dark-theme' : ''}`}>
      <TabBar />
      <Navbar />
      <div className="main-layout">
        <WebviewContainer />
        <Sidebar />
      </div>
    </div>
  )
}

function App(): React.JSX.Element {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
