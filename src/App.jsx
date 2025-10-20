import React, { useState, useEffect, useCallback } from 'react'; 
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    updatePassword,
    sendPasswordResetEmail
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
    Timestamp,
    orderBy,
    updateDoc,
    deleteDoc
} from "firebase/firestore";

// --- ÍCONOS SVG MEJORADOS ---
const UserIcon = ({className = "h-6 w-6"}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const LockClosedIcon = ({className = "h-6 w-6"}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const NotesIcon = ({className = "h-6 w-6"}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
const HeartIcon = ({className = "h-6 w-6"}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const CalendarIcon = ({className = "h-5 w-5 mr-2"}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const LogoutIcon = ({className = "h-6 w-6"}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const LoadingSpinner = ({className = "h-6 w-6"}) => <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const PlusIcon = ({className = "h-5 w-5"}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const ClockIcon = ({className = "h-5 w-5"}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TrashIcon = ({className = "h-5 w-5"}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

// NUEVOS ÍCONOS AGREGADOS
const MedicalIcon = ({className = "h-6 w-6"}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;

// NUEVOS ÍCONOS AGREGADOS PARA DATOS CLÍNICOS
const MedicalRecordIcon = ({className = "h-6 w-6"}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const StethoscopeIcon = ({className = "h-6 w-6"}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const PrescriptionIcon = ({className = "h-6 w-6"}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const HistoryIcon = ({className = "h-6 w-6"}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyC9S1pPRRMYbGxnxGgqqn-UZlacnFgCeaw",
    authDomain: "mobi-b1851.firebaseapp.com",
    projectId: "mobi-b1851",
    storageBucket: "mobi-b1851.firebasestorage.app",
    messagingSenderId: "1058059233617",
    appId: "1:1058059233617:web:9590eaf23d806fedcf0b70",
    measurementId: "G-2P13DXSSFQ"
};

const finalFirebaseConfig = typeof window !== 'undefined' && window.__firebase_config 
    ? JSON.parse(window.__firebase_config) 
    : firebaseConfig;

const app = initializeApp(finalFirebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- HOOKS PERSONALIZADOS ---
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    
    return debouncedValue;
};

// --- COMPONENTES DE LA UI MEJORADOS ---

// Modal mejorado con tipos diferentes y tamaños
const Modal = ({ message, onClose, type = 'info', title = '', children, size = 'normal' }) => {
    const bgColor = {
        info: 'bg-indigo-600',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        error: 'bg-red-600'
    }[type];

    const sizeClasses = {
        normal: 'max-w-md',
        large: 'max-w-4xl max-h-screen',
        xlarge: 'max-w-6xl max-h-screen'
    }[size];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className={`bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full ${sizeClasses} overflow-y-auto`}>
                {title && <h3 className={`text-lg font-semibold text-white p-2 rounded-t-lg -mt-8 -mx-6 mb-4 ${bgColor}`}>{title}</h3>}
                <div className="mb-6">
                    {message && <p className="text-gray-700 text-lg">{message}</p>}
                    {children}
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-semibold"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

// Componente de carga mejorado
const LoadingScreen = ({ message = "Cargando aplicación..." }) => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex flex-col items-center">
            <LoadingSpinner className="h-12 w-12 text-indigo-600 mb-4" />
            <p className="text-xl text-indigo-600 font-medium">{message}</p>
        </div>
    </div>
);

// Componente de Calendario para Citas CORREGIDO
const AppointmentCalendar = ({ appointments, onDateSelect, selectedDate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        return { firstDay, lastDay, daysInMonth };
    };

    const getAppointmentsForDate = (date) => {
        return appointments.filter(apt => {
            const aptDate = apt.date;
            return aptDate && 
                   aptDate.getDate() === date.getDate() &&
                   aptDate.getMonth() === date.getMonth() &&
                   aptDate.getFullYear() === date.getFullYear();
        });
    };

    const { firstDay, lastDay, daysInMonth } = getDaysInMonth(currentDate);
    const startDay = firstDay.getDay();
    
    const days = [];
    
    // Días del mes anterior
    for (let i = 0; i < startDay; i++) {
        days.push(null);
    }
    
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        days.push(date);
    }

    const navigateMonth = (direction) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    const isSelected = (date) => {
        return selectedDate && 
               date.getDate() === selectedDate.getDate() &&
               date.getMonth() === selectedDate.getMonth() &&
               date.getFullYear() === selectedDate.getFullYear();
    };

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <button 
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    ‹
                </button>
                <h3 className="text-lg font-semibold text-gray-800">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button 
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    ›
                </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => {
                    if (!date) {
                        return <div key={`empty-${index}`} className="h-12 border border-gray-100 rounded"></div>;
                    }
                    
                    const dateAppointments = getAppointmentsForDate(date);
                    const hasAppointments = dateAppointments.length > 0;
                    
                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => onDateSelect(date)}
                            className={`h-12 border rounded-lg transition-all relative ${
                                isToday(date) 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : isSelected(date)
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <span className={`text-sm font-medium ${
                                isToday(date) 
                                    ? 'text-blue-600' 
                                    : isSelected(date)
                                    ? 'text-indigo-600'
                                    : 'text-gray-700'
                            }`}>
                                {date.getDate()}
                            </span>
                            {hasAppointments && (
                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                    {dateAppointments.slice(0, 3).map((apt, idx) => (
                                        <div 
                                            key={idx}
                                            className={`w-1 h-1 rounded-full ${
                                                apt.status === 'confirmed' ? 'bg-green-500' :
                                                apt.status === 'pending' ? 'bg-yellow-500' :
                                                'bg-gray-400'
                                            }`}
                                        ></div>
                                    ))}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// --- COMPONENTE PARA NOTAS CLÍNICAS RÁPIDAS ---
const ClinicalQuickNote = ({ patientId, psychologistId, onNoteAdded }) => {
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddNote = async () => {
        if (!note.trim()) return;

        setIsLoading(true);
        try {
            await addDoc(collection(db, `psychologists/${psychologistId}/patients/${patientId}/clinicalHistory`), {
                date: Timestamp.now(),
                type: 'note',
                description: note.trim(),
                updatedBy: psychologistId
            });
            
            setNote('');
            if (onNoteAdded) onNoteAdded();
        } catch (error) {
            console.error("Error adding clinical note:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Escribe una nota clínica rápida..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-20 resize-none"
                maxLength={500}
            />
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{note.length}/500 caracteres</span>
                <button
                    onClick={handleAddNote}
                    disabled={!note.trim() || isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 transition-colors flex items-center"
                >
                    {isLoading ? <LoadingSpinner className="h-4 w-4 mr-2" /> : null}
                    Agregar Nota
                </button>
            </div>
        </div>
    );
};

// --- COMPONENTE MEJORADO DE DATOS CLÍNICOS ---
const ClinicalDataSection = ({ selectedPatient, user, onUpdate }) => {
    const [clinicalData, setClinicalData] = useState({
        diagnosis: '',
        treatment: '',
        clinicalHistory: '',
        medications: '',
        allergies: '',
        emergencyContact: '',
        lastEvaluation: '',
        nextEvaluation: '',
        doctorName: '',
        specialNotes: '',
        status: 'active'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [clinicalHistory, setClinicalHistory] = useState([]);

    // Cargar datos clínicos
    useEffect(() => {
        if (!selectedPatient || !user?.uid) return;

        const loadClinicalData = async () => {
            try {
                const clinicalDoc = await getDoc(doc(db, `psychologists/${user.uid}/patients/${selectedPatient.id}/clinical`, 'data'));
                if (clinicalDoc.exists()) {
                    setClinicalData(clinicalDoc.data());
                }
                
                // Cargar historial clínico
                const historyQuery = query(
                    collection(db, `psychologists/${user.uid}/patients/${selectedPatient.id}/clinicalHistory`),
                    orderBy("date", "desc")
                );
                
                const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
                    const historyData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        date: doc.data().date?.toDate()
                    }));
                    setClinicalHistory(historyData);
                });

                return () => unsubscribe();
            } catch (error) {
                console.error("Error loading clinical data:", error);
            }
        };

        loadClinicalData();
    }, [selectedPatient, user?.uid]);

    const handleSave = async () => {
        if (!selectedPatient) return;

        setIsLoading(true);
        try {
            await setDoc(doc(db, `psychologists/${user.uid}/patients/${selectedPatient.id}/clinical`, 'data'), {
                ...clinicalData,
                lastUpdated: Timestamp.now(),
                updatedBy: user.uid
            });

            // Agregar al historial si hay cambios importantes
            if (clinicalData.diagnosis || clinicalData.treatment) {
                await addDoc(collection(db, `psychologists/${user.uid}/patients/${selectedPatient.id}/clinicalHistory`), {
                    date: Timestamp.now(),
                    type: 'clinical_update',
                    description: 'Actualización de datos clínicos',
                    details: {
                        diagnosis: clinicalData.diagnosis,
                        treatment: clinicalData.treatment
                    },
                    updatedBy: user.uid
                });
            }

            setIsEditing(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Error saving clinical data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!selectedPatient) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center py-8">
                    <MedicalRecordIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Selecciona un paciente para ver los datos clínicos</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header del Paciente con Datos Clínicos */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{selectedPatient.name}</h2>
                        <p className="text-gray-600">{selectedPatient.email}</p>
                    </div>
                    <div className="flex space-x-2 mt-2 sm:mt-0">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                isEditing 
                                    ? 'bg-gray-500 text-white hover:bg-gray-600' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                        >
                            {isEditing ? 'Cancelar' : 'Editar Datos'}
                        </button>
                        {isEditing && (
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 transition-colors flex items-center"
                            >
                                {isLoading ? <LoadingSpinner className="h-4 w-4 mr-2" /> : null}
                                Guardar
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Estado</p>
                        <p className="text-lg font-semibold capitalize">{clinicalData.status || 'Activo'}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Última Evaluación</p>
                        <p className="text-lg font-semibold">
                            {clinicalData.lastEvaluation 
                                ? new Date(clinicalData.lastEvaluation).toLocaleDateString('es-ES')
                                : 'No registrada'
                            }
                        </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-sm text-purple-600 font-medium">Médico Tratante</p>
                        <p className="text-lg font-semibold">{clinicalData.doctorName || 'No asignado'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información Clínica Principal */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <MedicalRecordIcon className="h-5 w-5 text-indigo-600 mr-2" />
                            Diagnóstico y Tratamiento
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Diagnóstico Principal
                                </label>
                                {isEditing ? (
                                    <textarea
                                        value={clinicalData.diagnosis}
                                        onChange={(e) => setClinicalData({...clinicalData, diagnosis: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-24 resize-none"
                                        placeholder="Diagnóstico principal del paciente..."
                                    />
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg min-h-24">
                                        <p className="text-gray-700 whitespace-pre-wrap">
                                            {clinicalData.diagnosis || 'No se ha registrado diagnóstico'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Plan de Tratamiento
                                </label>
                                {isEditing ? (
                                    <textarea
                                        value={clinicalData.treatment}
                                        onChange={(e) => setClinicalData({...clinicalData, treatment: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-24 resize-none"
                                        placeholder="Plan de tratamiento actual..."
                                    />
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg min-h-24">
                                        <p className="text-gray-700 whitespace-pre-wrap">
                                            {clinicalData.treatment || 'No se ha registrado plan de tratamiento'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <PrescriptionIcon className="h-5 w-5 text-green-600 mr-2" />
                            Medicación y Alergias
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Medicación Actual
                                </label>
                                {isEditing ? (
                                    <textarea
                                        value={clinicalData.medications}
                                        onChange={(e) => setClinicalData({...clinicalData, medications: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-20 resize-none"
                                        placeholder="Medicamentos, dosis, frecuencia..."
                                    />
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg min-h-20">
                                        <p className="text-gray-700 whitespace-pre-wrap">
                                            {clinicalData.medications || 'No se ha registrado medicación'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Alergias y Contraindicaciones
                                </label>
                                {isEditing ? (
                                    <textarea
                                        value={clinicalData.allergies}
                                        onChange={(e) => setClinicalData({...clinicalData, allergies: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-20 resize-none"
                                        placeholder="Alergias conocidas, contraindicaciones..."
                                    />
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg min-h-20">
                                        <p className="text-gray-700 whitespace-pre-wrap">
                                            {clinicalData.allergies || 'No se han registrado alergias'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información Adicional e Historial */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <StethoscopeIcon className="h-5 w-5 text-blue-600 mr-2" />
                            Información Adicional
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del Médico Tratante
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={clinicalData.doctorName}
                                        onChange={(e) => setClinicalData({...clinicalData, doctorName: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Dr. Nombre Apellido"
                                    />
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-gray-700">
                                            {clinicalData.doctorName || 'No asignado'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Última Evaluación
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={clinicalData.lastEvaluation}
                                            onChange={(e) => setClinicalData({...clinicalData, lastEvaluation: e.target.value})}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    ) : (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-gray-700">
                                                {clinicalData.lastEvaluation 
                                                    ? new Date(clinicalData.lastEvaluation).toLocaleDateString('es-ES')
                                                    : 'No registrada'
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Próxima Evaluación
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={clinicalData.nextEvaluation}
                                            onChange={(e) => setClinicalData({...clinicalData, nextEvaluation: e.target.value})}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    ) : (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-gray-700">
                                                {clinicalData.nextEvaluation 
                                                    ? new Date(clinicalData.nextEvaluation).toLocaleDateString('es-ES')
                                                    : 'No programada'
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contacto de Emergencia
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={clinicalData.emergencyContact}
                                        onChange={(e) => setClinicalData({...clinicalData, emergencyContact: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Nombre y teléfono de contacto"
                                    />
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-gray-700">
                                            {clinicalData.emergencyContact || 'No registrado'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notas Clínicas Rápidas */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <HistoryIcon className="h-5 w-5 text-orange-600 mr-2" />
                            Nota Rápida
                        </h3>
                        
                        <ClinicalQuickNote 
                            patientId={selectedPatient.id}
                            psychologistId={user.uid}
                            onNoteAdded={() => {
                                // Recargar historial
                                setClinicalHistory([...clinicalHistory]);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Historial Clínico */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <HistoryIcon className="h-5 w-5 text-gray-600 mr-2" />
                    Historial Clínico
                </h3>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {clinicalHistory.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay registros en el historial clínico</p>
                    ) : (
                        clinicalHistory.map(record => (
                            <div key={record.id} className="border-l-4 border-indigo-500 bg-gray-50 p-4 rounded-r-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        record.type === 'note' ? 'bg-blue-100 text-blue-800' :
                                        record.type === 'clinical_update' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {record.type === 'note' ? 'Nota' : 
                                         record.type === 'clinical_update' ? 'Actualización' : 'Registro'}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {record.date?.toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <p className="text-gray-700">{record.description}</p>
                                {record.details && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        <p><strong>Diagnóstico:</strong> {record.details.diagnosis || 'No especificado'}</p>
                                        <p><strong>Tratamiento:</strong> {record.details.treatment || 'No especificado'}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// Pantalla de Autenticación mejorada (se mantiene igual)
const AuthScreen = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const handleAuthAction = async (e) => {
        e.preventDefault();
        if (isLoading) return;
        
        setIsLoading(true);
        setMessage('Procesando...');
        
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    role: 'patient',
                    name: `Paciente ${userCredential.user.email.split('@')[0]}`,
                    psychologistId: 'aQ2Hw0BsS8gV5y3E2x9Z8rQp4wY2',
                    createdAt: Timestamp.now()
                });
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setMessage('Por favor ingresa tu email para recuperar la contraseña');
            return;
        }
        
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Se ha enviado un email para restablecer tu contraseña');
            setShowForgotPassword(false);
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </h2>
                    <p className="text-gray-500">Bienvenido/a a tu espacio de bienestar</p>
                </div>
                
                {message && (
                    <div className={`p-3 rounded-md text-center mb-4 ${
                        message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                        {message}
                    </div>
                )}

                {showForgotPassword ? (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Recuperar Contraseña</h3>
                        <p className="text-sm text-gray-600">Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.</p>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                        <div className="flex space-x-3">
                            <button
                                onClick={handleForgotPassword}
                                disabled={isLoading}
                                className="flex-1 bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 font-semibold disabled:opacity-50"
                            >
                                {isLoading ? <LoadingSpinner className="h-5 w-5 mx-auto" /> : 'Enviar Email'}
                            </button>
                            <button
                                onClick={() => setShowForgotPassword(false)}
                                className="flex-1 bg-gray-500 text-white py-3 rounded-md hover:bg-gray-600 font-semibold"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleAuthAction} className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Email</label>
                            <div className="mt-1 relative">
                                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Contraseña</label>
                            <div className="mt-1 relative">
                                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? <LoadingSpinner className="h-5 w-5 mr-2" /> : null}
                            {isLogin ? 'Entrar' : 'Registrarse'}
                        </button>
                    </form>
                )}

                <div className="mt-6 space-y-3">
                    {!showForgotPassword && isLogin && (
                        <button
                            onClick={() => setShowForgotPassword(true)}
                            className="w-full text-center text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    )}
                    
                    <div className="text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setMessage('');
                                setShowForgotPassword(false);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 text-xs text-gray-500 text-center px-4 max-w-md">
                <p>Tu privacidad es importante. Todos los datos están protegidos y encriptados.</p>
            </div>
        </div>
    );
};

// Dashboard del Psicólogo MEJORADO con Gestión de Citas CORREGIDO Y NUEVAS FUNCIONALIDADES
const PsychologistDashboard = ({ user, handleLogout }) => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [emotionLogs, setEmotionLogs] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [note, setNote] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('pacientes');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [newAppointment, setNewAppointment] = useState({
        patientId: '',
        date: '',
        time: '09:00',
        duration: 60,
        notes: '',
        status: 'pending'
    });
    const [modalInfo, setModalInfo] = useState({ show: false, message: '', type: 'info', title: '' });
    
    // NUEVOS ESTADOS PARA LAS FUNCIONALIDADES SOLICITADAS
    const [showAddPatientModal, setShowAddPatientModal] = useState(false);
    const [newPatient, setNewPatient] = useState({
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: ''
    });
    const [clinicalData, setClinicalData] = useState({
        diagnosis: '',
        treatment: '',
        clinicalHistory: ''
    });
    const [showClinicalModal, setShowClinicalModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [showEditPatientModal, setShowEditPatientModal] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Filtrar pacientes basado en la búsqueda
    const filteredPatients = patients.filter(patient =>
        patient.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    // Obtener pacientes
    useEffect(() => {
        if (!user?.uid) return;
        
        setIsLoading(true);
        
        // Query for patients without filtering by status initially
        const q = query(
            collection(db, "users"), 
            where("role", "==", "patient"), 
            where("psychologistId", "==", user.uid)
        );
        
        const unsubscribe = onSnapshot(q, 
            (querySnapshot) => {
                const patientsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                    // Filter out inactive patients on the client side
                    .filter(patient => patient.status !== 'inactive');
                setPatients(patientsData);
                setIsLoading(false);
            },
            (error) => {
                console.error("Error fetching patients:", error);
                setIsLoading(false);
            }
        );
        
        return () => unsubscribe();
    }, [user.uid]);


    // Obtener citas del psicólogo
    useEffect(() => {
        if (!user?.uid) return;

        const q = query(
            collection(db, `psychologists/${user.uid}/appointments`),
            orderBy("date", "asc")
        );

        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                const appointmentsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date?.toDate()
                }));
                setAppointments(appointmentsData);
            },
            (error) => {
                console.error("Error fetching appointments:", error);
                if (error.code !== 'failed-precondition') {
                    setModalInfo({
                        show: true,
                        message: 'Error al cargar las citas',
                        type: 'error',
                        title: 'Error'
                    });
                }
            }
        );

        return () => unsubscribe();
    }, [user.uid]);

    // Obtener sesiones y registros emocionales del paciente seleccionado
    useEffect(() => {
        if (!selectedPatient) {
            setSessions([]);
            setEmotionLogs([]);
            return;
        }
        
        const sessionsQuery = query(
            collection(db, `users/${selectedPatient.id}/sessions`),
            orderBy("date", "desc")
        );
        
        const sessionsUnsub = onSnapshot(sessionsQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                ...doc.data(), 
                id: doc.id, 
                date: doc.data().date?.toDate()
            }));
            setSessions(data);
        });
        
        const logsQuery = query(
            collection(db, `users/${selectedPatient.id}/emotionLogs`),
            orderBy("timestamp", "desc")
        );
        
        const logsUnsub = onSnapshot(logsQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                ...doc.data(), 
                id: doc.id, 
                timestamp: doc.data().timestamp?.toDate()
            }));
            setEmotionLogs(data);
        });

        return () => {
            sessionsUnsub();
            logsUnsub();
        };
    }, [selectedPatient]);

    // Cargar datos clínicos cuando se selecciona un paciente
    useEffect(() => {
        if (!selectedPatient || !user?.uid) return;

        const loadClinicalData = async () => {
            try {
                const clinicalDoc = await getDoc(doc(db, `psychologists/${user.uid}/patients/${selectedPatient.id}/clinical`, 'data'));
                if (clinicalDoc.exists()) {
                    setClinicalData(clinicalDoc.data());
                } else {
                    setClinicalData({
                        diagnosis: '',
                        treatment: '',
                        clinicalHistory: ''
                    });
                }
            } catch (error) {
                console.error("Error loading clinical data:", error);
            }
        };

        loadClinicalData();
    }, [selectedPatient, user?.uid]);

    // --- FUNCIONES PRINCIPALES ---

    const handleAddSession = async () => {
        if (!note.trim() || !selectedPatient) return;
        
        setIsLoading(true);
        try {
            await addDoc(collection(db, `users/${selectedPatient.id}/sessions`), {
                date: Timestamp.now(),
                notes: note,
                createdBy: user.uid
            });
            setNote("");
        } catch (error) {
            console.error("Error adding session:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAppointment = async () => {
        if (!newAppointment.patientId || !newAppointment.date) {
            setModalInfo({
                show: true,
                message: 'Por favor completa todos los campos requeridos',
                type: 'warning',
                title: 'Campos incompletos'
            });
            return;
        }

        setIsLoading(true);
        try {
            const appointmentDateTime = new Date(`${newAppointment.date}T${newAppointment.time}`);
            
            await addDoc(collection(db, `psychologists/${user.uid}/appointments`), {
                psychologistId: user.uid,
                patientId: newAppointment.patientId,
                date: Timestamp.fromDate(appointmentDateTime),
                duration: parseInt(newAppointment.duration),
                notes: newAppointment.notes,
                status: newAppointment.status,
                createdAt: Timestamp.now(),
                patientName: getPatientName(newAppointment.patientId)
            });

            setNewAppointment({
                patientId: '',
                date: '',
                time: '09:00',
                duration: 60,
                notes: '',
                status: 'pending'
            });
            setShowAppointmentModal(false);
            
            setModalInfo({
                show: true,
                message: 'Cita creada exitosamente',
                type: 'success',
                title: 'Éxito'
            });
        } catch (error) {
            console.error("Error creating appointment:", error);
            setModalInfo({
                show: true,
                message: `Error al crear la cita: ${error.message}`,
                type: 'error',
                title: 'Error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
        try {
            await updateDoc(doc(db, `psychologists/${user.uid}/appointments`, appointmentId), {
                status: newStatus
            });
        } catch (error) {
            console.error("Error updating appointment:", error);
            setModalInfo({
                show: true,
                message: `Error al actualizar la cita: ${error.message}`,
                type: 'error',
                title: 'Error'
            });
        }
    };

    const handleDeleteAppointment = async (appointmentId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
            try {
                await deleteDoc(doc(db, `psychologists/${user.uid}/appointments`, appointmentId));
                setModalInfo({
                    show: true,
                    message: 'Cita eliminada exitosamente',
                    type: 'success',
                    title: 'Éxito'
                });
            } catch (error) {
                console.error("Error deleting appointment:", error);
                setModalInfo({
                    show: true,
                    message: `Error al eliminar la cita: ${error.message}`,
                    type: 'error',
                    title: 'Error'
                });
            }
        }
    };

    // --- FUNCIONES DE GESTIÓN DE PACIENTES ---

    const handleAddPatient = async () => {
        if (!newPatient.name || !newPatient.email) {
            setModalInfo({
                show: true,
                message: 'Por favor completa al menos el nombre y email del paciente',
                type: 'warning',
                title: 'Campos requeridos'
            });
            return;
        }

        setIsLoading(true);
        try {
            // SOLUCIÓN SEGURA: Crear el paciente directamente pero sin cambiar la sesión
            // Primero guardamos los datos del psicólogo actual
            const currentPsychologist = auth.currentUser;
            
            // Generar contraseña temporal
            const tempPassword = Math.random().toString(36).slice(-8) + "A1!";
            
            // Crear el usuario paciente
            const userCredential = await createUserWithEmailAndPassword(auth, newPatient.email, tempPassword);
            const patientUser = userCredential.user;
            
            // IMPORTANTE: Volver inmediatamente a la sesión del psicólogo
            await signOut(auth);
            await signInWithEmailAndPassword(auth, currentPsychologist.email, prompt("Por favor ingresa tu contraseña para confirmar"));
            
            // Mientras tanto, guardar datos del paciente
            await setDoc(doc(db, "users", patientUser.uid), {
                uid: patientUser.uid,
                email: newPatient.email,
                role: 'patient',
                name: newPatient.name,
                phone: newPatient.phone,
                age: newPatient.age,
                gender: newPatient.gender,
                psychologistId: user.uid,
                createdAt: Timestamp.now(),
                status: 'active'
            });

            // Crear documento clínico inicial
            await setDoc(doc(db, `psychologists/${user.uid}/patients/${patientUser.uid}/clinical`, 'data'), {
                diagnosis: '',
                treatment: '',
                clinicalHistory: '',
                doctorName: '',
                status: 'active',
                createdAt: Timestamp.now()
            });

            setNewPatient({
                name: '',
                email: '',
                phone: '',
                age: '',
                gender: ''
            });
            setShowAddPatientModal(false);
            
            setModalInfo({
                show: true,
                message: `Paciente agregado exitosamente. Contraseña temporal: ${tempPassword}`,
                type: 'success',
                title: 'Éxito'
            });
            
        } catch (error) {
            console.error("Error adding patient:", error);
            
            // En caso de error, intentar restaurar la sesión
            try {
                if (!auth.currentUser) {
                    await signInWithEmailAndPassword(auth, user.email, prompt("Hubo un error. Por favor ingresa tu contraseña para restaurar tu sesión"));
                }
            } catch (restoreError) {
                console.error("Error restoring session:", restoreError);
            }
            
            setModalInfo({
                show: true,
                message: `Error al agregar paciente: ${error.message}`,
                type: 'error',
                title: 'Error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditPatient = async () => {
        if (!editingPatient || !editingPatient.name.trim()) {
            setModalInfo({
                show: true,
                message: 'El nombre del paciente es requerido',
                type: 'warning',
                title: 'Campo requerido'
            });
            return;
        }

        setIsLoading(true);
        try {
            await updateDoc(doc(db, "users", editingPatient.id), {
                name: editingPatient.name,
                phone: editingPatient.phone,
                age: editingPatient.age,
                gender: editingPatient.gender,
                updatedAt: Timestamp.now()
            });

            setEditingPatient(null);
            setShowEditPatientModal(false);
            
            setModalInfo({
                show: true,
                message: 'Paciente actualizado exitosamente',
                type: 'success',
                title: 'Éxito'
            });
        } catch (error) {
            console.error("Error updating patient:", error);
            setModalInfo({
                show: true,
                message: `Error al actualizar paciente: ${error.message}`,
                type: 'error',
                title: 'Error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePatient = async (patientId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este paciente? Esta acción no se puede deshacer y se perderán todos los datos del paciente.')) {
            setIsLoading(true);
            try {
                // Actualizar el documento del paciente para marcarlo como eliminado
                await updateDoc(doc(db, "users", patientId), {
                    status: 'inactive',
                    deletedAt: Timestamp.now()
                });

                // Actualizar la lista local de pacientes filtrando el eliminado
                setPatients(prevPatients => prevPatients.filter(patient => patient.id !== patientId));
                
                // Si el paciente eliminado es el seleccionado, limpiar selección
                if (selectedPatient?.id === patientId) {
                    setSelectedPatient(null);
                }
                
                setModalInfo({
                    show: true,
                    message: 'Paciente eliminado exitosamente',
                    type: 'success',
                    title: 'Éxito'
                });
            } catch (error) {
                console.error("Error deleting patient:", error);
                setModalInfo({
                    show: true,
                    message: `Error al eliminar paciente: ${error.message}`,
                    type: 'error',
                    title: 'Error'
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSaveClinicalData = async () => {
        if (!selectedPatient) return;

        setIsLoading(true);
        try {
            await setDoc(doc(db, `psychologists/${user.uid}/patients/${selectedPatient.id}/clinical`, 'data'), {
                ...clinicalData,
                lastUpdated: Timestamp.now()
            });
            
            setShowClinicalModal(false);
            setModalInfo({
                show: true,
                message: 'Datos clínicos guardados exitosamente',
                type: 'success',
                title: 'Éxito'
            });
        } catch (error) {
            console.error("Error saving clinical data:", error);
            setModalInfo({
                show: true,
                message: `Error al guardar datos clínicos: ${error.message}`,
                type: 'error',
                title: 'Error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // --- FUNCIONES AUXILIARES ---

    const getAppointmentsForSelectedDate = () => {
        return appointments.filter(apt => {
            const aptDate = apt.date;
            return aptDate && 
                   aptDate.getDate() === selectedDate.getDate() &&
                   aptDate.getMonth() === selectedDate.getMonth() &&
                   aptDate.getFullYear() === selectedDate.getFullYear();
        });
    };

    const getPatientName = (patientId) => {
        const patient = patients.find(p => p.id === patientId);
        return patient ? patient.name : 'Paciente no encontrado';
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateForInput = (date) => {
        return date.toISOString().split('T')[0];
    };

    // --- RETURN PRINCIPAL ---
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans">
            {modalInfo.show && (
                <Modal 
                    message={modalInfo.message} 
                    onClose={() => setModalInfo({show: false, message: '', type: 'info', title: ''})}
                    type={modalInfo.type}
                    title={modalInfo.title}
                />
            )}
            
            {/* Sidebar */}
            <aside className="w-full md:w-80 bg-white p-4 sm:p-6 border-b md:border-r border-gray-200 flex flex-col">
                <div className="flex items-center mb-6">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                        <UserIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                        <h1 className="text-lg font-bold text-gray-800 truncate">Psic. {user.name || user.email.split('@')[0]}</h1>
                        <p className="text-sm text-gray-500">{patients.length} pacientes</p>
                    </div>
                </div>

                {/* Navegación entre pestañas */}
                <div className="flex space-x-2 mb-4 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('pacientes')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'pacientes' 
                                ? 'bg-white text-indigo-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        Pacientes
                    </button>
                    <button
                        onClick={() => setActiveTab('citas')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'citas' 
                                ? 'bg-white text-indigo-600 shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        Citas
                    </button>
                </div>

                {activeTab === 'pacientes' ? (
                    <>
                        {/* Buscador y Botón Agregar */}
                        <div className="flex space-x-2 mb-4">
                            <input
                                type="text"
                                placeholder="Buscar paciente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button
                                onClick={() => setShowAddPatientModal(true)}
                                className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                title="Agregar paciente"
                            >
                                <PlusIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Pacientes</h2>
                        
                        <div className="overflow-y-auto flex-grow">
                            {isLoading ? (
                                <div className="flex justify-center py-4">
                                    <LoadingSpinner className="h-5 w-5 text-indigo-600" />
                                </div>
                            ) : filteredPatients.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">
                                    {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes asignados'}
                                </p>
                            ) : (
                                <ul className="space-y-2">
                                    {filteredPatients.map(patient => (
                                        <li 
                                            key={patient.id}
                                            className={`p-3 rounded-lg transition-all border-l-4 ${
                                                selectedPatient?.id === patient.id 
                                                    ? 'bg-indigo-100 border-indigo-500 text-indigo-800 font-semibold' 
                                                    : 'hover:bg-gray-100 border-transparent'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div 
                                                    className="flex-1 cursor-pointer"
                                                    onClick={() => setSelectedPatient(patient)}
                                                >
                                                    <div className="font-medium truncate">{patient.name}</div>
                                                    <div className="text-sm text-gray-500 truncate">{patient.email}</div>
                                                    {patient.phone && (
                                                        <div className="text-sm text-gray-500">📞 {patient.phone}</div>
                                                    )}
                                                </div>
                                                <div className="flex space-x-1 ml-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPatient(patient);
                                                            setShowClinicalModal(true);
                                                        }}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Datos clínicos"
                                                    >
                                                        <MedicalRecordIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingPatient(patient);
                                                            setShowEditPatientModal(true);
                                                        }}
                                                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                        title="Editar paciente"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePatient(patient.id)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Eliminar paciente"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-grow">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Gestión de Citas</h2>
                        <button
                            onClick={() => setShowAppointmentModal(true)}
                            className="w-full mb-4 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center justify-center"
                        >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Nueva Cita
                        </button>
                        
                        <div className="space-y-3">
                            <h3 className="font-medium text-gray-700">Citas de Hoy</h3>
                            {getAppointmentsForSelectedDate().filter(apt => 
                                apt.date.toDateString() === new Date().toDateString()
                            ).map(apt => (
                                <div key={apt.id} className="bg-white p-3 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-800">{getPatientName(apt.patientId)}</p>
                                            <p className="text-sm text-gray-600">{formatTime(apt.date)}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                            apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {apt.status === 'confirmed' ? 'Confirmada' :
                                             apt.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button 
                    onClick={handleLogout}
                    className="mt-4 flex items-center justify-center w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                    <LogoutIcon className="h-5 w-5" />
                    <span className="ml-2">Cerrar Sesión</span>
                </button>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                {activeTab === 'pacientes' ? (
                    !selectedPatient ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <NotesIcon className="h-16 w-16 text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-500 mb-2">Selecciona un paciente</h3>
                            <p className="text-gray-400 max-w-md">
                                Elige un paciente de la lista para ver sus sesiones y registros emocionales.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Header del Paciente */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">{selectedPatient.name}</h2>
                                        <p className="text-gray-600">{selectedPatient.email}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedPatient.phone && (
                                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                                                    📞 {selectedPatient.phone}
                                                </span>
                                            )}
                                            {selectedPatient.age && (
                                                <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">
                                                    Edad: {selectedPatient.age}
                                                </span>
                                            )}
                                            {selectedPatient.gender && (
                                                <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs">
                                                    {selectedPatient.gender === 'male' ? '♂ Masculino' : 
                                                     selectedPatient.gender === 'female' ? '♀ Femenino' : 
                                                     selectedPatient.gender}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:mt-0 flex space-x-2">
                                        <button
                                            onClick={() => setShowClinicalModal(true)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center"
                                        >
                                            <MedicalRecordIcon className="h-4 w-4 mr-2" />
                                            Datos Clínicos
                                        </button>
                                        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                            {sessions.length} sesiones
                                        </div>
                                        <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                            {emotionLogs.length} registros
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Sesiones */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                                        <NotesIcon className="h-6 w-6 text-indigo-600" />
                                        <span className="ml-2">Sesiones y Notas</span>
                                    </h3>
                                    
                                    <div className="space-y-4 mb-6">
                                        <textarea 
                                            value={note} 
                                            onChange={e => setNote(e.target.value)} 
                                            placeholder="Escribe una nueva nota clínica..."
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32 resize-none"
                                            disabled={isLoading}
                                        />
                                        <button 
                                            onClick={handleAddSession}
                                            disabled={!note.trim() || isLoading}
                                            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                                        >
                                            {isLoading ? <LoadingSpinner className="h-5 w-5 mr-2" /> : null}
                                            Añadir Nueva Sesión
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                        {sessions.map(session => (
                                            <div key={session.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <div className="flex items-center text-sm text-gray-600 mb-2">
                                                    <CalendarIcon />
                                                    {session.date?.toLocaleDateString('es-ES', { 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric',
                                                        hour: '2-digit', 
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                                <p className="text-gray-700 whitespace-pre-wrap">{session.notes}</p>
                                            </div>
                                        ))}
                                        {sessions.length === 0 && (
                                            <p className="text-gray-500 text-center py-4">No hay sesiones registradas</p>
                                        )}
                                    </div>
                                </div>

                                {/* Registros de Emociones */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                                        <HeartIcon className="h-6 w-6 text-red-500" />
                                        <span className="ml-2">Registro de Emociones</span>
                                    </h3>
                                    
                                    <div className="space-y-4 max-h-[34rem] overflow-y-auto pr-2">
                                        {emotionLogs.map(log => (
                                            <div key={log.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <div className="flex items-center text-sm text-gray-600 mb-2">
                                                    <CalendarIcon />
                                                    {log.timestamp?.toLocaleDateString('es-ES', { 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric',
                                                        hour: '2-digit', 
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                                <p className="text-gray-700 whitespace-pre-wrap">{log.entry}</p>
                                            </div>
                                        ))}
                                        {emotionLogs.length === 0 && (
                                            <p className="text-gray-500 text-center py-4">No hay registros emocionales</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Gestión de Citas</h2>
                            <p className="text-gray-600">Programa y gestiona las citas con tus pacientes.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Calendario */}
                            <div className="lg:col-span-2">
                                <AppointmentCalendar 
                                    appointments={appointments}
                                    onDateSelect={setSelectedDate}
                                    selectedDate={selectedDate}
                                />
                            </div>

                            {/* Lista de Citas del Día Seleccionado */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Citas para {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </h3>
                                
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {getAppointmentsForSelectedDate().length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No hay citas programadas para este día</p>
                                    ) : (
                                        getAppointmentsForSelectedDate().map(apt => (
                                            <div key={apt.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{getPatientName(apt.patientId)}</p>
                                                        <p className="text-sm text-gray-600 flex items-center">
                                                            <ClockIcon className="h-4 w-4 mr-1" />
                                                            {formatTime(apt.date)} - {apt.duration} min
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteAppointment(apt.id)}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                
                                                {apt.notes && (
                                                    <p className="text-sm text-gray-700 mb-3">{apt.notes}</p>
                                                )}
                                                
                                                <div className="flex justify-between items-center">
                                                    <select
                                                        value={apt.status}
                                                        onChange={(e) => handleUpdateAppointmentStatus(apt.id, e.target.value)}
                                                        className={`text-xs font-medium px-2 py-1 rounded ${
                                                            apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                            apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        <option value="pending">Pendiente</option>
                                                        <option value="confirmed">Confirmada</option>
                                                        <option value="cancelled">Cancelada</option>
                                                    </select>
                                                    
                                                    <span className="text-xs text-gray-500">
                                                        {apt.date.toLocaleDateString('es-ES')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal para Nueva Cita */}
            {showAppointmentModal && (
                <Modal 
                    title="Nueva Cita"
                    onClose={() => setShowAppointmentModal(false)}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
                            <select
                                value={newAppointment.patientId}
                                onChange={(e) => setNewAppointment({...newAppointment, patientId: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            >
                                <option value="">Seleccionar paciente</option>
                                {patients.map(patient => (
                                    <option key={patient.id} value={patient.id}>
                                        {patient.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                                <input
                                    type="date"
                                    value={newAppointment.date}
                                    onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                    min={formatDateForInput(new Date())}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
                                <input
                                    type="time"
                                    value={newAppointment.time}
                                    onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duración (minutos)</label>
                            <select
                                value={newAppointment.duration}
                                onChange={(e) => setNewAppointment({...newAppointment, duration: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="30">30 minutos</option>
                                <option value="45">45 minutos</option>
                                <option value="60">60 minutos</option>
                                <option value="90">90 minutos</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                            <textarea
                                value={newAppointment.notes}
                                onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                                placeholder="Notas adicionales sobre la cita..."
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-20 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select
                                value={newAppointment.status}
                                onChange={(e) => setNewAppointment({...newAppointment, status: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="pending">Pendiente</option>
                                <option value="confirmed">Confirmada</option>
                            </select>
                        </div>

                        <button
                            onClick={handleCreateAppointment}
                            disabled={isLoading || !newAppointment.patientId || !newAppointment.date}
                            className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold disabled:opacity-50 transition-colors flex items-center justify-center"
                        >
                            {isLoading ? <LoadingSpinner className="h-5 w-5 mr-2" /> : null}
                            Programar Cita
                        </button>
                    </div>
                </Modal>
            )}

            {/* Modal para Agregar Paciente */}
            {showAddPatientModal && (
                <Modal 
                    title="Agregar Nuevo Paciente"
                    onClose={() => setShowAddPatientModal(false)}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                            <input
                                type="text"
                                value={newPatient.name}
                                onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Nombre del paciente"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                value={newPatient.email}
                                onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="email@ejemplo.com"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input
                                    type="tel"
                                    value={newPatient.phone}
                                    onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="+34 123 456 789"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                                <input
                                    type="number"
                                    value={newPatient.age}
                                    onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="30"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                            <select
                                value={newPatient.gender}
                                onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Seleccionar</option>
                                <option value="male">Masculino</option>
                                <option value="female">Femenino</option>
                                <option value="other">Otro</option>
                                <option value="prefer_not_to_say">Prefiero no decir</option>
                            </select>
                        </div>

                        <button
                            onClick={handleAddPatient}
                            disabled={isLoading || !newPatient.name || !newPatient.email}
                            className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold disabled:opacity-50 transition-colors flex items-center justify-center"
                        >
                            {isLoading ? <LoadingSpinner className="h-5 w-5 mr-2" /> : null}
                            Agregar Paciente
                        </button>
                    </div>
                </Modal>
            )}

            {/* Modal para Editar Paciente */}
            {showEditPatientModal && editingPatient && (
                <Modal 
                    title="Editar Paciente"
                    onClose={() => setShowEditPatientModal(false)}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                            <input
                                type="text"
                                value={editingPatient.name}
                                onChange={(e) => setEditingPatient({...editingPatient, name: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Nombre del paciente"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={editingPatient.email}
                                disabled
                                className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                                placeholder="email@ejemplo.com"
                            />
                            <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input
                                    type="tel"
                                    value={editingPatient.phone || ''}
                                    onChange={(e) => setEditingPatient({...editingPatient, phone: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="+34 123 456 789"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                                <input
                                    type="number"
                                    value={editingPatient.age || ''}
                                    onChange={(e) => setEditingPatient({...editingPatient, age: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="30"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                            <select
                                value={editingPatient.gender || ''}
                                onChange={(e) => setEditingPatient({...editingPatient, gender: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Seleccionar</option>
                                <option value="male">Masculino</option>
                                <option value="female">Femenino</option>
                                <option value="other">Otro</option>
                                <option value="prefer_not_to_say">Prefiero no decir</option>
                            </select>
                        </div>

                        <button
                            onClick={handleEditPatient}
                            disabled={isLoading || !editingPatient.name.trim()}
                            className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold disabled:opacity-50 transition-colors flex items-center justify-center"
                        >
                            {isLoading ? <LoadingSpinner className="h-5 w-5 mr-2" /> : null}
                            Actualizar Paciente
                        </button>
                    </div>
                </Modal>
            )}

            {/* Modal para Datos Clínicos */}
            {showClinicalModal && selectedPatient && (
                <Modal 
                    title={`Datos Clínicos - ${selectedPatient.name}`}
                    onClose={() => setShowClinicalModal(false)}
                    size="large"
                >
                    <ClinicalDataSection 
                        selectedPatient={selectedPatient}
                        user={user}
                        onUpdate={() => {
                            // Recargar datos si es necesario
                        }}
                    />
                </Modal>
            )}
        </div>
    );
};

// Dashboard del Paciente COMPLETO Y CORREGIDO
const PatientDashboard = ({ user, handleLogout }) => {
    const [entry, setEntry] = useState('');
    const [logs, setLogs] = useState([]);
    const [showProfile, setShowProfile] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [modalInfo, setModalInfo] = useState({ show: false, message: '', type: 'info', title: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [characterCount, setCharacterCount] = useState(0);

    const handleEntryChange = (e) => {
        setEntry(e.target.value);
        setCharacterCount(e.target.value.length);
    };

    useEffect(() => {
        if (!user?.uid) return;
        
        const q = query(
            collection(db, `users/${user.uid}/emotionLogs`),
            orderBy("timestamp", "desc")
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                ...doc.data(), 
                id: doc.id, 
                timestamp: doc.data().timestamp?.toDate()
            }));
            setLogs(data);
        });
        
        return () => unsubscribe();
    }, [user.uid]);

    const handleAddEntry = async () => {
        if (!entry.trim()) {
            setModalInfo({
                show: true,
                message: 'Por favor escribe algo antes de guardar.',
                type: 'warning',
                title: 'Registro vacío'
            });
            return;
        }

        setIsLoading(true);
        try {
            await addDoc(collection(db, `users/${user.uid}/emotionLogs`), {
                timestamp: Timestamp.now(),
                entry: entry.trim()
            });
            setEntry('');
            setCharacterCount(0);
            setModalInfo({
                show: true,
                message: 'Tu registro ha sido guardado exitosamente.',
                type: 'success',
                title: 'Guardado'
            });
        } catch (error) {
            setModalInfo({
                show: true,
                message: `Error al guardar: ${error.message}`,
                type: 'error',
                title: 'Error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (newPassword.length < 6) {
            setModalInfo({
                show: true,
                message: 'La nueva contraseña debe tener al menos 6 caracteres.',
                type: 'warning',
                title: 'Contraseña muy corta'
            });
            return;
        }

        setIsLoading(true);
        try {
            await updatePassword(auth.currentUser, newPassword);
            setNewPassword('');
            setShowProfile(false);
            setModalInfo({
                show: true,
                message: 'Contraseña actualizada con éxito.',
                type: 'success',
                title: 'Contraseña actualizada'
            });
        } catch (error) {
            setModalInfo({
                show: true,
                message: `Error: ${error.message}`,
                type: 'error',
                title: 'Error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6">
            {modalInfo.show && (
                <Modal 
                    message={modalInfo.message} 
                    onClose={() => setModalInfo({show: false, message: '', type: 'info', title: ''})}
                    type={modalInfo.type}
                    title={modalInfo.title}
                />
            )}
            
            <header className="max-w-4xl mx-auto bg-white p-4 sm:p-6 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
                <div className="flex items-center mb-4 sm:mb-0">
                    <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                        <UserIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Hola, {user.name || user.email.split('@')[0]}</h1>
                        <p className="text-sm text-gray-500">{logs.length} registros guardados</p>
                    </div>
                </div>
                
                <div className='flex items-center space-x-2'>
                    <button 
                        onClick={() => setShowProfile(!showProfile)}
                        className="font-semibold text-indigo-600 hover:text-indigo-800 p-2 transition-colors"
                    >
                        Mi Perfil
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-medium transition-colors flex items-center"
                    >
                        <LogoutIcon className="h-4 w-4 mr-1" />
                        Salir
                    </button>
                </div>
            </header>
            
            <main className="max-w-4xl mx-auto">
                {showProfile ? (
                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Configuración de Perfil</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-medium text-gray-600 block mb-2">
                                    Cambiar Contraseña
                                </label>
                                <input 
                                    type="password" 
                                    value={newPassword} 
                                    onChange={e => setNewPassword(e.target.value)} 
                                    placeholder="Nueva contraseña segura (mín. 6 caracteres)"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                />
                            </div>
                            <div className="flex space-x-3">
                                <button 
                                    onClick={handleUpdatePassword}
                                    disabled={isLoading || newPassword.length < 6}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
                                >
                                    {isLoading ? <LoadingSpinner className="h-5 w-5 mr-2" /> : null}
                                    Guardar Contraseña
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowProfile(false);
                                        setNewPassword('');
                                    }}
                                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-8">
                            <div className="flex items-center mb-4">
                                <div className="bg-red-100 p-2 rounded-lg mr-3">
                                    <HeartIcon className="h-6 w-6 text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Mi Diario de Emociones</h2>
                                    <p className="text-gray-600">¿Cómo te sientes hoy? Comparte tus pensamientos y emociones.</p>
                                </div>
                            </div>
                            
                            <textarea 
                                value={entry} 
                                onChange={handleEntryChange}
                                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors h-40 resize-none"
                                placeholder="Escribe sobre tus pensamientos, emociones, recuerdos o cualquier cosa que quieras registrar..."
                                maxLength={1000}
                            />
                            
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4">
                                <div className="text-sm text-gray-500 mb-2 sm:mb-0">
                                    {characterCount}/1000 caracteres
                                </div>
                                <button 
                                    onClick={handleAddEntry}
                                    disabled={!entry.trim() || isLoading}
                                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                                >
                                    {isLoading ? <LoadingSpinner className="h-5 w-5 mr-2" /> : null}
                                    Guardar Registro
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                            <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                                <CalendarIcon className="h-6 w-6" />
                                <span className="ml-2">Mis Registros Anteriores</span>
                            </h3>
                            
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {logs.map(log => (
                                    <div key={log.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors">
                                        <div className="flex items-center text-sm text-gray-600 mb-2">
                                            <CalendarIcon />
                                            {log.timestamp?.toLocaleDateString('es-ES', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric',
                                                hour: '2-digit', 
                                                minute: '2-digit'
                                            })}
                                        </div>
                                        <p className="text-gray-700 whitespace-pre-wrap">{log.entry}</p>
                                    </div>
                                ))}
                                {logs.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p>Aún no tienes registros emocionales.</p>
                                        <p className="text-sm">¡Comienza escribiendo tu primer registro!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL MEJORADO ---
const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserData({ uid: user.uid, ...userDoc.data() });
                } else {
                    setUserData({ uid: user.uid, email: user.email });
                }
                setUser(user);
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    if (!user) {
        return <AuthScreen setUser={setUser} />;
    }

    if (userData?.role === 'psychologist') {
        return <PsychologistDashboard user={userData} handleLogout={handleLogout} />;
    }

    return <PatientDashboard user={userData} handleLogout={handleLogout} />;
};

export default App;
