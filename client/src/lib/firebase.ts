import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, Unsubscribe } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDOm7nCwYcll60pvB3mdCdkjv8OVXkuWD4",
  authDomain: "support-cc19b.firebaseapp.com",
  databaseURL: "https://support-cc19b.firebaseio.com",
  projectId: "support-cc19b",
  storageBucket: "support-cc19b.firebasestorage.app",
  messagingSenderId: "219072133500",
  appId: "1:219072133500:web:e446fbaba11c45634d0cf9"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export function onProgramsUpdate(callback: (data: any) => void): Unsubscribe {
  const programsRef = ref(database, 'programs');
  return onValue(programsRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || {});
  }, (error) => {
    console.error("Erro ao ouvir programas:", error);
    callback({});
  });
}

export function onHistoryUpdate(callback: (data: any) => void): Unsubscribe {
  const historyRef = ref(database, 'history');
  return onValue(historyRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || {});
  }, (error) => {
    console.error("Erro ao ouvir histórico:", error);
    callback({});
  });
}

export async function updateProgram(programId: string, data: any): Promise<void> {
  const programRef = ref(database, `programs/${programId}`);
  await set(programRef, data);
}

export async function addHistoryEntry(entry: any): Promise<void> {
  const historyRef = ref(database, 'history');
  await push(historyRef, entry);
}

export { database };
