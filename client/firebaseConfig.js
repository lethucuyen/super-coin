import firebase from "firebase/app";

// Initialize Firebase
var config = {
  apiKey: "AIzaSyCkXHF9KI76x-H2T8KWgBB9ko3_Y8NcQuo",
  authDomain: "personal-task-management-db7dc.firebaseapp.com",
  databaseURL:
    "https://personal-task-management-db7dc-default-rtdb.firebaseio.com",
  projectId: "personal-task-management-db7dc",
  storageBucket: "personal-task-management-db7dc.appspot.com",
  messagingSenderId: "869499037151",
  appId: "1:869499037151:web:51e5743a4ef18ed420906a",
  measurementId: "G-2JK0GP6JWP"
};

firebase.initializeApp(config);
