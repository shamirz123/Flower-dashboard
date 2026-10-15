# Stemwise: flower usage dashboard

Next.js 16 + Supabase (Postgres + Auth) + Tailwind + Recharts.

Light, dark and system themes plus four accent colors (emerald, rose, blue, violet). Use the palette button in the top bar; the choice is remembered in the browser.

Anyone can sign up (email + password, or Google) and gets their own private dashboard. Row Level Security in the database makes sure each user only sees their own data.

## What it tracks

One row per flower per box, same as the Excel sheet:

`Date | Flower Name | Box Size | Current Recipe | Actual Usage | Variance | Reason | Action | Status | Comment`

Variance (actual minus recipe) is calculated by the database. Rows with no actual usage yet stay `Pending` and are left out of the variance charts until you fill them in.

## Setup

1. Create a project at supabase.com.
2. **SQL Editor**: run `supabase/schema.sql`. (If you ran an older version of this file before, run `supabase/reset.sql` first. It deletes the old tables.)
3. Copy `.env.example` to `.env.local` and fill in **Project Settings > API**: the project URL and the anon/publishable key. Never use the `service_role` key here.
4. `npm install`, then `npm run dev`, then open http://localhost:3000 and create an account.

### Auth settings (Supabase > Authentication)

- **URL Configuration**
  - Site URL: `http://localhost:3000` while testing, your Vercel URL in production.
  - Redirect URLs: add `http://localhost:3000/auth/callback` and `https://YOUR-APP.vercel.app/auth/callback`.
- **Sign In / Providers > Email**: "Confirm email" is on by default. New users must click the link in their email before signing in. Turn it off if you do not want that.

### Google sign-in

1. Google Cloud Console > create a project > **APIs & Services > OAuth consent screen** (External), fill in app name and your email.
2. **Credentials > Create credentials > OAuth client ID > Web application**.
   - Authorized redirect URI: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback` (shown in Supabase under Providers > Google).
3. Copy the **Client ID** and **Client secret** into Supabase > **Authentication > Sign In / Providers > Google**, enable it, save.

## Deploy on Vercel

Import the repo, add the same two environment variables, deploy, then add the Vercel URL to Supabase's Site URL and Redirect URLs (see above). Pages are rendered per request from Supabase. Vercel's Hobby plan is for non-commercial use; use Pro for a business.

## Pages

| Page | What |
|---|---|
| Overview | KPIs, variance by flower, variance over time, boxes ranking, reasons |
| Usage entries | table with filters; add, edit, delete, mark complete |
| Import from sheet | paste rows copied from Google Sheets (or upload a CSV) |

Dates are read as `dd-mm-yyyy`. Invalid dates (like `20-08-0206`) are imported without a date.
