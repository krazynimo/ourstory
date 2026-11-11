# Nidhil & Meenu

Our website. Plain HTML, CSS and JavaScript, hosted free on GitHub Pages.
Every `git push` to `main` publishes the site automatically.

## What is where

| You want to change | Edit this |
| --- | --- |
| Names, tagline, wedding date, Instagram handles, public photos, credits | `js/content.js` |
| Journey, wedding photos, highlights (the password-locked part) | `private/content.json` and the photos in `private/` |
| Public photos | drop files in `assets/photos/` and point to them from `js/content.js` |
| Colours and fonts | the first block of `css/style.css` |

## First-time setup (once)

1. Create a new **public** repository on GitHub (for example `our-story`). Free GitHub Pages needs a public repo.
2. In this folder:

   ```
   git init -b main
   git add -A
   git commit -m "Our story"
   git remote add origin https://github.com/YOUR-USERNAME/our-story.git
   git push -u origin main
   ```
3. On GitHub: **Settings > Pages > Build and deployment > Source: GitHub Actions**.
4. A minute later the site is live at `https://YOUR-USERNAME.github.io/our-story/`.

## Updating the public part

Edit `js/content.js` or add photos to `assets/photos/`, then:

```
git add -A && git commit -m "Update" && git push
```

## Updating the locked part

The `private/` folder holds your real photos and story. It is listed in
`.gitignore`, so it never leaves your computer. Keep a backup of it.

1. Put photos in `private/journey/`, `private/wedding/`, `private/highlights/`.
2. Edit `private/content.json` (titles, text, captions, photo file names).
3. Lock it and push:

   ```
   node tools/lock.mjs
   git add -A && git commit -m "Update our story" && git push
   ```

`lock.mjs` asks for the password, encrypts everything into `locked/`, and
that encrypted folder is what gets published. Use the same password each
time, or tell family the new one.

The starter password is `ourstory`. Change it the first time you lock your real photos.

### How private is it?

- Locked photos and text are encrypted with AES-256. Without the password
  they are unreadable, even though the repo is public.
- Anyone who has the password can see and save everything, and can pass
  the password on. Share it the way you would share a photo album.
- Pick a phrase of four or more words. A short password can be guessed by
  a computer trying millions of combinations.
- Everything in `js/content.js` and `assets/photos/` is public to the world.

## Preview on your computer

```
npx serve .
```

Then open the address it prints. (Opening `index.html` by double-click
will show the public part but cannot unlock the film.)

## Photo sizes

Export at about 2000px on the long edge, JPG quality 80. The hero photo
should be landscape and about 2400px wide.

## Your own domain later

Buy a domain, then in **Settings > Pages > Custom domain** enter it and
follow the DNS steps GitHub shows. Nothing in the code needs to change.
