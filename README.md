# AI Future

AI ta'lim va zamonaviy IT platformasi.

## Local development

```bash
npm install
npm run dev
```

## Supabase setup

1. Create a new Supabase project.
2. Open SQL Editor and run the contents of `supabase/schema.sql`.
3. Copy the project URL and anon key from the Supabase dashboard.
4. Add the following in `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Optional:

```env
VITE_API_BASE_URL=http://localhost:4000/api
PORT=4000
BUNNY_API_KEY=your-bunny-storage-api-key
BUNNY_STORAGE_ZONE=your-storage-zone
BUNNY_BASE_URL=https://storage.bunnycdn.com
```

## GitHub deployment

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

## Vercel deployment

1. Sign in to Vercel.
2. Import the GitHub repository.
3. Set the following environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `BUNNY_API_KEY`
   - `BUNNY_STORAGE_ZONE`
   - `BUNNY_BASE_URL` (optional, defaults to `https://storage.bunnycdn.com`)
4. Keep the default build command:
   - `npm run build`
5. Keep the output directory:
   - `dist`

## Production build

```bash
npm run build
npm run preview -- --host 0.0.0.0 --port 4177
```
