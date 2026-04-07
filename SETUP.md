# RoboSoccer Tournament Manager — Tectonics

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure .env**
   ```
   DATABASE_URL="file:./dev.db"
   GMAIL_USER="your-gmail@gmail.com"
   GMAIL_PASS="your-app-password"   # Gmail App Password (not your real password)
   ADMIN_PASSWORD="tectonics2025"
   ```
   > For Gmail App Password: Google Account → Security → 2FA → App Passwords

3. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

4. **Start the dev server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard — overview stats and recent results |
| `/attendance` | Mark teams present/absent, import CSV |
| `/matches` | Create matches, enter scores |
| `/results` | All results grouped by round |
| `/bracket` | Semifinals & Final visual bracket |
| `/admin` | Password-protected admin controls |

## CSV Import Format (Zoho Backstage)

Columns auto-detected. Expects at minimum:
- `Team Name` (or `Team`, `name`)
- `Email` (or `Gmail`, `email`)
- `College Name` (or `College`, `Institution`)
- Any column with "member", "participant", or "player" in the name → treated as member

## Tournament Flow

1. Import teams from CSV on `/attendance`
2. Mark present teams on event day
3. Create Round 1 matches on `/matches`
4. Enter scores → winner auto-detected, email sent
5. For Round 2+, use **AUTO-GENERATE** button to pair previous round's winners
6. Bracket appears on `/bracket` once 4 teams remain
7. Admin can export results or reset via `/admin`
