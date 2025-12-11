# Quickstart: First Setup

## Prerequisites

- Fresh database (or clear existing `User` and `SystemConfig` tables).
- Application running (`npm run dev`).

## Running the Setup

1. **Navigate to App**: Open `http://localhost:5173` (or your configured port).
2. **Auto-Redirect**: You should be automatically redirected to `/setup`.
3. **Fill Form**:
    - **Site Name**: "My Awesome LMS"
    - **Admin Name**: "System Admin"
    - **Email**: "admin@example.com"
    - **Password**: "securePassword123!"
4. **Submit**: Click "Complete Setup".
5. **Verification**:
    - You should be redirected to the Dashboard.
    - You should be logged in.
    - The site title should reflect "My Awesome LMS".

## Resetting for Testing

To run the setup again:

1. **Clear Database**:
   ```bash
   npx prisma migrate reset
   ```
   (Or manually delete rows from `User`, `Session`, `Account`, `SystemConfig`)

2. **Restart Server**: (Optional, but good to clear any in-memory cache if implemented).
