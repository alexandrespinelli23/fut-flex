
const firebaseConfig = {
  apiKey: "AIzaSyAIg1_grAvklU7ZiGdmyvwCoPDDtVc1ndY",
  authDomain: "futflex-a4563.firebaseapp.com",
  projectId: "futflex-a4563",
  storageBucket: "futflex-a4563.firebasestorage.app",
  messagingSenderId: "438883217232",
  appId: "1:438883217232:web:a3e2b61e4684ae6fea4655",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

function mapAuthError(code) {
  const map = {
    "auth/email-already-in-use": "Esse e-mail já está cadastrado.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/user-not-found": "E-mail ou senha inválidos.",
    "auth/wrong-password": "E-mail ou senha inválidos.",
    "auth/invalid-credential": "E-mail ou senha inválidos.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente de novo.",
  };
  return map[code] || "Ocorreu um erro. Tente novamente.";
}

document.addEventListener("DOMContentLoaded", () => {
  const accountLink = document.getElementById("account-link");
  if (!accountLink) return;
  auth.onAuthStateChanged((user) => {
    if (user) {
      accountLink.title = "Sair (" + user.email + ")";
      accountLink.href = "#";
      accountLink.onclick = (e) => {
        e.preventDefault();
        auth.signOut().then(() => location.href = "index.html");
      };
    } else {
      accountLink.title = "Entrar";
      accountLink.href = "login.html";
      accountLink.onclick = null;
    }
  });
});
