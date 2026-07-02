// All the card data sits here in one plain array. The components below don't
// know anything about these people - they just render whatever they're given,
// so adding or editing a card is a one-line change in this file.
const profiles = [
  {
    id: 1,
    name: 'Dana Levi',
    title: 'Front-End Developer',
    avatar: 'https://i.pravatar.cc/150?img=47',
    bio: 'Turns Figma mockups into fast, accessible React interfaces.',
  },
  {
    id: 2,
    name: 'Omar Haddad',
    title: 'UX Designer',
    avatar: 'https://i.pravatar.cc/150?img=12',
    bio: 'Obsessed with clean flows and buttons people actually find.',
  },
  {
    id: 3,
    name: 'Maya Cohen',
    title: 'Backend Engineer',
    avatar: 'https://i.pravatar.cc/150?img=32',
    bio: 'Keeps the APIs quick and the databases quiet.',
  },
  {
    id: 4,
    name: 'Noah Katz',
    title: 'Product Manager',
    avatar: 'https://i.pravatar.cc/150?img=68',
    // bio left out on purpose so the "No bio provided" fallback shows up
  },
]

export default profiles
