# Educational Gamification App

Minimal local README for the Dynamic Gamification project. Contains run instructions for the server and client and a short API pointer.

## Project structure

- `client/` - React + Vite front-end
- `server/` - Express + MongoDB back-end

## Requirements

- Node.js >= 18
- npm
- MongoDB (local or remote URI via `MONGODB_URI`)

## Quick start (local)

1. Install root + client deps (root uses npm scripts to forward to client):

```bash
cd /path/to/dynamic-gamification-mern
npm install
```

2. Start the client (Vite):

```bash
cd client
npm install
npm run dev
```

3. Start the server:

```bash
cd server
# set env vars, e.g. MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

The client will default to Vite's port (5173) and the server to port 5000 (see `server/server.js`).

## API Reference

See `server/API_DOCS.md` for detailed API endpoints, request/response formats, and authentication requirements.

## Pushing changes

To push to GitHub (HTTPS):

```bash
git remote add origin https://github.com/<user>/Educational-Gamification-App.git
git branch -M main
git push -u origin main
```

Or using SSH:

```bash
git remote add origin git@github.com:<user>/Educational-Gamification-App.git
git push -u origin main
```

Replace `<user>` with your GitHub username or the target owner.

## Notes

- For protected branches or CI, avoid force-pushing.
- If you want me to push from this environment, provide GitHub auth (SSH key or gh auth) and I can run the push.
