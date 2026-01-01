# Netlify Deployment Guide

## Deploying Incrypt Arena to Netlify

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Incrypt Arena leaderboard"
   git remote add origin https://github.com/YOUR_USERNAME/incrypt-arena.git
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository
   - Build settings are auto-configured via `netlify.toml`

3. **Set Environment Variables**
   - In Netlify dashboard, go to Site Settings → Environment Variables
   - Add these variables:
     ```
     VITE_SUPABASE_URL = https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY = your-anon-key
     ```

4. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy automatically on every push

### Option 2: Manual Deploy

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Drag and drop**
   - Go to [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag the `dist` folder onto the page

3. **Set environment variables** (same as Option 1)

---

## Configuration Files

### netlify.toml (already configured)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables Required
| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |

---

## After Deployment

1. **Test the live site**
   - Verify leaderboard loads
   - Test admin login
   - Check real-time updates work

2. **Custom Domain (Optional)**
   - In Netlify: Domain settings → Add custom domain
   - Update DNS records as instructed

3. **Enable Supabase Production**
   - Ensure RLS policies are configured
   - Create production admin user in Supabase Auth
