# CryptoDash ARS - GitHub Pages Deployment

This project is prepared for deployment to GitHub Pages.

## Deployment Steps

1. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Add Remote Origin**:
   Replace `<username>` and `<repo-name>` with your GitHub details.
   ```bash
   git remote add origin https://github.com/<username>/<repo-name>.git
   ```

3. **Deploy**:
   Run the following command to build the project and push it to the `gh-pages` branch:
   ```bash
   npm run deploy
   ```

## Configuration Note
The `vite.config.ts` has been updated with `base: './'` to ensure that assets are correctly linked regardless of whether the app is hosted at the root domain or a subpath.

## Environment Variables
Since this app uses the CoinGecko public API, no API keys are strictly required for the current functionality. If you add features requiring the Gemini API, remember that client-side environment variables in GitHub Pages are public.
