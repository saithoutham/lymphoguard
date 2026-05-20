# LYMPHOGUARD

Luxury clinical static prototype for immune fitness monitoring during chemoradiation therapy.

## Pages

- `index.html` - Landing page with interactive wearable ring
- `dashboard.html` - Clinician dashboard
- `patient.html` - Patient detail view
- `patient-portal.html` - Mobile patient portal
- `methods.html` - Scientific methods page

## Run Locally

```bash
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080/index.html`.

## Deploy On Vercel

This is a static site. Vercel can deploy it directly from the repository root.

Recommended Vercel settings:

- Framework preset: `Other`
- Build command: leave empty
- Output directory: `public`
- Install command: leave empty

The included `vercel.json` maps clean routes such as `/dashboard`, `/patient`, `/patient-portal`, and `/methods` to their HTML files.
