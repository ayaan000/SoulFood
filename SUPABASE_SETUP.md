# Supabase Setup Guide

Follow these steps to connect your Soul Food app to a Supabase backend.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (free tier available)
3. Verify your email address

## Step 2: Create a New Project

1. Click "New Project"
2. Fill in project details:
   - **Name**: Soul Food
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose the closest region to Toronto (e.g., US East)
3. Click "Create new project" (takes ~2 minutes to provision)

## Step 3: Get Your API Credentials

1. Go to **Settings** → **API** in the left sidebar
2. Find these values:
   - **Project URL** (under "Configuration")
   - **anon public** key (under "Project API keys")

## Step 4: Configure Environment Variables

1. Create a file named `.env.local` in your project root
2. Add the following (replace with your actual values):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**DO NOT** commit this file to git (it's already in `.gitignore`)

## Step 5: Set Up Database Schema

1. In Supabase, go to **SQL Editor** in the left sidebar
2. Click "New query"
3. Copy and paste the SQL from `SUPABASE_SCHEMA.sql` (created in project root)
4. Click "Run" to execute the SQL

This will create the necessary tables for users, merchants, restaurants, menu items, and orders.

## Step 6: Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled (should be by default)
3. (Optional) Configure email templates under **Authentication** → **Email Templates**

## Step 7: Set Row Level Security (RLS) Policies

The SQL schema includes basic RLS policies, but you may want to review them:

1. Go to **Authentication** → **Policies**
2. Review the policies for each table
3. Adjust as needed for your security requirements

## Step 8: Restart Your Dev Server

1. Stop the running `npm run dev` (Ctrl+C)
2. Run `npm run dev` again to load the environment variables
3. The app should now connect to Supabase!

## Testing Authentication

1. Open http://localhost:5173
2. Click "Sign In" in the header
3. Try creating a new account
4. Check Supabase Authentication → Users to see the new user

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file
- Ensure you're using the **anon** key, not the service role key
- Restart the dev server after changing `.env.local`

### Users created but can't see profile
- Make sure the SQL schema was executed successfully
- Check Supabase Table Editor to verify tables exist
- Check browser console for errors
