
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// This function will be called to construct the config when needed.
const getFirebaseConfig = (): FirebaseOptions => {
  // Reads process.env at the time of calling
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
  };
};

let app;
let db;

// Initialize Firebase
if (!getApps().length) {
  const firebaseConfig = getFirebaseConfig(); // Construct config just-in-time

  // Define which keys in FirebaseOptions (derived from NEXT_PUBLIC_ env vars) are essential
  const requiredConfigKeys: (keyof FirebaseOptions)[] = [
    'apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'
  ];
  const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

  if (missingKeys.length > 0 || !firebaseConfig.projectId) {
    // This detailed error message will log if essential parts of the config are missing or projectId is undefined.
    const errorMessage = `ERROR: Firebase config is missing essential keys or projectId is undefined. 
    Missing keys from config object: ${missingKeys.join(', ') || 'None'}. 
    Current projectId in config: ${firebaseConfig.projectId}. 
    Full config object passed to initializeApp: ${JSON.stringify(firebaseConfig)}`;
    console.error(errorMessage);
    // This error means the app will likely not function correctly with Firebase.
  }
  
  // Log the config that will be used, regardless of errors, for clear diagnostics
  // This log is crucial for you to check in the browser console.
  console.log('Adminity: Firebase config to be used for initialization:', firebaseConfig); 
  
  try {
    app = initializeApp(firebaseConfig);
  } catch (initError) {
    console.error("FATAL: Firebase initializeApp failed. This usually means the config object is critically malformed (e.g., projectId is not a string, or other type mismatches). Error:", initError);
    console.error("FATAL: Config used:", firebaseConfig);
    // If initializeApp itself throws, the app is in a bad state.
    // We'll let `getFirestore` below potentially fail too if `app` is undefined.
  }
  
} else {
  app = getApp();
}

// Get Firestore instance
// It's possible `app` could be undefined if initializeApp failed catastrophically.
// getFirestore will throw if app is not initialized.
try {
  db = getFirestore(app);
} catch (firestoreError) {
   console.error("FATAL: Could not get Firestore instance. This likely means Firebase app initialization failed earlier. Error:", firestoreError);
   // db will remain undefined, and subsequent Firestore operations will fail.
}


export { app, db };
