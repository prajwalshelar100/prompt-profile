# APK Generation Guide

To generate an installable APK for **Prompt Profile**, follow these steps on your local machine.

### 1. Install EAS CLI
Open your terminal and run:
```bash
npm install -g eas-cli
```

### 2. Login to Expo
Log in to your Expo account (create one at [expo.dev](https://expo.dev) if you haven't):
```bash
eas login
```

### 3. Start the Build
Run the following command to start the cloud build for the Android APK:
```bash
eas build -p android --profile preview
```

### 4. Download the APK
Once the build is complete (usually 5-10 minutes), EAS will provide:
- A link to the build page on the Expo dashboard.
- A direct download link in the terminal.
- A QR code to scan and download directly to your phone.

---

### Note on Configuration
I have already updated your `app.json` and `eas.json` with the necessary settings:
- **Package Name**: `com.prajwalshelar.promptprofile`
- **Build Type**: Configured for `apk` generation specifically in the `preview` profile.
