# ✅ End-to-End Readiness Checklist

This checklist verifies that the SaaS cloud (Laravel + البوابة المدمجة), local edge, and mobile app are fully wired together with demo data, notifications, and offline tolerance.

## 1) Cloud SaaS (VPS)
- [ ] Import the ready database: `psql "$CLOUD_DATABASE_URL" -f apps/cloud-laravel/database/schema.sql`.
- [ ] Install deps then run `composer install --no-dev --optimize-autoloader && npm install && npm run build && php artisan key:generate` inside `apps/cloud-laravel`.
- [ ] Start Laravel (PHP-FPM/Nginx or `php artisan serve`) and confirm `/api/health` plus `POST /api/license/validate` respond using `DEMO-LICENSE-KEY`.
- [ ] Verify demo credentials in the bundled web UI (`admin@example.com` / `admin`) and that cameras, automation rules, and alerts render from the seeded data.
- [ ] Configure Firebase keys under **Settings** أو مباشرة في `.env` لتفعيل push notifications.

## 2) Edge Server (.exe or Python)
- [ ] Copy `.env.example` to `.env`, set `CLOUD_API_URL`, `CLOUD_API_KEY`, and `LICENSE_KEY=DEMO-LICENSE-KEY`.
- [ ] For Python: `python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8080`.
- [ ] For the packaged installer: run `apps/edge-server/scripts/build_installer.sh` then execute the generated `.exe` and complete the setup form (cloud URL + license).
- [ ] Confirm the edge registers on the cloud and sends heartbeats; verify metadata sync for events, alerts, and attendance while media stays local.
- [ ] Disconnect the network, run AI modules locally, and ensure they continue working within the 14-day grace period; reconnect and confirm sync queue flushes.

## 3) Mobile App (Flutter)
- [ ] Update `apps/mobile-app/lib/config.dart` (or the equivalent env file) with the cloud API base URL and Firebase project keys.
- [ ] Run `flutter pub get && flutter run` against the staging cloud; sign in with the demo user and verify live alerts/attendance listings.
- [ ] Trigger a test push notification via the cloud (Firebase server key required) and confirm delivery on device.

## 4) Integrations & Automations
- [ ] Validate Modbus/Arduino/GPIO actions from the cloud command queue to the edge (`edge_commands` table) and confirm acknowledgments.
- [ ] Ensure automation rules (e.g., gate auto-open) fire based on demo data and are reflected in alert/event metadata.

## 5) Observability & Logs
- [ ] Review edge logs under `LOG_DIR` and cloud logs (PHP-FPM/Nginx) for errors.
- [ ] Confirm `notifications` table records sent channels (email/SMS/push) and that SMTP/WhatsApp/SMS gateways are configured.

## 6) Release Packaging
- [ ] Generate the latest archive: `./scripts/package.sh` (outputs `dist/latest.zip`).
- [ ] Ensure the SQL dump, docs, and installers are included in the archive for easy distribution.

Once all boxes are checked, the stack is ready for client delivery with SaaS-grade onboarding and offline-capable edges.
