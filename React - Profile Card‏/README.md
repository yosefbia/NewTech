# react-profile-card-yosef-biadse

A tiny React app that renders a grid of profile cards. Built for Lecture 17
(Intro to React · JSX · Functional Components) — props and rendering only, no
state or hooks.

## Setup

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

To make a production build:

```bash
npm run build
npm run preview
```

## Project structure

```
index.html            Vite host page, loads src/index.jsx
src/
  index.jsx           entry point, mounts <App />
  App.jsx             page shell: heading + the grid
  ProfileGrid.jsx     maps the array into cards
  ProfileCard.jsx     one reusable card, driven purely by props
  profiles.js         the card data (a plain array)
  styles.css          layout, borders, rounded avatars, hover effect
```

Data flows one way: `profiles.js` → `App` → `ProfileGrid` → `ProfileCard`.

## Notes

- To add a person, drop another object into the array in `profiles.js`.
- If a profile has no `bio`, the card shows "No bio provided".
- PropTypes on `ProfileCard` catch a malformed profile object during dev.
