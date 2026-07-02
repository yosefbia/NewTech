import PropTypes from 'prop-types'

// A single business-card tile. It owns no data of its own - it takes one
// profile object through props and displays it. That's what makes it reusable:
// the same component works for every person in the list.
function ProfileCard({ profile }) {
  const { name, title, avatar, bio } = profile

  return (
    <article className="card">
      <img className="card__avatar" src={avatar} alt={`Portrait of ${name}`} />
      <h2 className="card__name">{name}</h2>
      <p className="card__title">{title}</p>
      {/* fall back to a placeholder when a profile has no bio */}
      <p className="card__bio">{bio || 'No bio provided'}</p>
    </article>
  )
}

// Runtime checks so a malformed profile object fails loudly during development.
ProfileCard.propTypes = {
  profile: PropTypes.shape({
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    bio: PropTypes.string,
  }).isRequired,
}

export default ProfileCard
