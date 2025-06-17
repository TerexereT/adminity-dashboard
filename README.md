
# Adminity - Admin Dashboard (Firebase Studio)

This is a Next.js starter application built with Firebase Studio, designed as an admin dashboard. It uses Next.js (App Router), React, ShadCN UI, Tailwind CSS, Genkit for AI functionalities, and Firebase Firestore for database operations.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn
*   A Firebase project. You can create one for free at [Firebase Console](https://console.firebase.google.com/).

### Environment Variables

Create a `.env.local` file in the root of your project and add the following environment variables. For local development, you can use the provided fallback values where applicable, but for production, **you must set a strong, unique `JWT_SECRET_KEY` and your Firebase project credentials**.

```env
# Example .env.local

# Security: Must be set for production and development for secure sessions
JWT_SECRET_KEY=your-super-secret-jwt-key-for-production

# Firebase Project Configuration: Required for Firestore integration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id # Optional

# Genkit AI: Required if using Google AI Studio or other specific model providers
# GOOGLE_API_KEY=your_google_ai_studio_api_key

# n8n Chat Widget: Required if using the n8n chat integration on the dashboard
NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL=your_n8n_chat_webhook_url
```

**Note on `JWT_SECRET_KEY`**: This key is crucial for securing user sessions. The application has a fallback default key for ease of local setup, but this **MUST** be overridden with a strong, unique secret in your `.env.local` file for any development or production deployment. You can generate a strong secret using a password manager or a command-line tool like `openssl rand -base64 32`.

**Firebase Setup**:
1.  Go to your Firebase project in the Firebase Console.
2.  Go to Project settings (gear icon) > General tab.
3.  Under "Your apps", click on the "Web" icon (`</>`) to add a web app if you haven't already.
4.  Register your app and Firebase will provide you with the `firebaseConfig` object. Copy these values into the corresponding `NEXT_PUBLIC_FIREBASE_...` variables in your `.env.local` file.
5.  Enable Firestore: In the Firebase Console, go to "Firestore Database" under the "Build" section in the left sidebar. Click "Create database", choose "Start in production mode" or "Start in test mode" (for test mode, make sure to secure your rules before production: `allow read, write: if false;`). Select a Cloud Firestore location.

## Development

To get the development environment running:

1.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

2.  **Run the Next.js development server:**
    This will start the main application.
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:9002`.

3.  **Run the Genkit development server (optional, if using AI features):**
    Genkit flows run in a separate development server. If your application uses AI features powered by Genkit, you'll need to run this in a separate terminal.
    ```bash
    npm run genkit:dev
    ```
    Or, to watch for changes in your Genkit flow files:
    ```bash
    npm run genkit:watch
    ```
    The Genkit server typically starts on `http://localhost:3400` and provides a UI for inspecting flows.

## Production Build

To create a production-ready build of your application:

1.  **Build the application:**
    ```bash
    npm run build
    ```
    This command compiles your Next.js application and prepares it for deployment.

2.  **Start the application in production mode:**
    After a successful build, you can start the application using:
    ```bash
    npm run start
    ```
    This will serve the optimized production build, typically on `http://localhost:3000` (or the port specified in your Next.js config or environment).

## Deployment

This project is configured for deployment with **Firebase App Hosting**.

### Firebase App Hosting

Firebase App Hosting will automatically use the `apphosting.yaml` file and the scripts defined in your `package.json` (`build` and `start`) to deploy your application.

1.  **Set up Firebase:**
    *   Ensure you have the Firebase CLI installed and configured.
    *   Create a Firebase project or use an existing one.
    *   Initialize Firebase App Hosting in your project if you haven't already.

2.  **Deploy:**
    *   Deploy your application using the Firebase CLI:
        ```bash
        firebase deploy --only apphosting
        ```

3.  **Environment Variables in Firebase App Hosting:**
    *   You **MUST** configure your `JWT_SECRET_KEY` and all `NEXT_PUBLIC_FIREBASE_...` variables (and any other necessary API keys like `GOOGLE_API_KEY` or `NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL`) as secrets in your Firebase App Hosting backend. Do not commit your production secrets directly into your codebase. Refer to the Firebase App Hosting documentation on how to manage secrets.

For more detailed instructions on deploying to Firebase App Hosting, please refer to the [official Firebase App Hosting documentation](https://firebase.google.com/docs/app-hosting).

### Other Platforms

While configured for Firebase App Hosting, this Next.js application can be deployed to other platforms that support Node.js and Next.js applications (e.g., Vercel, Netlify, AWS Amplify, self-hosted servers). You would typically use the `npm run build` and `npm run start` commands. Ensure you configure environment variables appropriately on your chosen platform.
