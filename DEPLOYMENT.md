# Deployment Guide: Sri Vari & Co Backend

This guide explains how to deploy your backend to **Render** using the provided `render.yaml` blueprint.

## 1. Push Code to GitHub / GitLab

Render works best when connected to a Git repository.

```bash
# Initialize git if not already done
git init

# Add all files (respecting .gitignore)
git add .

# Commit changes
git commit -m "chore: prepare for render deployment"

# Create a new repository on GitHub, then link it
# git remote add origin https://github.com/yourusername/sri-vari-and-co.git
# git branch -M main
# git push -u origin main
```

## 2. Connect to Render

1.  Log in to the [Render Dashboard](https://dashboard.render.com).
2.  Click **New +** > **Blueprint**.
3.  Connect your GitHub/GitLab account if you haven't already.
4.  Select the repository you just pushed.

## 3. Deployment Configuration

Render will automatically detect the `render.yaml` file. 

1.  **Service Name**: `sri-vari-backend` (pre-filled).
2.  **Plan**: `Free`.
3.  Click **Apply**.

## 4. Set Environment Variables

Once the service is created, you **MUST** provide the secure secrets that were not included in the blueprint for security:

1.  Navigate to your service in the Render dashboard.
2.  Go to the **Environment** tab.
3.  Add the following variables:
    *   `MONGODB_URI`: Your full MongoDB connection string.
    *   `JWT_SECRET`: A secure random string for signing tokens.

## 5. Verify Deployment

-   Watch the **Logs** tab in Render.
-   Once you see `🚀 Server running on port 5000` and `✅ MongoDB Connected`, your API is live!
-   Your backend URL will be something like `https://sri-vari-backend.onrender.com`.

---

> [!IMPORTANT]
> **Mobile App API Update**: If your backend URL changes, remember to update the `PRODUCTION_API_URL` in `frontend/src/services/api.jsx` and rebuild your mobile app APK.
