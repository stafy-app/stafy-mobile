// src/services/firebase.ts

import {initializeApp, getApps, getApp} from 'firebase/app';
import {initializeAuth, getAuth, Auth} from 'firebase/auth';
// @ts-expect-error — getReactNativePersistence exists in @firebase/auth's RN
// build at runtime, but the aggregated public .d.ts that `firebase/auth`
// re-exports from doesn't declare it (known firebase-js-sdk typing gap).
import {getReactNativePersistence} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';

// Values below come from google-services.json (Android app registration for the
// stafy-app Firebase project). No dedicated Web app has been registered in the
// Firebase console yet — apiKey/authDomain/projectId are enough for Auth-only
// usage (appId is optional and only needed for Analytics/other services), so
// this works for now. Register a Web app and swap `apiKey`/add `appId` if that
// changes.
const firebaseConfig = {
    apiKey: 'AIzaSyATEES9u4mWe9FEGj2JdqcgZLeJsbKNDrQ',
    authDomain: 'stafy-app.firebaseapp.com',
    projectId: 'stafy-app',
    storageBucket: 'stafy-app.firebasestorage.app',
    messagingSenderId: '742729409312',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Web persists sessions via the browser (localStorage) by default through getAuth.
// Native needs to be told explicitly to persist through AsyncStorage, otherwise
// the session is memory-only and is lost on every cold start.
export const auth: Auth = Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, {persistence: getReactNativePersistence(AsyncStorage)});
