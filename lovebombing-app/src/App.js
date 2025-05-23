// LoveBombingApp: Minimal React + Firebase app for private love notes between two people

import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQ-KdhQ99Flr4jqS-r7wu6QaI9hHwWwdE",
  authDomain: "lovebomb-e3805.firebaseapp.com",
  projectId: "lovebomb-e3805",
  storageBucket: "lovebomb-e3805.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function LoveBombingApp() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
          const notesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setNotes(notesData);
        });
      }
    });
    return () => unsub();
  }, []);

  const signIn = () => signInWithEmailAndPassword(auth, email, password);
  const signUp = () => createUserWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);
  const sendNote = async () => {
    if (note.trim()) {
      await addDoc(collection(db, "notes"), {
        content: note,
        sender: user.email,
        createdAt: new Date(),
      });
      setNote("");
    }
  };

  if (!user) {
    return (
      <div className="p-6 max-w-sm mx-auto">
        <h1 className="text-2xl font-bold mb-4">LoveBombing 💌</h1>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <button
          onClick={signIn}
          className="bg-blue-500 text-white px-4 py-2 mr-2"
        >
          Sign In
        </button>
        <button onClick={signUp} className="bg-green-500 text-white px-4 py-2">
          Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Welcome 💕 {user.email}</h1>
        <button onClick={logout} className="text-red-500">
          Log Out
        </button>
      </div>
      <div className="mb-4">
        <textarea
          placeholder="Write your love note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="border p-2 w-full h-24"
        />
        <button
          onClick={sendNote}
          className="mt-2 bg-pink-500 text-white px-4 py-2"
        >
          Send 💌
        </button>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Notes</h2>
        {notes.map((n) => (
          <div key={n.id} className="mb-2 p-3 bg-pink-100 rounded">
            <p className="font-medium">{n.sender}</p>
            <p>{n.content}</p>
            <p className="text-sm text-gray-600">
              {new Date(n.createdAt.seconds * 1000).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
