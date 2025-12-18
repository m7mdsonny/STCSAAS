# aaPanel change checklist

Use aaPanel's **Files** tab to edit the following project files (default root: `/www/wwwroot/STCSAAS`).

- `apps/cloud-laravel/app/Http/Controllers/EdgeController.php`
  - aaPanel path: `/www/wwwroot/STCSAAS/apps/cloud-laravel/app/Http/Controllers/EdgeController.php`
  - Notes: Edge heartbeat now keeps the existing organization on updates, while still requiring it when registering a new edge.

After editing, save and (if applicable) redeploy/restart the relevant Laravel services via aaPanel.
