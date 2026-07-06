# TODO

## React/Vite login API routing fix
- [ ] update frontend/src/services/api.ts to use import.meta.env.VITE_API_URL as baseURL (no hardcoded '/api')
- [ ] update frontend/src/services/googleSignIn.ts to use import.meta.env.VITE_API_URL and correct endpoint path
- [ ] update frontend/vite.config.ts to remove/disable dev-only proxy impact for production (optional)
- [ ] update vercel.json routing so /api is not proxied to Vercel backend (leave external Render)
- [ ] ensure frontend/.env.example contains VITE_API_URL=https://sloapp.onrender.com
- [ ] add console.log to confirm final URL used during login
- [ ] run: npm run build (inside frontend/)
- [ ] fix any build errors and ensure TS passes

