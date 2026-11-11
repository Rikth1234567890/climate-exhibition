# Earth's Climate & Reliable Prediction of Global Warming

A visual, offline exhibition website for a B.Tech physics class.
Topic: 2021 Nobel Prize in Physics — Syukuro Manabe & Klaus Hasselmann.

---

## How to open the website

1. Find the file called **`index.html`** inside the `climate-exhibition` folder.
2. Double-click it. It will open in your web browser (Chrome, Edge, or Firefox).
3. No internet is needed. No server is needed. It runs directly from your laptop.

> If the page looks blank, make sure you are opening `index.html` and not
> another file. The address bar in your browser should start with `file:///`.

---

## How to scroll through slides

| Action | What it does |
|---|---|
| Scroll down | Move to the next slide |
| Scroll up | Move to the previous slide |
| Arrow Down / Page Down | Jump to the next slide |
| Arrow Up / Page Up | Jump to the previous slide |
| Home key | Go to the first slide |
| End key | Go to the last slide |
| Click a name in the top bar | Jump to that slide |
| Click a dot on the right edge | Jump to that slide |

---

## Project folder structure

```
climate-exhibition/
│
├── index.html          ← Open this in a browser to see the website
│
├── css/
│   ├── variables.css   ← Colours, fonts, spacing — change these to restyle everything
│   ├── base.css        ← Resets browser defaults so everything looks consistent
│   ├── layout.css      ← Top bar, slides, scroll snap, responsive rules
│   └── components.css  ← Reusable UI pieces (cards, badges, buttons, etc.)
│
├── js/
│   └── main.js         ← Makes the page interactive (counter, nav, animations)
│
├── data/               ← Put any JSON data files here (charts, tables, etc.)
│
├── assets/
│   ├── images/         ← Put all image files here (.jpg, .png, .svg)
│   └── videos/         ← Put any video files here (.mp4)
│
├── docs/
│   └── sources.md      ← Record every source/reference you use here
│
└── README.md           ← This file
```

---

## How to edit the website

### Changing colours
Open `css/variables.css`. Near the top you will see lines like:
```css
--color-bg-base: #080f1f;   /* page background */
--color-amber:   #f5a623;   /* solar energy    */
```
Change the hex code (e.g. `#080f1f`) to any colour you want.
The change applies everywhere automatically.

### Changing fonts
In `css/variables.css`, find `--font-body` and `--font-display`.
You can change the first font name in the list to any font installed on your laptop.
The browser will fall back to the next font in the list if yours is not available.

### Adding content to a slide
Open `index.html`. Find the slide you want to edit, e.g.:
```html
<!-- CONTENT PLACEHOLDER — Slide 2: Weather vs Climate -->
```
Add your HTML between the `<div class="slide__inner">` and its closing `</div>`.

### Adding an image
1. Copy the image file into `assets/images/`.
2. In `index.html`, add:
   ```html
   <img src="assets/images/your-image-name.jpg" alt="Describe the image here" />
   ```
   Always fill in the `alt` text — it helps screen readers and shows as text
   if the image file is missing.

### Adding a source
Open `docs/sources.md` and fill in the template at the top of that file.

---

## Colour guide

| Colour | Used for | Example |
|---|---|---|
| Cyan `#38bdf8` | Ocean, outgoing radiation, cool things | Diagrams, links |
| Amber `#f5a623` | Solar energy, incoming radiation | Sun diagrams |
| Red-orange `#f97316` | Warming signal ONLY | Temperature anomalies |
| Off-white `#e8edf5` | Main text | Body text |
| Deep navy `#080f1f` | Background | Page background |

---

## Deadline

**13 November 2026**

---

## Notes for the presenter

- The website works without internet. Do **not** add any links to Google Fonts,
  CDNs, or any `https://` URL in the HTML or CSS.
- Test it by disconnecting from Wi-Fi and refreshing the page.
- If you resize the browser window, the layout adjusts automatically (responsive).
- The menu at the top collapses into a ☰ button on small screens.


