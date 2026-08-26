# Car Service Log

A garage-logbook style app for tracking multiple vehicles' service history,
upcoming service reminders (by km and date, whichever comes first), road
tax / insurance expiry, and spend over time.

This project was adapted from a Claude.ai artifact. The only structural
change from that version is the storage layer: Claude's artifact preview
uses a built-in `window.storage` API that only exists inside Claude.ai, so
this project uses **Firebase Firestore** instead, so your data persists
and syncs the same way outside of Claude.

---

## What you'll need

- [Node.js](https://nodejs.org) version 18 or later installed on your computer
- A free [Firebase](https://firebase.google.com) account (uses your Google account)
- A free [Vercel](https://vercel.com) account for deployment (or Netlify — see Step 5)
- A free [GitHub](https://github.com) account, if you want to deploy via Git (recommended)

No credit card is required for any of this at the scale a personal app like
this uses.

---

## Step 1 — Get the project onto your computer

1. Unzip the project folder you downloaded (`car-service-log`) wherever you keep code, e.g. `~/projects/car-service-log`.
2. Open a terminal in that folder.
3. Install dependencies:
   ```bash
   npm install
   ```

---

## Step 2 — Create a Firebase project (your cloud storage)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and click **Add project**.
2. Name it anything (e.g. `car-service-log`) and click through the setup (you can disable Google Analytics — not needed).
3. Once created, on the project overview page click the **`</>`** (web) icon to register a web app.
4. Give it a nickname (e.g. `car-service-log-web`) and click **Register app**. You do **not** need Firebase Hosting here.
5. Firebase will show you a `firebaseConfig` object like this:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "car-service-log-xxxxx.firebaseapp.com",
     projectId: "car-service-log-xxxxx",
     storageBucket: "car-service-log-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456"
   };
   ```
   Keep this tab open — you'll copy these values in Step 3.

6. In the left sidebar, go to **Build > Firestore Database** → **Create database** → start in **Production mode** → pick a region close to you (e.g. `asia-southeast1` for Malaysia) → **Enable**.
7. Still in Firestore, go to the **Rules** tab, delete the default contents, and paste in the contents of `firestore.rules` from this project. Click **Publish**.
8. In the left sidebar, go to **Build > Authentication** → **Get started** → under **Sign-in method**, enable **Anonymous** → **Save**.
   This lets the app quietly sign each browser in without showing you a login screen.

---

## Step 3 — Connect the app to your Firebase project

1. In the project folder, copy `.env.example` to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in each value from the `firebaseConfig` object in Step 2.5:
   ```
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=car-service-log-xxxxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=car-service-log-xxxxx
   VITE_FIREBASE_STORAGE_BUCKET=car-service-log-xxxxx.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```
3. Save the file. `.env` is already in `.gitignore`, so it won't be committed to Git or uploaded anywhere public.

---

## Step 4 — Run it locally

```bash
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). Add a vehicle and
a service record, then check the **Firestore Database > Data** tab in the
Firebase console — you should see a `users` collection appear with your
data inside it. That confirms the cloud connection works.

---

## Step 5 — Deploy it so you can use it from your phone

The easiest path is **Vercel**, connected to a GitHub repo, because it
auto-deploys every time you push a change.

### 5a. Push the project to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
```
Create a new empty repository on [github.com/new](https://github.com/new)
(don't initialize it with a README), then follow the "push an existing
repository" instructions it shows you, e.g.:
```bash
git remote add origin https://github.com/<your-username>/car-service-log.git
git branch -M main
git push -u origin main
```

### 5b. Import into Vercel
1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Select the `car-service-log` repository → **Import**.
3. Vercel auto-detects Vite. Before deploying, open **Environment Variables** and add the same six `VITE_FIREBASE_...` values from your `.env` file.
4. Click **Deploy**. After a minute you'll get a live URL like `car-service-log.vercel.app`.
5. Open that URL on your phone and add it to your home screen (Share → Add to Home Screen on iOS, or the browser's "Install app" prompt on Android) so it behaves like a standalone app.

Every future `git push` to `main` will automatically redeploy.

**Alternative: Netlify.** If you prefer Netlify over Vercel, the steps are
the same shape: import the GitHub repo at [app.netlify.com](https://app.netlify.com),
set the build command to `npm run build` and publish directory to `dist`,
and add the same environment variables before deploying.

---

## Sync across devices

By default, each browser gets its own anonymous Firebase identity, so your
phone and your laptop won't automatically see the same data — anonymous
sign-in doesn't carry a password to prove it's "you" on another device.

To make two devices share the same data, open the browser console on
**both** devices and run, once each, with the exact same value:
```js
import('/src/storage.js').then(m => m.setSharedAccountId('pick-any-secret-string'))
```
(Or wire this into a small settings field in the app later — it's a
one-line call.) Treat the string like a password: anyone who knows it can
read and write that data, per the trade-off noted in `firestore.rules`.

---

## Notes and limits

- **Photos** are compressed to ~640px JPEGs before saving, to keep each
  Firestore document small. This keeps quality modest but sync fast.
- **Firebase free tier (Spark plan)** comfortably covers personal use —
  50K document reads/day and 20K writes/day, far more than a car log needs.
- If you ever want a real login (email/password or Google sign-in) instead
  of anonymous + shared-ID syncing, that's a small addition to
  `src/storage.js` and `firebase Authentication` settings — ask if you'd
  like that added.

---

## Project structure

The project follows a layered structure so each piece has one job:
UI components render, hooks manage state, domain functions hold the
business rules (reminders, costs), and `storage.js` is the only file
that talks to Firebase.

```
car-service-log/
├── index.html
├── package.json
├── vite.config.js
├── .env.example        # copy to .env and fill in
├── firestore.rules      # paste into Firebase console > Firestore > Rules
└── src/
    ├── main.jsx              # React entry point
    ├── App.jsx               # thin page composition — no business logic
    ├── storage.js             # the only file that talks to Firestore
    ├── index.css              # base page + global styles
    │
    ├── styles/
    │   └── theme.js            # colors, fonts
    ├── constants/
    │   └── serviceTypes.js     # service type presets + icons
    ├── utils/
    │   ├── date.js              # date math (today, days-between, add-months)
    │   ├── format.js            # currency/km formatting, id generation
    │   └── image.js             # photo compression before saving
    ├── domain/
    │   ├── reminder.js          # next-service-due calculation (pure function)
    │   └── cost.js              # spend-by-category/year calculation
    ├── hooks/
    │   └── useVehicles.js       # load/save/add/edit/delete vehicles + records
    │
    └── components/
        ├── common/               # Badge, Modal, TextField, PhotoPicker, etc.
        ├── layout/Header.jsx
        ├── vehicle/               # VehicleTabs, VehicleHeroCard, VehicleForm
        ├── service/               # ServiceTimeline, RecordForm
        └── dashboard/             # DueRing, ServiceReminderCard, CostSummaryCard
```

### Why this structure

The app started as one ~900-line `App.jsx` file. That still worked, but
adding new features (fuel tracking, expenses, multiple maintenance
schedules — see "Where this goes next" below) would have made that file
increasingly hard to navigate and test. This structure means:

- **`domain/`** functions (`calculateReminder`, `calculateCostSummary`)
  are plain JavaScript with no React or Firebase in them — they're easy
  to unit test in isolation later, and easy to reason about.
- **`hooks/useVehicles.js`** is the only place that knows vehicles/records
  are persisted via `storage.js`. Swap the backend later and only this
  file changes.
- **`components/`** are presentational — they receive data and callbacks
  as props and don't reach into Firebase or global state directly.

This refactor is behavior-preserving: the UI, the Firestore data shape,
and everything you can do in the app are unchanged from before. It's a
structural change only.

### Where this goes next (not built yet)

If you want to keep evolving this into a fuller vehicle-management app,
the natural next steps — in rough priority order — are:

1. **Real authentication** (Google/email sign-in) instead of anonymous +
   shared-ID, with Firestore rules locked to `request.auth.uid == userId`.
2. **Fuel tracking** and **separate expense categories** (parking, tolls,
   insurance, etc.) alongside service records.
3. **Per-maintenance-item schedules** (oil, brake fluid, air filter each
   with their own interval) instead of one global interval.
4. **Firestore subcollections** (`vehicles/{id}/services/{id}`) instead
   of one big JSON blob, once the data volume justifies it.
5. **Firebase Storage for photos** instead of embedding compressed
   base64 images in Firestore documents.

None of these are implemented yet — ask if you'd like help with any of
them next.
