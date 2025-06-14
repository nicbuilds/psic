import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    updatePassword,
    signInAnonymously
    // No necesitamos signInWithCustomToken para el desarrollo local básico
} from "firebase/auth";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    doc, 
    getDoc,
    setDoc, 
    onSnapshot,
    Timestamp
} from "firebase/firestore";

// --- ÍCONOS SVG (Sin cambios) ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const LockClosedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const NotesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;


// --- CONFIGURACIÓN DE FIREBASE ---
// IMPORTANTE: REEMPLAZA ESTE OBJETO CON LA CONFIGURACIÓN DE TU PROPIO PROYECTO DE FIREBASE
// Puedes encontrarla en la consola de Firebase > Configuración del proyecto > Tus apps > App web.
const firebaseConfig = {
  apiKey: "AIzaSyC9S1pPRRMYbGxnxGgqqn-UZlacnFgCeaw",
  authDomain: "mobi-b1851.firebaseapp.com",
  projectId: "mobi-b1851",
  storageBucket: "mobi-b1851.firebasestorage.app",
  messagingSenderId: "1058059233617",
  appId: "1:1058059233617:web:9590eaf23d806fedcf0b70",
  measurementId: "G-2P13DXSSFQ"
};

// Si el código se ejecuta en el entorno Canvas, usará las variables globales.
// De lo contrario, usará la configuración que pegaste arriba.
const finalFirebaseConfig = typeof window !== 'undefined' && window.__firebase_config 
    ? JSON.parse(window.__firebase_config) 
    : firebaseConfig;

// Inicializar Firebase
const app = initializeApp(finalFirebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// --- COMPONENTES DE LA UI ---

// Componente para mostrar mensajes de carga o error
const Modal = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <p className="mb-4 text-gray-700">{message}</p>
            <button
                onClick={onClose}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
                Cerrar
            </button>
        </div>
    </div>
);

// Pantalla de Login y Registro
const AuthScreen = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState('');

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setMessage('Procesando...');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // NOTA: Para que esto funcione, el ID del psicólogo debe existir en tu base de datos de Firestore.
                // Puedes obtener el UID del psicólogo desde la consola de Firebase Authentication.
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    role: 'patient',
                    name: `Paciente ${userCredential.user.email.split('@')[0]}`,
                    psychologistId: 'aQ2Hw0BsS8gV5y3E2x9Z8rQp4wY2' // ID de ejemplo del psicólogo
                });
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
                    {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta de Paciente'}
                </h2>
                <p className="text-center text-gray-500 mb-8">Bienvenido/a a la plataforma de bienestar</p>
                {message && !message.includes('Procesando') && <p className="bg-red-100 text-red-700 p-3 rounded-md text-center mb-4">{message}</p>}
                {message.includes('Procesando') && <p className="text-center text-indigo-600 mb-4">{message}</p>}

                <form onSubmit={handleAuthAction} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <div className="mt-1 relative">
                             <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                             <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">Contraseña</label>
                        <div className="mt-1 relative">
                            <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        {isLogin ? 'Entrar' : 'Registrarse'}
                    </button>
                </form>
                <p className="text-center mt-6">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </p>
            </div>
             <div className="mt-4 text-xs text-gray-500 text-center">
                <p>Crea cuentas de prueba o usa las que ya tengas en tu Firebase.</p>
            </div>
        </div>
    );
};