## Distribution methods

### Method 1 — Direct file (simplest offline use)

Double-click `index.html`. The site opens in your browser with **no server or internet needed**. All CSS, JS, and assets are local.

> Note: The PWA "Install" button and service-worker caching do **not** work over `file://` — that is a browser security restriction, not a bug. For a classroom laptop with no internet, direct file opening is perfectly fine.

---

### Method 2 — Local server (enables PWA + service worker)

Use this if you want the "Install app" button on Android/desktop Chrome or offline caching via service worker.

**Requirements:** Python 3 (free). Check by opening a terminal and typing `python --version`.

**Steps:**

1. Double-click **`serve-local.bat`** inside the `climate-exhibition` folder.
2. Your browser opens automatically at `http://localhost:8000`.
3. Press `Ctrl+C` in the terminal window to stop the server.

If Python is not installed: go to [python.org/downloads](https://python.org/downloads), install it (tick **"Add Python to PATH"**), then try again.

---

### Method 3 — Deploy to Vercel (shareable public URL)

**Requirements:** A free [Vercel account](https://vercel.com) and Git.

**Steps:**

1. Push the `climate-exhibition/` folder to a GitHub/GitLab repository.
2. Log in to Vercel → **Add New Project** → import your repository.
3. When asked for the **Root Directory**, set it to `climate-exhibition`.
4. Leave Build Command and Output Directory blank (static site, no build step).
5. Click **Deploy**. Vercel gives you a URL like `https://earths-climate-xxx.vercel.app`.

The `vercel.json` file in this folder configures correct caching headers automatically.

---

### Method 4 — Deploy to Netlify (alternative shareable URL)

**Option A — Drag and drop (no account needed beyond free sign-up):**

1. Go to [netlify.com](https://netlify.com) → sign up free.
2. On the dashboard, drag the entire `climate-exhibition` folder onto the deploy area.
3. Netlify gives you a URL like `https://earths-climate-abc.netlify.app`.

**Option B — Git integration:**

1. Push `climate-exhibition/` to GitHub.
2. Netlify → **Add new site** → **Import from Git**.
3. Set **Publish directory** to `.` (the folder root).
4. Leave Build command blank.
5. Deploy.

The `netlify.toml` file configures all headers automatically.

---

### Method 5 — ZIP for sharing (no Git required)

Right-click the `climate-exhibition` folder in Windows Explorer → **Send to** → **Compressed (zipped) folder**.

Share the ZIP file. Recipients unzip it and double-click `index.html`. No tools needed.

---

## PWA installation (Android Chrome)

After visiting the site over HTTPS (Vercel/Netlify URL) or `localhost`:

1. Tap the browser menu (⋮) → **Add to Home screen** / **Install app**.
2. The site installs as a standalone app with its own icon.
3. After the first visit, it works fully offline — the service worker caches all assets.

**To update cached content after new slides are added:**
Open `sw.js` and change `"climate-v1"` to `"climate-v2"` (or any new string).
On the next visit, the browser downloads and caches all files fresh.

---

## File added in this phase

| File | Purpose |
|---|---|
| `manifest.webmanifest` | PWA metadata (name, icons, theme colour, display mode) |
| `sw.js` | Service worker — caches all assets for offline use |
| `assets/icons/icon-192.svg` | App icon 192 × 192 (home screen, task switcher) |
| `assets/icons/icon-512.svg` | App icon 512 × 512 (splash screen, install prompt) |
| `vercel.json` | Vercel deployment config with correct cache headers |
| `netlify.toml` | Netlify deployment config with correct cache headers |
| `serve-local.bat` | Double-click to start a local Python server on port 8000 |
| `../.gitignore` | Excludes OS junk and editor files from Git |


---

## Temperature graph — two modes

**Option A — Direct file open (index.html)**

The rest of the site works fully. However, **the temperature graph will not load** in most browsers when the page is opened as `file://`. The browser blocks `fetch()` from local files for security reasons. The graph section shows a clear fallback message explaining this.

**Option B — Local server (recommended for the full experience)**

Run a simple local server so `fetch()` can load the CSV:

**Windows:**
```
py -m http.server 8000
```

**macOS / Linux:**
```
python3 -m http.server 8000
```

Then open: [http://localhost:8000](http://localhost:8000)

You can also use the existing `serve-local.bat` file (Windows only — double-click it).

No internet is required. The server runs entirely on your laptop.

---

## Data file

`data/nasa-gistemp-global-annual.csv` contains authentic NASA GISTEMP v4 annual mean surface temperature anomalies (1880–2025, 146 observations). It was downloaded on 2026-11-10 from the official NASA GISS server. See `docs/sources.md` for full attribution.


---

## Media review panel (administration)

The media review panel at the bottom of Slide 11 is **hidden by default** during presentation.

**To show it:**
- Add `?review=1` to the URL: `http://localhost:8000/?review=1`
- Or press **`Shift + R`** while viewing the page (not while typing in a text field)

**To hide it again:** press `Shift + R` again.

The panel shows which files are placed, which are still awaiting source/credit confirmation, and compact records for all approved media.

---

## Rights and credits

All media files must have source, credit, and licence confirmed before final submission.
See `docs/rights-checklist.md` for the full rights status of every file.

> Media credits and usage conditions are listed in docs/rights-checklist.md.
> Final rights verification is the presenter's responsibility.


---

## GitHub Pages deployment

This site is ready for GitHub Pages. No build step is required.

### Step 1 — Create a GitHub repository

1. Go to [github.com](https://github.com) and sign in (or create a free account).
2. Click **New repository**.
3. Name it `climate-exhibition`.
4. Set it to **Public** (required for free GitHub Pages).
5. Do **not** add a README or .gitignore — the project already has these.
6. Click **Create repository**.

### Step 2 — Upload the project

**Option A — Using GitHub Desktop (easiest):**
1. Download and install [GitHub Desktop](https://desktop.github.com).
2. Click **Add existing repository** → select the `climate-exhibition` folder.
3. Commit all files with a message like "Initial commit".
4. Click **Publish repository** → choose your new `climate-exhibition` repo.

**Option B — Using the GitHub website (no tools needed):**
1. Open your new repository on github.com.
2. Click **uploading an existing file**.
3. Drag the entire `climate-exhibition` folder contents into the upload area.
4. Click **Commit changes**.

**Option C — Using Git on the command line:**
```
cd "c:\Users\rikth\Desktop\Earth's Climate Project\climate-exhibition"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/climate-exhibition.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages

1. Go to your repository on github.com.
2. Click **Settings** → scroll to **Pages** in the left sidebar.
3. Under **Source**, select **Deploy from a branch**.
4. Set the branch to `main` and the folder to `/ (root)`.
5. Click **Save**.

After about 1–2 minutes, your site will be live at:

```
https://YOUR-USERNAME.github.io/climate-exhibition/
```

Replace `YOUR-USERNAME` with your actual GitHub username.

### Step 4 — Verify the deployment

After GitHub Pages builds (check the **Actions** tab for status), visit your URL and confirm:

- The title shows "Climate Evidence Exhibition"
- All slides scroll correctly
- The NASA GISTEMP graph draws
- The NASA Climate Spiral video loads
- Images in Slides 4, 8, and 9 appear
- The Prev/Next controls work
- No broken image icons appear

### Notes

- The `.nojekyll` file in this folder tells GitHub Pages to serve all files as-is, without Jekyll processing. Do not delete it.
- The service worker (`sw.js`) enables offline caching after the first visit over HTTPS.
- The NASA GISTEMP graph works without a server because the data is embedded directly in the page.
- Videos are served from the `assets/videos/` folder. GitHub Pages has a 100 MB file size limit per file; all three videos are well within this limit.
- If you rename the repository, update the `start_url` in `manifest.webmanifest` to match the new path.
