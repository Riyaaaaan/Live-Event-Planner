# Live Event Planner

Event management platform built with React and Firebase: create, manage, and register for events.

## Stack

- **React 18** + Vite
- **Tailwind CSS**
- **Firebase** (Auth, Firestore)
- **React Router v6**, **React Hook Form**, **Zod**, **date-fns**, **react-hot-toast**

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Firebase**

   - Create a project at [Firebase Console](https://console.firebase.google.com).
   - Enable **Authentication** (Email/Password and Google).
   - Create a **Firestore** database.
   - In Project settings → General → Your apps, add a web app and copy the config.

3. **Environment**

   Copy `.env.example` to `.env` and set:

   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

4. **Firestore rules**

   Deploy the rules in `firestore.rules` (e.g. `firebase deploy --only firestore:rules` if using Firebase CLI).

5. **Firestore index (optional)**

   For a large number of events, create a composite index in Firestore:  
   Collection `events`, fields `status` (Ascending), `visibility` (Ascending), `startDate` (Ascending).  
   The app also works without it by filtering in memory.

6. **Organizer role**

   New users get role `attendee`. To allow creating events, set a user’s `role` to `organizer` in Firestore:  
   `users/{userId}` → field `role` = `"organizer"`.

## Run

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Features

- **Auth**: Email/password and Google sign-in, sign up, password reset
- **Events**: List public events, event detail, register for events
- **Organizers**: Create event, edit event, dashboard of your events (requires `role: "organizer"` in Firestore)
- **UI**: Header, footer, responsive layout, toasts

## Project structure

- `src/components/` – common, auth, events
- `src/pages/` – Home, Events, EventDetail, CreateEvent, EditEvent, Dashboard, auth, NotFound
- `src/services/` – Firebase config, auth, events, registrations
- `src/hooks/` – useAuth, useEvents
- `src/utils/` – constants, formatters
