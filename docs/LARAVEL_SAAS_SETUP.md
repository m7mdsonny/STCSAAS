# Laravel SaaS + Edge EXE + Flutter – Setup Guide

This guide rebuilds the stack as a single Laravel SaaS (backend + web), an executable Edge service, and the Flutter mobile app. All features stay intact: licensing with 14-day grace, event metadata sync, notifications, and remote control.

## VPS (Laravel SaaS)
1. Install dependencies: `apt update && apt install -y php8.2 php8.2-fpm php8.2-pgsql nginx nodejs npm composer postgresql`.
2. Pull the repo and go to `apps/cloud-laravel`.
3. Copy env: `cp .env.example .env` then set DB creds, mail, FCM key.
4. Install: `composer install --no-dev && npm install && npm run build`.
5. Import demo DB: `psql -U <user> -d <db> -f database/schema.sql`.
6. Run: `php artisan key:generate && php artisan migrate --seed` (migrations optional if you used schema.sql) then serve via Nginx+PHP-FPM.

## Edge EXE (local)
1. Go to `apps/edge-server`.
2. Configure `.env` with `CLOUD_API_URL`, `LICENSE_KEY`, and camera/integration settings.
3. Build executable: `./scripts/build_installer.sh` (PyInstaller) → output under `dist/` as `.exe` (on Windows build host) or `.bin` (Linux).
4. Install on-site, run the service; it validates the license against the Laravel API, caches locally, and keeps AI modules running offline within the grace window.

## Flutter mobile app
1. Go to `apps/mobile-app`.
2. Update `lib/config.dart` to point to the Laravel API base URL and Firebase keys.
3. Install deps: `flutter pub get`.
4. Run: `flutter run` or build: `flutter build apk`.

## Data flow
- Edge posts metadata events to `POST /api/edges/events` and heartbeats to `/api/edges/heartbeat` (Laravel).
- Laravel stores users/distributors/orgs/licenses in PostgreSQL using `database/schema.sql` seed.
- Notifications (email/SMS/push) flow through Laravel; mobile/web subscribe via Sanctum tokens.

## Validation checklist
- Laravel API responds to `/api/auth/login` and returns a Sanctum token.
- License validation honors `LICENSE_GRACE_DAYS` and blocks after expiry+grace.
- Edge heartbeat updates `edge_servers.online` and `last_seen_at`.
- Events insert rows with JSONB `meta` without media blobs.
- Notifications endpoint returns the seeded push message.
