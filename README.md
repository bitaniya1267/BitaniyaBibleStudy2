# Bitaniya Bible Study — Web Version

Mobile-first React + Vite Bible study journal.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL Vite shows in the terminal.

## Build

```bash
npm run build
```

## GitHub

Push this project to a GitHub repository. The included GitHub Actions workflow builds the site and deploys it to GitHub Pages.

In the repository:
**Settings → Pages → Build and deployment → Source: GitHub Actions**

The app stores studies, bookmarks, favorites, New Testament progress, and dark-mode preference in browser localStorage.

## Next Android step

After the web version is tested, the same React app can be packaged as an Android application (for example with a WebView/Capacitor approach) and built through GitHub Actions.
