# Vigilant Health Compass
https://canvas.wisc.edu/
A pet-health app for pet guardians and vets.

| Part | Stack |
|---|---|
| `frontend/` | React 19 + TypeScript (Vite), React Router, TanStack Query, React Hook Form + Zod, Tailwind CSS |
| `backend/` | Spring Boot 4 (Java 17), Spring Security (OAuth2 resource server), Spring Data JPA, Flyway |
| Database & auth | Supabase (Postgres + email/password Auth) |

The browser uses Supabase **only to sign in/up**. All data goes through the Spring Boot API, which verifies the
Supabase access token on every request. Flyway (in `backend/src/main/resources/db/migration`) owns the schema. Don't
create or edit tables in the Supabase dashboard; add a new `V<n>__description.sql` migration instead.

## What works today

- Sign up and sign in with email + password.
- After sign-up, onboarding asks **vet or pet guardian?**
  - **Pet guardian:** phone, pet name, species, breed, sex (plus spayed/neutered), age, weight, health history, vaccination history, allergies.
  - **Vet:** hospital/clinic name, address, email.
- Home page with Awareness, Health alert, Appointment and Affordability tiles; a Profile page from the navbar.
- **Affordability:** search real Wisconsin clinic prices (from `wi_vet_costs.json`) by dog/cat, procedure,
  price range and location. Click a clinic to pick services and get an estimated total; services the clinic hasn't
  posted a price for use the national (U.S.) average and are labeled as such.

## Running it locally

You'll run two processes side by side, the Spring Boot API on port 8080 and the React app on port 5173, both
connected to a hosted Supabase project.

### Prerequisites

