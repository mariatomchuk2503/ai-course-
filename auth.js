// =============================================================
//  РЕЄСТРАЦІЯ, ВХІД І ЗБЕРЕЖЕННЯ ПРОГРЕСУ (Firebase)
//  Цей файл змінювати не потрібно. Ключі — у firebase-config.js
// =============================================================

const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
const cfg = window.FIREBASE_CONFIG || {};
const configured = cfg.apiKey && !String(cfg.apiKey).includes("ВСТАВТЕ");

const ERRORS = {
  "auth/email-already-in-use": "Акаунт з таким email уже існує. Спробуйте увійти.",
  "auth/invalid-email": "Схоже, email введено з помилкою.",
  "auth/weak-password": "Пароль надто короткий: потрібно щонайменше 6 символів.",
  "auth/invalid-credential": "Неправильний email або пароль.",
  "auth/wrong-password": "Неправильний email або пароль.",
  "auth/user-not-found": "Акаунта з таким email не знайдено.",
  "auth/too-many-requests": "Забагато спроб. Зачекайте кілька хвилин і спробуйте знову.",
  "auth/network-request-failed": "Немає з'єднання з інтернетом.",
  "auth/unauthorized-domain": "Цей сайт ще не додано до дозволених у Firebase (див. README, крок 4).",
  "auth/operation-not-allowed": "Вхід за email не ввімкнено у Firebase (див. README, крок 2).",
  "permission-denied": "Немає доступу до бази даних. Перевірте правила Firestore (див. README, крок 3)."
};
const errorText = (err) => ERRORS[err && err.code] || "Щось пішло не так. Спробуйте ще раз.";

if (!configured) {
  window.Cloud = { enabled: false, errorText };
  window.App.setCloudStatus();
} else {
  start().catch((err) => {
    console.error("Firebase не завантажився:", err);
    window.Cloud = { enabled: false, errorText };
    window.App.setCloudStatus();
  });
}

async function start() {
  const { initializeApp } = await import(SDK + "firebase-app.js");
  const A = await import(SDK + "firebase-auth.js");
  const F = await import(SDK + "firebase-firestore.js");

  const app = initializeApp(cfg);
  const auth = A.getAuth(app);
  const db = F.getFirestore(app);

  let pendingProfile = null;   // ім'я і предмет з форми реєстрації
  let current = null;          // поточний користувач
  let canSave = false;         // зберігаємо лише після того, як прочитали хмару
  let timer = null;

  window.Cloud = {
    enabled: true,
    errorText,

    async register({ name, subject, email, password }) {
      pendingProfile = { name, subject };
      const cred = await A.createUserWithEmailAndPassword(auth, email, password);
      try { await A.updateProfile(cred.user, { displayName: name }); } catch (e) {}
    },
    login: (email, password) => A.signInWithEmailAndPassword(auth, email, password),
    logout: async () => { await flush(); return A.signOut(auth); },
    reset: (email) => A.sendPasswordResetEmail(auth, email),

    // Зберігаємо з невеликою затримкою, щоб не писати в базу на кожен клік
    save(state) {
      if (!current || !canSave) return;
      clearTimeout(timer);
      pending = state;
      timer = setTimeout(flush, 800);
    }
  };

  let pending = null;
  async function flush() {
    clearTimeout(timer);
    if (!pending || !current || !canSave) return;
    const data = { ...pending, email: current.email, updatedAt: F.serverTimestamp() };
    pending = null;
    try {
      await F.setDoc(F.doc(db, "users", current.uid), data);
    } catch (err) {
      console.error(err);
      window.App.saveError(errorText(err));
    }
  }
  window.addEventListener("beforeunload", flush);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });

  A.onAuthStateChanged(auth, async (u) => {
    current = u;
    canSave = false;
    if (!u) { window.App.onAuth(null); return; }

    const who = { uid: u.uid, email: u.email };
    try {
      const snap = await F.getDoc(F.doc(db, "users", u.uid));
      canSave = true;
      if (snap.exists()) {
        const data = snap.data();
        delete data.updatedAt;
        delete data.email;
        window.App.onAuth(who, data);
      } else {
        const profile = pendingProfile || { name: u.displayName || "" };
        window.App.onAuth(who, null, profile);   // створить запис у хмарі
      }
    } catch (err) {
      console.error(err);
      // Хмара недоступна: показуємо збережену копію, але нічого не перезаписуємо
      window.App.onAuth(who, window.App.cached(u.uid) || { name: u.displayName || "" });
      window.App.saveError("Не вдалося завантажити прогрес з хмари. " + errorText(err));
    }
    pendingProfile = null;
  });
}
