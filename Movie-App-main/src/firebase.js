import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSyBz_pEDNqjMSZSUdawGh-Aly0pqRvNP5Io",
  authDomain: "cine-review-2772d.firebaseapp.com",
  projectId: "cine-review-2772d",
  storageBucket: "cine-review-2772d.firebasestorage.app",
  messagingSenderId: "974301983024",
  appId: "1:974301983024:web:26c56a293fa8d9d02998f5",
  measurementId: "G-LBN6PKTKRR"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
