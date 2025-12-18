# QA CHECKLIST (manual)

| Area | Buttons / Calls | Status | Notes |
| --- | --- | --- | --- |
| Super Admin APIs | System settings, branding, notification priorities, SMS quota, backups CRUD, analytics reports/dashboards, AI policies | NOT RUN | Requires seeded super admin user and PostgreSQL instance. |
| Organization Admin APIs | Organizations/users/licenses/edge servers CRUD and toggles | NOT RUN | API contract implemented; exercise with auth token after migration. |
| Edge Operations | Heartbeat/event ingest, restart/sync, log listing, AI policy fetch | NOT RUN | Needs live edge agent to post data and pull effective policy. |
| Analytics | Summary/time-series/by-location/by-module/compare/export/report/dashboards/widgets | NOT RUN | Populate events and call endpoints to validate charts/buttons. |
| AI Training | AI policy CRUD and training event attach | NOT RUN | Use super admin token to push policy; verify `ai-policies/effective`. |
| Web Portal | React views hitting updated endpoints | NOT RUN | Frontend build not executed in CI; run against running Laravel API to verify UI buttons. |

> Execute these checks after deploying migrations and configuring `.env` for PostgreSQL, mail, SMS, and FCM.
