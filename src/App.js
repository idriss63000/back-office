import React, { useState, useEffect, useRef } from 'react';
// Importations Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, setLogLevel, onSnapshot, addDoc, deleteDoc, where } from 'firebase/firestore';

// --- Icônes SVG ---
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const ArchiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;

// --- Données par défaut ---
const initialData = { /* ... */ };

// --- Composants du Back-Office ---

const SectionCard = ({ title, children }) => ( <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6"> <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2> {children} </div> );
const PriceInput = ({ label, value, onChange }) => ( <div> <label className="block text-sm font-medium text-gray-700">{label}</label> <div className="mt-1 relative rounded-md shadow-sm"> <input type="number" value={value} onChange={onChange} className="p-2 border rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"/> <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">€</span></div> </div> </div> );
const PercentageInput = ({ label, value, onChange }) => ( <div> <label className="block text-sm font-medium text-gray-700">{label}</label> <div className="mt-1 relative rounded-md shadow-sm"> <input type="number" value={value * 100} onChange={onChange} className="p-2 border rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"/> <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">%</span></div> </div> </div> );
const DifferentiatedProductInputs = ({ name, data, onChange }) => ( <div className="p-4 border rounded-lg bg-gray-50 space-y-4"> <h3 className="font-semibold text-gray-900 text-lg text-center">{name}</h3> <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> <div className="p-3 bg-white rounded-md border"> <h4 className="font-semibold text-gray-700 mb-2">Particulier</h4> <div className="space-y-2"> <PriceInput label="Prix Achat" value={data.residentiel?.price || 0} onChange={(e) => onChange('residentiel', 'price', e.target.value)} /> <PriceInput label="Mensualité" value={data.residentiel?.mensualite || 0} onChange={(e) => onChange('residentiel', 'mensualite', e.target.value)} /> </div> </div> <div className="p-3 bg-white rounded-md border"> <h4 className="font-semibold text-gray-700 mb-2">Professionnel</h4> <div className="space-y-2"> <PriceInput label="Prix Achat" value={data.professionnel?.price || 0} onChange={(e) => onChange('professionnel', 'price', e.target.value)} /> <PriceInput label="Mensualité" value={data.professionnel?.mensualite || 0} onChange={(e) => onChange('professionnel', 'mensualite', e.target.value)} /> </div> </div> </div> </div> );

const AppointmentListBackOffice = ({ db, appId }) => { /* ... */ };
const DevisList = ({ db, appId }) => { /* ... */ };

// --- NOUVEAU COMPOSANT : Gestion des Commerciaux ---
const SalespersonManager = ({ db, appId }) => {
    const [salespersons, setSalespersons] = useState([]);
    const [newSalespersonName, setNewSalespersonName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const salespersonsCollectionRef = collection(db, `/artifacts/${appId}/public/data/salespersons`);

    useEffect(() => {
        const unsubscribe = onSnapshot(salespersonsCollectionRef, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSalespersons(list);
            setIsLoading(false);
        }, (err) => {
            console.error("Erreur de lecture des commerciaux:", err);
            setError("Impossible de charger la liste des commerciaux.");
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [db, appId]);

    const handleAddSalesperson = async () => {
        const name = newSalespersonName.trim();
        if (!name) {
            setError("Le nom ne peut pas être vide.");
            return;
        }
        if (salespersons.some(s => s.name.toLowerCase() === name.toLowerCase())) {
            setError("Ce commercial existe déjà.");
            return;
        }
        setError('');
        try {
            await addDoc(salespersonsCollectionRef, { name: name });
            setNewSalespersonName('');
        } catch (err) {
            console.error("Erreur d'ajout du commercial:", err);
            setError("Une erreur est survenue lors de l'ajout.");
        }
    };

    const handleDeleteSalesperson = async (id) => {
        try {
            await deleteDoc(doc(db, `/artifacts/${appId}/public/data/salespersons`, id));
        } catch (err) {
            console.error("Erreur de suppression du commercial:", err);
            setError("Une erreur est survenue lors de la suppression.");
        }
    };

    if (isLoading) return <p>Chargement...</p>;

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={newSalespersonName} 
                    onChange={(e) => setNewSalespersonName(e.target.value)}
                    placeholder="Nom du nouveau commercial"
                    className="p-2 border rounded-md flex-grow"
                />
                <button onClick={handleAddSalesperson} className="bg-blue-600 text-white font-semibold px-4 rounded-md hover:bg-blue-700">Ajouter</button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="space-y-3">
                {salespersons.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <span className="font-medium">{s.name}</span>
                        <button onClick={() => handleDeleteSalesperson(s.id)} className="text-red-500 hover:text-red-700"><TrashIcon /></button>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default function App() {
    const [config, setConfig] = useState(null);
    const [activeTab, setActiveTab] = useState('devis');
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState('');
    
    const dbRef = useRef(null);
    const configDocRef = useRef(null);
    const appIdRef = useRef(null);

    useEffect(() => {
        const initFirebase = async () => {
             try {
                const firebaseConfig = {
                    apiKey: "AIzaSyC19fhi-zWc-zlgZgjcQ7du2pK7CaywyO0",
                    authDomain: "application-devis-f2a31.firebaseapp.com",
                    projectId: "application-devis-f2a31",
                    storageBucket: "application-devis-f2a31.appspot.com",
                    messagingSenderId: "960846329322",
                    appId: "1:960846329322:web:5802132e187aa131906e93",
                    measurementId: "G-1F9T98PGS9"
                };
                const appId = firebaseConfig.appId;
                appIdRef.current = appId;
                const app = initializeApp(firebaseConfig);
                const db = getFirestore(app);
                const auth = getAuth(app);
                dbRef.current = db;
                setLogLevel('debug');
                await signInAnonymously(auth);
                const docPath = `/artifacts/${appId}/public/data/config/main`;
                configDocRef.current = doc(db, docPath);
                const docSnap = await getDoc(configDocRef.current);
                if (docSnap.exists()) setConfig(docSnap.data());
                else {
                    await setDoc(configDocRef.current, initialData);
                    setConfig(initialData);
                }
            } catch (error) {
                setConfig(initialData);
            } finally {
                setIsLoading(false);
            }
        };
        initFirebase();
    }, []);

    const handleSave = async () => { /* ... */ };
    const handleProductChange = (category, key, type, field, value) => { /* ... */ };
    const handleOfferFieldChange = (key, field, value) => { /* ... */ };
    const handleExtraItemChange = (index, field, value) => { /* ... */ };
    const addExtraItem = () => { /* ... */ };
    const removeExtraItem = (index) => { /* ... */ };
    const handleDiscountChange = (index, field, value) => { /* ... */ };
    const addDiscount = () => { /* ... */ };
    const removeDiscount = (index) => { /* ... */ };
    const handleSettingsChange = (field, value, subfield = null) => { /* ... */ };

    if (isLoading || !config) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p className="text-gray-600 animate-pulse">Chargement du back-office...</p></div>
    }

    const renderContent = () => {
        switch(activeTab) {
            case 'devis': return <SectionCard title="Devis Réalisés"><DevisList db={dbRef.current} appId={appIdRef.current} /></SectionCard>;
            case 'appointments': return <SectionCard title="Rendez-vous Commerciaux"><AppointmentListBackOffice db={dbRef.current} appId={appIdRef.current} /></SectionCard>;
            case 'salespersons': return <SectionCard title="Gérer les Commerciaux"><SalespersonManager db={dbRef.current} appId={appIdRef.current} /></SectionCard>;
            case 'products': return ( <> ... </> );
            case 'items': return ( <SectionCard title="Éléments Supplémentaires (Achat unique)"> ... </SectionCard> );
            case 'discounts': return ( <SectionCard title="Codes de Réduction"> ... </SectionCard> );
            case 'settings': return ( <SectionCard title="Paramètres Généraux"> ... </SectionCard> );
        }
    }

    const TabButton = ({ tabName, label, icon }) => (
        <button onClick={() => setActiveTab(tabName)} className={`flex items-center justify-center md:justify-start gap-3 px-4 py-2 rounded-md font-semibold transition flex-1 md:flex-none ${activeTab === tabName ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
            {icon}
            <span className="hidden md:inline">{label}</span>
        </button>
    )

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Back-Office</h1>
                    <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-3 sm:px-4 rounded-lg hover:bg-blue-700 transition shadow text-sm sm:text-base">
                        <SaveIcon /> <span className="hidden sm:inline">Sauvegarder</span>
                    </button>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8 py-6">
                <div className="mb-6 p-1 sm:p-2 bg-gray-200 rounded-lg flex flex-wrap gap-1 sm:gap-2">
                    <TabButton tabName="devis" label="Devis" icon={<ArchiveIcon />} />
                    <TabButton tabName="appointments" label="Rendez-vous" icon={<CalendarIcon />} />
                    <TabButton tabName="salespersons" label="Commerciaux" icon={<UsersIcon />} />
                    <TabButton tabName="products" label="Offres & Packs" icon={<TagIcon />} />
                    <TabButton tabName="items" label="Éléments" icon={<ListIcon />} />
                    <TabButton tabName="discounts" label="Réductions" icon={<TagIcon />} />
                    <TabButton tabName="settings" label="Paramètres" icon={<SettingsIcon />} />
                </div>
                <div>{renderContent()}</div>
            </main>
            {notification && ( <div className="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-5 rounded-lg shadow-lg animate-pulse z-20">{notification}</div> )}
        </div>
    );
}

