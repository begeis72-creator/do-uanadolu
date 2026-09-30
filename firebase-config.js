// ===== FIREBASE AYARLARI =====
// 1) console.firebase.google.com → Proje oluştur → "Web uygulaması ekle (</>)"
// 2) Çıkan firebaseConfig değerlerini aşağıya yapıştır.
// 3) Build → Firestore Database → "Create database" (production modunda başlat).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "BURAYA_API_KEY",
  authDomain: "PROJE-ADI.firebaseapp.com",
  projectId: "PROJE-ADI",
  storageBucket: "PROJE-ADI.appspot.com",
  messagingSenderId: "000000000000",
  appId: "BURAYA_APP_ID"
};

// Ayarlar girilmediyse site örnek verilerle çalışır, hata vermez.
export const yapilandirildi = !firebaseConfig.apiKey.startsWith("BURAYA");
export const db = yapilandirildi ? getFirestore(initializeApp(firebaseConfig)) : null;
