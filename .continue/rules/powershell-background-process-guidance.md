---
description: Ensure CI/CD and local run instructions use Windows-friendly
  process control guidance.
alwaysApply: true
---

When suggesting background processes in PowerShell, use Start-Process, Start-Job, or appending &. Provide explicit commands to stop processes using Stop-Process -Id or Stop-Job -Id. Never suggest Ctrl+C.