| Tool | Version | Check with |
|---|---|---|
| Java (JDK) | 17 | `java -version` |
| Node.js | 20.19 or newer | `node -v` |
| Docker | any recent version, running (only needed for backend tests) | `docker info` |
| A Supabase account | free tier is fine | [supabase.com](https://supabase.com) |

You don't need to install Gradle. The backend ships with the Gradle wrapper (`./gradlew`).

### Step 1: Create and configure a Supabase project

1. In the [Supabase dashboard](https://supabase.com/dashboard), create a new project. Save the **database password**
   you choose, because you'll need it in Step 2.
2. Go to **Authentication → Sign In / Providers → Email**. Leave **Enable Email provider** on, and turn
   **Confirm email** **off**. This lets sign-up go straight to onboarding while developing. With it on, new users must
   click the link in the confirmation email and then sign in before they can create a profile.
3. Go to **Project Settings → JWT Keys** and check that the project uses the asymmetric **JWT signing keys** (new
   projects do by default). The API verifies login tokens against
   `https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`. Older projects that still use the legacy HS256
   JWT secret need to migrate to signing keys first, or every API call will return `401`.

You don't need to create any tables. The backend creates them when it first starts (Step 2).

### Step 2: Start the backend

```sh
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in the values:

| Variable | Where to find it |
|---|---|
| `SPRING_DATASOURCE_URL` | Click **Connect** at the top of the dashboard, pick the **Direct** (Connection string) tile, then choose **Session pooler** as the connection method. You'll see a URI like `postgresql://postgres.abcd1234:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres`. Keep only the host, port and database, and put `jdbc:` in front: `jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | The user part of that URI, e.g. `postgres.abcd1234` |
| `SPRING_DATASOURCE_PASSWORD` | The database password from Step 1. You can reset it under **Project Settings → Database** |
| `SUPABASE_URL` | The project URL, `https://<project-ref>.supabase.co` (no trailing slash) |
| `FRONTEND_ORIGIN` | Leave as `http://localhost:5173` |

> Use the **Session pooler** (port **5432**), not the Transaction pooler (port 6543). Flyway takes a lock while it
> migrates, and that doesn't work through the transaction pooler.

Then start the API:

```sh
./gradlew bootRun
```

The first run downloads dependencies, so it can take a minute. When it's ready you'll see
`Started CompassApplication`. At that point Flyway has created the `profiles`, `guardian_profiles`, `vet_profiles` and
`pets` tables in your Supabase database.

Check it's up (in a second terminal):

```sh
curl http://localhost:8080/actuator/health
# {"status":"UP"}
```

Leave this terminal running.

### Step 3: Start the frontend

In a new terminal:

```sh
cd frontend
cp .env.example .env
```

Open `frontend/.env` and fill in the values:

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | The same project URL as `SUPABASE_URL` above |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | **Project Settings → API Keys**: the **publishable** key (`sb_publishable_...`), or the legacy `anon` key. **Never** use the secret or service-role key here, because it ends up in the browser |
| `VITE_API_URL` | Leave as `http://localhost:8080` |

Then install and start:

```sh
npm install
npm run dev
```

Open **http://localhost:5173**.

If you change a `.env` file, restart the process that uses it (`npm run dev` or `./gradlew bootRun`) so the new values
are picked up.

### Step 4: Try it out

1. Click **Create an account**, then enter an email and a password of at least 8 characters.
2. Choose **Pet guardian** or **Veterinarian** and fill in the form.
3. Click **Finish**. You should land on the home page with a summary of your profile.
4. In the Supabase dashboard, open **Table Editor** to see your rows in `profiles` and in `guardian_profiles` + `pets`
   or `vet_profiles`.
5. Sign out, then sign in again. You should go straight to the home page.

### Running the tests

```sh
# from the repo root
(cd backend && ./gradlew test)                  # needs Docker running; uses a throwaway Postgres, not Supabase
(cd frontend && npm run build && npm run lint)  # type-check, build and lint
```

### Troubleshooting

| Symptom | Likely cause |
|---|---|
| The frontend shows a blank page, and the browser console says `Missing VITE_SUPABASE_URL...` | `frontend/.env` is missing or incomplete. Fill it in and restart `npm run dev` |
| "Couldn't reach the server. Is the API running?" | The backend isn't running, or `VITE_API_URL` is wrong |
| The browser console shows a **CORS** error | `FRONTEND_ORIGIN` in `backend/.env` doesn't exactly match the URL in your address bar (e.g. `127.0.0.1` vs `localhost`) |
| Every API call returns `401` | `SUPABASE_URL` is wrong or has a trailing slash, or the project still uses the legacy JWT secret (see Step 1.3) |
| Backend fails at startup with a connection or authentication error | Wrong database password or username (it must be `postgres.<project-ref>` for the pooler), or you used the transaction pooler (port 6543) |
| Sign-up shows "Check your email" | **Confirm email** is still on in Supabase (Step 1.2). Click the link in the email and then sign in, or turn the setting off |
| Sign-in says "Email not confirmed" | Same as above |
| `./gradlew test` fails with a Docker error | Docker Desktop isn't running |

## API

All endpoints need `Authorization: Bearer <Supabase access token>`.

| Method | Path | Result |
|---|---|---|
| `GET` | `/api/me` | The signed-in user's profile, or `404` if they haven't onboarded yet |
| `POST` | `/api/onboarding` | Creates the profile. Body has `"role": "GUARDIAN"` (with `phone`, `pet`) or `"role": "VET"` (with `clinicName`, `address`, `email`). `409` if already onboarded |
| `GET` | `/api/procedures` | Every standard procedure (dog and cat) with its average prices and how many clinics price it |
| `GET` | `/api/clinics?procedure=dog-rabies-1-year&minCost=&maxCost=&location=` | Clinics posting a price for `procedure` within the cost range, near `location` (ZIP, city, or `City, WI`), cheapest first. Each result includes only the matching prices |
| `GET` | `/api/clinics/{id}` | One clinic with every price it posted (both species), or `404` |
| `GET` | `/api/topics/{topicId}/hospitals?location=` | Wisconsin hospitals (CMS data) for a General → Awareness topic (e.g. `diabetes`), near `location` (ZIP, city, or `City, WI`), highest CMS star rating first. Mental wellness lists psychiatric hospitals first |
| `GET` | `/api/hospitals/{id}` | One hospital, or `404` |
| `GET` | `/api/topics/{topicId}/hospitals/{id}/comments` | The hospital's forum for that topic, newest first. Authors appear only as an anonymous nickname and role, plus age and sex from their Health Profile if they have one; `mine` marks your own |
| `POST` | `/api/topics/{topicId}/hospitals/{id}/comments` | Post `{"body": "..."}` (1–2000 characters) as your nickname, with role `PATIENT` |
| `PUT` | `/api/topics/{topicId}/hospitals/{id}/comments/{commentId}` | Edit your own post; sets `editedAt`. `403` if it isn't yours, `404` if it doesn't exist |
| `DELETE` | `/api/topics/{topicId}/hospitals/{id}/comments/{commentId}` | Delete your own post (`204`). `403` if it isn't yours, `404` if it doesn't exist |
| `GET` | `/api/community/me` | Your forum nickname and role |
| `GET` | `/api/health-profile` | Your General → Health Profile (age, sex, current conditions, vaccination and family history), or `404` if you haven't saved one |
| `PUT` | `/api/health-profile` | Create or replace it. `age`, `sex` (`FEMALE`, `MALE`, `INTERSEX`, `PREFER_NOT_TO_SAY`) and `currentConditions` are required. Age and sex are shown on your forum posts; the rest is private |

The old static landing page is at `frontend/public/landing.html`.

## Clinic price data

Clinic prices come from [`wi_vet_costs.json`](wi_vet_costs.json) (prices posted by Wisconsin clinics, plus
Wisconsin / U.S. averages per procedure). Migration `V6__load_wi_vet_costs.sql` is **generated** from it:

```sh
python3 scripts/wi_vet_costs_to_sql.py wi_vet_costs.json backend/src/main/resources/db/migration/V6__load_wi_vet_costs.sql
```

Flyway never re-runs a migration that has already been applied, so when the JSON is updated, generate a **new**
migration (e.g. `V7__reload_wi_vet_costs.sql`) that first deletes the old rows
(`delete from clinic_prices; delete from clinics; delete from procedures;`) instead of editing V6.

## Hospital data

The hospitals listed on General → Awareness topics are the 140 Wisconsin hospitals in the CMS
[Hospital General Information](https://data.cms.gov/provider-data/dataset/xubh-q36u) dataset, snapshotted in
[`data/wi_hospitals_cms.json`](data/wi_hospitals_cms.json). Migration `V11__load_cms_wi_hospitals.sql` is generated
from it:

```sh
python3 scripts/cms_hospitals_to_sql.py data/wi_hospitals_cms.json backend/src/main/resources/db/migration/V11__load_cms_wi_hospitals.sql
```

CMS has no specialty information, so every topic lists the same hospitals (each with its own forum per topic). To
refresh the data, write a new migration that upserts by `cms_facility_id`, so existing forum posts stay attached.
