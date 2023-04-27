import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue,set} from 'firebase/database';
import { useState, useEffect } from 'react';

const firebaseConfig = {
  apiKey: "AIzaSyALgeoEXpEyYpKxSMdlgFuWjYutyBcVs00",
  authDomain: "rfiddatabase-925fe.firebaseapp.com",
  databaseURL: "https://rfiddatabase-925fe-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rfiddatabase-925fe",
  storageBucket: "rfiddatabase-925fe.appspot.com",
  messagingSenderId: "228694002634",
  appId: "1:228694002634:web:1ca2ddbb7054cb5f7ddd33",
  measurementId: "G-PV7LDNBHP9"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const NUM_RACERS = 40;

const randomName = () => {
  const names = [
    "Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi", "Ivan",
    "Jack", "Kate", "Liam", "Mia", "Nate", "Olivia", "Pablo", "Quinn", "Riley",
    "Sara", "Toby", "Una", "Violet", "William", "Xander", "Yara", "Zoe"
  ];
  
  return names[Math.floor(Math.random() * names.length)];
};

const addRacer = (id) => {
  const racer = {
    name: randomName(),
    checkpoint: Math.floor(Math.random() * 5) + 1,
    lap: Math.floor(Math.random() * 3) + 1,
    timestamp: Date.now()
  };

  set(ref(db, `racers/${id}`), racer);
};

for (let i = 0; i < NUM_RACERS; i++) {
  const id = Math.random().toString(36).substring(2, 15) +
             Math.random().toString(36).substring(2, 15);
  addRacer(id);
}

