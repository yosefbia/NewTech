import profiles from './profiles.js'
import ProfileGrid from './ProfileGrid.jsx'

function App() {
  return (
    <main className="app">
      <h1 className="app__heading">Team Profiles</h1>
      <ProfileGrid profiles={profiles} />
    </main>
  )
}

export default App