// Dashboard del Psicólogo
const PsychologistDashboard = ({ user, handleLogout }) => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [emotionLogs, setEmotionLogs] = useState([]);
    const [note, setNote] = useState("");

    // Cargar pacientes del psicólogo
    useEffect(() => {
        if (!user || !user.uid) return;
        const q = query(collection(db, "users"), where("role", "==", "patient"), where("psychologistId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const patientsData = [];
            querySnapshot.forEach((doc) => {
                patientsData.push({ id: doc.id, ...doc.data() });
            });
            setPatients(patientsData);
        });
        return () => unsubscribe();
    }, [user.uid]);

    // Cargar datos del paciente seleccionado
    useEffect(() => {
        if (!selectedPatient) return;
        
        const sessionsQuery = query(collection(db, `users/${selectedPatient.id}/sessions`));
        const sessionsUnsub = onSnapshot(sessionsQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({...doc.data(), id: doc.id, date: doc.data().date?.toDate()})).sort((a,b) => b.date - a.date);
            setSessions(data);
        });
        
        const logsQuery = query(collection(db, `users/${selectedPatient.id}/emotionLogs`));
        const logsUnsub = onSnapshot(logsQuery, (snapshot) => {
             const data = snapshot.docs.map(doc => ({...doc.data(), id: doc.id, timestamp: doc.data().timestamp?.toDate()})).sort((a,b) => b.timestamp - a.timestamp);
            setEmotionLogs(data);
        });

        return () => {
            sessionsUnsub();
            logsUnsub();
        };

    }, [selectedPatient]);

    const handleAddSession = async () => {
        if (!note.trim() || !selectedPatient) return;
        await addDoc(collection(db, `users/${selectedPatient.id}/sessions`), {
            date: Timestamp.now(),
            notes: note
        });
        setNote("");
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <aside className="w-1/3 max-w-xs bg-white p-6 border-r border-gray-200 flex flex-col">
                <div className="flex items-center mb-6">
                    <UserIcon />
                    <h1 className="text-xl font-bold ml-3 text-gray-800">Psic. {user.name || user.email.split('@')[0]}</h1>
                </div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Pacientes</h2>
                <div className="flex-grow overflow-y-auto">
                    <ul>
                        {patients.map(p => (
                            <li key={p.id} 
                                onClick={() => setSelectedPatient(p)}
                                className={`p-3 rounded-md cursor-pointer mb-2 transition-colors ${selectedPatient?.id === p.id ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-200'}`}
                            >
                                {p.name}
                            </li>
                        ))}
                    </ul>
                </div>
                <button onClick={handleLogout} className="mt-4 flex items-center justify-center w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                    <LogoutIcon /> <span className="ml-2">Salir</span>
                </button>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                {!selectedPatient ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-2xl text-gray-500">Selecciona un paciente para ver sus detalles</p>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Detalles de {selectedPatient.name}</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center"><NotesIcon /> <span className="ml-2">Sesiones y Notas Clínicas</span></h3>
                                <div className="space-y-4 mb-6">
                                    <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Escribe una nueva nota clínica aquí..." className="w-full p-3 border border-gray-300 rounded-md h-28 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                                    <button onClick={handleAddSession} className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Añadir Nueva Sesión</button>
                                </div>
                                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                    {sessions.map(s => (
                                        <div key={s.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <p className="font-semibold text-gray-600 flex items-center"><CalendarIcon /> {s.date?.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{s.notes}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center"><HeartIcon /> <span className="ml-2">Registro de Emociones</span></h3>
                                <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-2">
                                    {emotionLogs.map(log => (
                                         <div key={log.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <p className="font-semibold text-gray-600 flex items-center"><CalendarIcon /> {log.timestamp?.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{log.entry}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

// Dashboard del Paciente
const PatientDashboard = ({ user, handleLogout }) => {
    const [entry, setEntry] = useState('');
    const [logs, setLogs] = useState([]);
    const [showProfile, setShowProfile] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [modalInfo, setModalInfo] = useState({ show: false, message: '' });

    useEffect(() => {
        if (!user || !user.uid) return;
        const q = query(collection(db, `users/${user.uid}/emotionLogs`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({...doc.data(), id: doc.id, timestamp: doc.data().timestamp?.toDate()})).sort((a,b) => b.timestamp - a.timestamp);
            setLogs(data);
        });
        return () => unsubscribe();
    }, [user.uid]);

    const handleAddEntry = async () => {
        if (!entry.trim()) return;
        await addDoc(collection(db, `users/${user.uid}/emotionLogs`), {
            timestamp: Timestamp.now(),
            entry: entry
        });
        setEntry('');
        setModalInfo({ show: true, message: 'Tu registro ha sido guardado.' });
    };

    const handleUpdatePassword = async () => {
        if (newPassword.length < 6) {
            setModalInfo({ show: true, message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
            return;
        }
        try {
            await updatePassword(auth.currentUser, newPassword);
            setNewPassword('');
            setShowProfile(false);
            setModalInfo({ show: true, message: 'Contraseña actualizada con éxito.' });
        } catch (error) {
            setModalInfo({ show: true, message: `Error al actualizar la contraseña: ${error.message}` });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            {modalInfo.show && <Modal message={modalInfo.message} onClose={() => setModalInfo({show: false, message:''})} />}
            <header className="max-w-4xl mx-auto bg-white p-4 rounded-lg shadow-sm flex justify-between items-center mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Hola, {user.name || user.email.split('@')[0]}</h1>
                <div>
                     <button onClick={() => setShowProfile(!showProfile)} className="text-indigo-600 hover:text-indigo-800 mr-4">Mi Perfil</button>
                     <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 text-sm">Salir</button>
                </div>
            </header>
            {showProfile ? (
                 <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg mb-8">
                    <h2 className="text-xl font-bold mb-4">Editar Perfil</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Cambiar Contraseña</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nueva contraseña segura" className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <button onClick={handleUpdatePassword} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Guardar Contraseña</button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg mb-8">
                        <h2 className="text-xl font-bold mb-2 flex items-center"><HeartIcon className="text-red-400"/> <span className="ml-2">Mi Diario de Emociones</span></h2>
                        <p className="text-gray-600 mb-4">¿Cómo te sientes hoy? Escribe sobre tus pensamientos, emociones o recuerdos.</p>
                        <textarea value={entry} onChange={(e) => setEntry(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md h-32 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Hoy me sentí..."></textarea>
                        <button onClick={handleAddEntry} className="mt-4 bg-indigo-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-indigo-700">Guardar Registro</button>
                    </div>
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-xl font-bold text-gray-700 mb-4">Mis Registros Anteriores</h3>
                        <div className="space-y-4">
                            {logs.map(log => (
                                <div key={log.id} className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-indigo-400">
                                    <p className="text-sm text-gray-500 mb-2 font-semibold">{log.timestamp?.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                    <p className="text-gray-800">{log.entry}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                 </>
            )}
        </div>
    );
};

// Componente Principal de la App
export default function App() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setIsLoading(true);
            if (currentUser && !currentUser.isAnonymous) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    setUser(currentUser);
                    setUserData({ uid: userDocSnap.id, ...userDocSnap.data() });
                } else {
                    console.error("El usuario está autenticado pero no se encontró su documento en Firestore.");
                    setUser(null);
                    setUserData(null);
                }
            } else {
                setUser(null);
                setUserData(null);
            }
            setIsLoading(false);
        });
        
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
        setUserData(null);
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-xl text-indigo-600">Cargando aplicación...</p></div>;
    }

    if (!user || !userData) {
        return <AuthScreen setUser={setUser} />;
    }

    if (userData.role === 'psychologist') {
        return <PsychologistDashboard user={userData} handleLogout={handleLogout} />;
    }
    
    if (userData.role === 'patient') {
        return <PatientDashboard user={userData} handleLogout={handleLogout} />;
    }
    
    return <AuthScreen setUser={setUser} />;
}
