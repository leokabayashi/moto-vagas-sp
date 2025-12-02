---
description: Deploy to Firebase Hosting
---

# Deploy to Firebase Hosting

This workflow guides you through deploying the Moto Vagas SP app to Firebase Hosting.

## Prerequisites

1.  **Google Account**: You need a Google account to use Firebase.
2.  **Node.js & npm**: Ensure Node.js is installed.

## Steps

1.  **Install Firebase CLI**
    If you haven't already, install the Firebase CLI globally:
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login to Firebase**
    Log in to your Google account:
    ```bash
    firebase login
    ```

3.  **Initialize Project (First Time Only)**
    If you haven't created a Firebase project yet, go to [console.firebase.google.com](https://console.firebase.google.com/) and create a new project (e.g., `moto-vagas-sp`).

    Then, inside the `motorcycle-parking-sp` directory, run:
    ```bash
    firebase init hosting
    ```
    - Select **"Use an existing project"** and choose the project you just created.
    - **Public directory**: `.` (current directory)
    - **Configure as a single-page app**: `No` (or `Yes`, doesn't matter much for this simple app, but `No` is safer if we had multiple HTML files).
    - **Set up automatic builds and deploys with GitHub**: `No` (unless you want to).
    - **File overwrites**: Say `No` if it asks to overwrite `index.html`.

4.  **Deploy**
    Run the deployment command:
    ```bash
    firebase deploy
    ```

5.  **View App**
    The CLI will output a **Hosting URL** (e.g., `https://moto-vagas-sp.web.app`). Open this URL to see your live app!

## Troubleshooting

### npm error code E401 (Incorrect or missing password)
If you see an error like `gpkg: failed to get OAuth2 token`, it means your internal authentication has expired.
1.  Run `gcert` in your terminal to refresh your credentials.
2.  Try running the install command again.

### Alternative: Standalone Binary
If npm continues to fail, you can install the Firebase CLI without npm:
```bash
curl -sL https://firebase.tools | bash
```
