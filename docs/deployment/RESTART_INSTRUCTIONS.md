# 🔄 **Quick Restart Instructions**

## ✅ **Changes Applied**

1. ✅ Core.Api CORS updated to include `identity.asafarim.local:5177`
2. ✅ Shared-ui-react rebuilt with port 5102

## 🚀 **Action Required**

### **Step 1: Stop All Running Processes**

In your terminal where apps are running, press **Ctrl+C** to stop all processes.

### **Step 2: Restart Everything**

```bash
cd d:/repos/asafarim-dot-be
pnpm app:web
```

This will:

- Kill processes on ports 5101, 5177, 5102, 5174, 5175
- Rebuild shared-ui-react
- Start all APIs and frontend apps

### **Step 3: Clear Browser Cache**

**IMPORTANT**: Hard refresh your browser to load the new JavaScript:

- **Chrome/Edge**: Press `Ctrl + Shift + R` or `Ctrl + F5`
- **Firefox**: Press `Ctrl + Shift + R`
- **Alternative**: Open DevTools (F12) → Network tab → Check "Disable cache"

### **Step 4: Test Authentication**

1. Navigate to: `http://identity.asafarim.local:5177/login`
2. Enter credentials and login
3. **Expected Console Output**:

   ```
   ✅ authApiBase http://api.asafarim.local:5102
   ✅ Auth check response status: 200
   ✅ AUTHENTICATED
   ```

## 🔍 **Troubleshooting**

### Still seeing port 5101 in console?

- Clear browser cache with `Ctrl + Shift + R`
- Or clear Vite cache: Delete `node_modules/.vite` folders in each app

### Still getting CORS errors?

- Verify Core.Api restarted: Check terminal shows "Now listening on: http://[::]:5102"
- Check the Core.Api terminal for the request logs

### Still getting 401 Unauthorized?

- Check cookies in DevTools → Application → Cookies
- Should see `atk` and `rtk` for `.asafarim.local` domain
- If missing, login again at identity portal
