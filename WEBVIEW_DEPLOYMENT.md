# Frontend Deployment Guide for WebView Architecture

This guide explains how to deploy your frontend to Render and configure the APK to load from the live URL.

## Step 1: Deploy Frontend to Render

### Option A: Using Render Dashboard (Recommended)

1. **Log in to Render**: Visit [dashboard.render.com](https://dashboard.render.com)
2. **Create New Static Site**:
   - Click **New +** → **Static Site**
   - Connect your GitHub repository
   - Configure:
     - **Name**: `sri-vari-co-frontend`
     - **Branch**: `main` (or your default branch)
     - **Root Directory**: Leave blank
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Publish Directory**: `frontend/dist`
3. **Add Custom Headers** (in Settings → Headers):
   - Path: `/*`
   - Header: `Cache-Control`
   - Value: `no-cache, no-store, must-revalidate`
4. **Deploy**: Click **Create Static Site**

### Option B: Using Blueprint (render-frontend.yaml)

If you prefer infrastructure-as-code:
1. The `render-frontend.yaml` file is already created in your project root
2. In Render Dashboard, click **New +** → **Blueprint**
3. Select your repository and choose `render-frontend.yaml`
4. Click **Apply**

### Get Your Production URL

After deployment completes, your frontend will be available at:
```
https://sri-vari-co-frontend.onrender.com
```

**Test it in your browser before proceeding!**

---

## Step 2: Update Capacitor Configuration

Once your frontend is deployed and you have confirmed it works, update the Capacitor config:

### Edit `mobile/capacitor.config.json`:

```json
{
    "appId": "com.srivariandco.management",
    "appName": "Sri Vari & Co",
    "webDir": "www",
    "server": {
        "url": "https://sri-vari-co-frontend.onrender.com",
        "cleartext": false,
        "androidScheme": "https"
    }
}
```

**Replace the URL with your actual Render URL!**

---

## Step 3: Sync Capacitor and Build APK

```powershell
# Navigate to mobile directory
cd "f:\Sri Vari & Co\Software\mobile"

# Sync Capacitor (picks up new server.url configuration)
npx cap sync android

# Navigate to android directory
cd android

# Clean previous builds
.\gradlew clean

# Build release APK
.\gradlew assembleRelease

# Move APK to root directory
Move-Item -Force "app\build\outputs\apk\release\app-release.apk" "f:\Sri Vari & Co\Software\Sri Vari & Co.apk"
```

---

## Step 4: Test the WebView APK

1. **Install APK** on your Android device
2. **Open the app** - it should load from the live URL
3. **Verify functionality**:
   - Login works
   - Inventory page loads
   - Analytics displays correctly
   - All navigation works

---

## Step 5: Test Instant Updates

Now test that updates work without rebuilding the APK:

1. **Make a small frontend change** (e.g., change button text in Dashboard)
2. **Commit and push to GitHub**:
   ```bash
   git add .
   git commit -m "test: verify instant updates"
   git push
   ```
3. **Wait for Render to deploy** (~2-3 minutes)
4. **Force close and reopen the app** on your device
5. **Verify the change is visible** immediately!

✅ **Success!** Future updates only require: edit code → git push → users refresh app

---

## Troubleshooting

### If app shows "Cannot connect":
- Verify your Render frontend URL is accessible in a browser
- Check that you updated `capacitor.config.json` with the correct URL
- Ensure you ran `npx cap sync android` after changing the config

### If app shows old content:
- WebView cache should be cleared automatically
- Try: Settings → Apps → Sri Vari & Co → Storage → Clear Cache
- Verify Render deployed successfully (check Render logs)

### If you need to revert:
Remove the `server.url` from `capacitor.config.json` and rebuild with local assets.

---

## Summary

**Current State**:
- ✅ MainActivity.java configured for cache control
- ✅ render-frontend.yaml created for deployment
- ⏳ **You need to deploy frontend and update capacitor.config.json**

**After deployment**:
- APK loads from live URL
- Updates deploy instantly  
- No more APK rebuilds needed!
