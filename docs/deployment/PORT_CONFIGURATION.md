# ASafariM Port Configuration

This document serves as the central reference for all port configurations across the ASafariM project.

## Backend API Ports

| API Service   | Development Port | Production Port |
|---------------|------------------|----------------|
| Identity.Api  | 5101             | 5101           |
| Core.Api      | 5102             | 5102           |
| Ai.Api        | 5103             | 5103           |

## Frontend Development Ports

| Frontend App     | Development Port |
|------------------|------------------|
| identity-portal  | 5177             |
| core-app         | 5174             |
| ai-ui            | 5173             |
| web              | 5175             |
| blog             | 3000             |
| jobs-ui          | 4200             |

## Nginx Configuration

All APIs are exposed through nginx with the following routes:

| API Route         | Internal Endpoint        |
|-------------------|--------------------------|
| /api/identity/    | http://127.0.0.1:5101/   |
| /api/core/        | http://127.0.0.1:5102/   |
| /api/ai/          | http://127.0.0.1:5103/   |

## Systemd Service Configuration

| Service Name       | Listening On             |
|--------------------|--------------------------| 
| dotnet-identity    | http://127.0.0.1:5101    |
| dotnet-core        | http://127.0.0.1:5102    |
| dotnet-ai          | http://127.0.0.1:5103    |

## Important Notes

1. **Never change these port numbers** without updating all related configurations.
2. If you need to stop a service to free up a port, use: `sudo systemctl stop dotnet-[service-name]`
3. After making configuration changes, reload nginx with: `sudo systemctl reload nginx`
4. Always restart services after configuration changes: `sudo systemctl restart dotnet-[service-name]`

## Configuration Files Reference

- API launch settings: `/var/repos/asafarim-dot-be/apis/*/Properties/launchSettings.json`
- Frontend environment: `/var/repos/asafarim-dot-be/apps/*/.env`
- Nginx API routes: `/etc/nginx/snippets/asafarim/api-routes.conf`
- Systemd services: `/etc/systemd/system/dotnet-*.service`
