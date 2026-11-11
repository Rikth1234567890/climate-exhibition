# Media Credits Log

Every image and video used in the final presentation must have an entry here
before it is approved for display.

Fields required for approval:
- Source (organization or publication)
- Source URL
- Creator or photographer
- Licence or usage rights
- Date accessed or downloaded

---

## Status key

| Symbol | Meaning |
|---|---|
| ⬛ REVIEW REQUIRED | File exists but source not verified — not approved for display |
| ✅ APPROVED | Source verified, credit added, alt text written |
| ❌ REJECTED | File removed from consideration |

---

## Images

### global-energy-budget.jpg
- **Status:** ⬛ REVIEW REQUIRED
- **File on disk:** `assets/images/global-energy-budget.jpg`
- **Rename needed:** Yes — Windows added duplicate extension and " - Copy"
- **Visible citation in image:** Loeb et al., J. Clim. 2009; Trenberth et al., BAMS 2009
- **Source:** SOURCE REQUIRED BEFORE FINAL USE
- **Source URL:** SOURCE REQUIRED BEFORE FINAL USE
- **Creator/Organization:** SOURCE REQUIRED BEFORE FINAL USE
- **Licence:** SOURCE REQUIRED BEFORE FINAL USE
- **Alt text:** DESCRIPTION REQUIRED
- **Notes:** The diagram itself cites Loeb 2009 and Trenberth 2009 as the data source for the fluxes shown. The image may be from NASA, NOAA, or another organisation — the user must confirm origin, licence, and appropriate credit. Numbers shown are labelled as W/m² averages based on ten years of data.

---

### Manabe.jpg
- **Status:** ⬛ REVIEW REQUIRED
- **File on disk:** `assets/images/manabe.jpg`
- **Rename needed:** Yes — Windows added duplicate extension
- **Identity confirmed by:** Text visible in image reads "SYUKURO MANABE / THE NOBEL PRIZE IN PHYSICS / 2021" on the medal case
- **Source:** SOURCE REQUIRED BEFORE FINAL USE
- **Source URL:** SOURCE REQUIRED BEFORE FINAL USE
- **Creator/Photographer:** SOURCE REQUIRED BEFORE FINAL USE
- **Licence:** SOURCE REQUIRED BEFORE FINAL USE
- **Alt text:** DESCRIPTION REQUIRED — suggested: "Syukuro Manabe holding the Nobel Prize in Physics 2021 medal."
- **Notes:** Portrait photograph. Identity is confirmed by text on the medal case, not inferred from appearance alone.

---

### Hasselmann.jpg
- **Status:** ⬛ REVIEW REQUIRED
- **File on disk:** `assets/images/hasselmann.jpg`
- **Rename needed:** Yes — Windows added duplicate extension
- **Identity confirmed by:** Filename only. Medal case text not fully legible at this resolution. User must verify source documentation.
- **Source:** SOURCE REQUIRED BEFORE FINAL USE
- **Source URL:** SOURCE REQUIRED BEFORE FINAL USE
- **Creator/Photographer:** SOURCE REQUIRED BEFORE FINAL USE
- **Licence:** SOURCE REQUIRED BEFORE FINAL USE
- **Alt text:** DESCRIPTION REQUIRED — pending source verification
- **Notes:** Landscape photograph. Person with white hair and beard, grey suit, holds an open Nobel medal case. Identity is not confirmed from visual inspection alone — filename and source documentation required.

---

### extreme-weather-events.jpg
- **Status:** ⬛ REVIEW REQUIRED
- **File on disk:** `assets/images/extreme-weather-events.jpg`
- **Rename needed:** Yes — Windows added duplicate extension
- **Content:** Composite of seven photographs of extreme weather — tornado, storm clouds, flooding
- **Visible text in image:** "ROAD SUBJECT TO FLOODING / INDICATORS SHOW DEPTH"
- **Source:** SOURCE REQUIRED BEFORE FINAL USE — composite image, each panel may have a separate source
- **Source URL:** SOURCE REQUIRED BEFORE FINAL USE
- **Creator/Photographer:** SOURCE REQUIRED BEFORE FINAL USE — multiple photographers likely
- **Licence:** SOURCE REQUIRED BEFORE FINAL USE
- **Alt text:** DESCRIPTION REQUIRED — suggested basis: "Composite of photographs showing extreme weather events including a tornado, storm clouds, and flooding."
- **Notes:** The filename "nature-response" does not reliably indicate the intended topic. Visual inspection shows weather variability imagery, not an ecosystem or biological response. Suggested placement: Slide 2 (Weather vs Climate) or Slide 6 (Evidence). Routing must be user-confirmed.

---

## Videos

### greenhouse-effect.mp4
- **Status:** ⬛ REVIEW REQUIRED
- **File on disk:** `assets/videos/greenhouse-effect.mp4`
- **Rename needed:** Yes — Windows added duplicate extension
- **Duration:** 17.05 seconds (within 20-second guideline)
- **Dimensions:** 864 × 496 (landscape, approx. 16:9)
- **Source:** SOURCE REQUIRED BEFORE FINAL USE
- **Source URL:** SOURCE REQUIRED BEFORE FINAL USE
- **Creator/Organization:** SOURCE REQUIRED BEFORE FINAL USE
- **Licence:** SOURCE REQUIRED BEFORE FINAL USE
- **Caption/transcript:** DESCRIPTION REQUIRED

---

### climate-spiral.mp4
- **Status:** ⬛ REVIEW REQUIRED
- **File on disk:** `assets/videos/climate-spiral.mp4`
- **Rename needed:** Yes — Windows added duplicate extension
- **Duration:** 20.02 seconds (**marginally exceeds 20-second guideline by 0.02 s**)
- **Dimensions:** 368 × 368 (square)
- **Source:** SOURCE REQUIRED BEFORE FINAL USE
- **Source URL:** SOURCE REQUIRED BEFORE FINAL USE
- **Creator/Organization:** SOURCE REQUIRED BEFORE FINAL USE
- **Licence:** SOURCE REQUIRED BEFORE FINAL USE
- **Duration note:** User should decide whether to trim by 0.02 s or accept as-is.
- **Caption/transcript:** DESCRIPTION REQUIRED

---

### climate-change.mp4
- **Status:** ⬛ REVIEW REQUIRED
- **File on disk:** `assets/videos/climate-change.mp4`
- **Rename needed:** Yes — Windows added duplicate extension
- **Duration:** 11.5 seconds (within 20-second guideline)
- **Dimensions:** 864 × 496 (landscape, approx. 16:9)
- **Topic:** review-required (filename too broad to suggest slide automatically)
- **Source:** SOURCE REQUIRED BEFORE FINAL USE
- **Source URL:** SOURCE REQUIRED BEFORE FINAL USE
- **Creator/Organization:** SOURCE REQUIRED BEFORE FINAL USE
- **Licence:** SOURCE REQUIRED BEFORE FINAL USE
- **Caption/transcript:** DESCRIPTION REQUIRED

---

## How to approve a file

1. Add source, source URL, creator, and licence to this file.
2. Write the alt text (images) or caption (videos).
3. Update `approved: true` in `data/media-manifest.json`.
4. Update the relevant slide slot in `index.html`.
5. Add the file path to the service-worker cache in `sw.js` and bump the cache version.
6. Update `docs/sources.md` with the full source entry.
