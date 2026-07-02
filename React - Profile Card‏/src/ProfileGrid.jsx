import PropTypes from 'prop-types'
import ProfileCard from './ProfileCard.jsx'

// Takes the full list and lays the cards out in a grid. Keeping the map here
// (instead of inside App) means the layout logic lives in one small place.
function ProfileGrid({ profiles }) {
  return (
    <section className="grid">
      {profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} />
      ))}
    </section>
  )
}

ProfileGrid.propTypes = {
  profiles: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default ProfileGrid
