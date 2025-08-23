import React, { useState, useEffect, useRef } from 'react';
// Importations Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, setLogLevel } from 'firebase/firestore';

// --- Icônes SVG pour l'interface ---
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const ArchiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;


// --- Données par défaut ---
const initialData = {
  offers: {
    initiale: { 
      name: 'Offre Initiale', 
      residentiel: { price: 1500, mensualite: 29.99 },
      professionnel: { price: 1800, mensualite: 39.99 }
    },
    optimale: { 
      name: 'Offre Optimale', 
      residentiel: { price: 2500, mensualite: 49.99 },
      professionnel: { price: 2900, mensualite: 59.99 }
    },
  },
  packs: {
    argent: { 
      name: 'Pack Argent', 
      residentiel: { price: 500, mensualite: 10 },
      professionnel: { price: 600, mensualite: 15 }
    },
    or: { 
      name: 'Pack Or', 
      residentiel: { price: 1000, mensualite: 20 },
      professionnel: { price: 1200, mensualite: 25 }
    },
    platine: { 
      name: 'Pack Platine', 
      residentiel: { price: 1500, mensualite: 30 },
      professionnel: { price: 1800, mensualite: 35 }
    },
  },
  extraItems: [],
  discounts: [
    { id: 'BIENVENUE50', code: 'BIENVENUE50', value: 50, active: true, type: 'materiel' },
    { id: 'ABO5', code: 'ABO5', value: 5, active: true, type: 'abonnement' },
  ],
  settings: {
      installationFee: 350,
      vat: {
          residentiel: 0.10,
          professionnel: 0.20
      }
  }
};

// --- Composants du Back-Office ---

const SectionCard = ({ title, children }) => (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
        {children}
    </div>
);

const PriceInput = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <input type="number" value={value} onChange={onChange} className="p-2 border rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"/>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">€</span></div>
        </div>
    </div>
);

const PercentageInput = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <input type="number" value={value * 100} onChange={onChange} className="p-2 border rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"/>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">%</span></div>
        </div>
    </div>
);

const DifferentiatedProductInputs = ({ name, data, onChange }) => (
    <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
        <h3 className="font-semibold text-gray-900 text-lg text-center">{name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prix Résidentiel */}
            <div className="p-3 bg-white rounded-md border">
                <h4 className="font-semibold text-gray-700 mb-2">Particulier</h4>
                <div className="space-y-2">
                    <PriceInput label="Prix Achat" value={data.residentiel?.price || 0} onChange={(e) => onChange('residentiel', 'price', e.target.value)} />
                    <PriceInput label="Mensualité" value={data.residentiel?.mensualite || 0} onChange={(e) => onChange('residentiel', 'mensualite', e.target.value)} />
                </div>
            </div>
            {/* Prix Professionnel */}
            <div className="p-3 bg-white rounded-md border">
                <h4 className="font-semibold text-gray-700 mb-2">Professionnel</h4>
                <div className="space-y-2">
                    <PriceInput label="Prix Achat" value={data.professionnel?.price || 0} onChange={(e) => onChange('professionnel', 'price', e.target.value)} />
                    <PriceInput label="Mensualité" value={data.professionnel?.mensualite || 0} onChange={(e) => onChange('professionnel', 'mensualite', e.target.value)} />
                </div>
            </div>
        </div>
    </div>
);


const DevisList = ({ db, appId }) => {
    const [quotes, setQuotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchQuotes = async () => {
            if (!db || !appId) return;
            try {
                const quotesPath = `/artifacts/${appId}/public/data/devis`;
                const q = query(collection(db, quotesPath));
                const querySnapshot = await getDocs(q);
                const quotesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                quotesList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setQuotes(quotesList);
            } catch (error) {
                console.error("Erreur lors de la récupération des devis:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuotes();
    }, [db, appId]);

    if (isLoading) {
        return <p className="text-center text-gray-500">Chargement des devis...</p>;
    }

    if (quotes.length === 0) {
        return <p className="text-center text-gray-500">Aucun devis réalisé pour le moment.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Commercial</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Client</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Date Création</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Montant TTC</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Date d'installation</th>
                    </tr>
                </thead>
                <tbody>
                    {quotes.map(quote => (
                        <tr key={quote.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{quote.salesperson || 'N/A'}</td>
                            <td className="py-3 px-4">{quote.client.prenom} {quote.client.nom}</td>
                            <td className="py-3 px-4">{quote.createdAt ? new Date(quote.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                            <td className="py-3 px-4">{quote.calculation?.oneTimeTotal?.toFixed(2) || 'N/A'} €</td>
                            <td className="py-3 px-4">
                                {quote.installationDate ? (
                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        {new Date(quote.installationDate).toLocaleDateString()}
                                    </span>
                                ) : (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        Non planifiée
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
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
              storageBucket: "application-devis-f2a31.firebasestorage.app",
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

  const handleSave = async () => {
    if (!configDocRef.current) return;
    setNotification('Sauvegarde en cours...');
    try {
        await setDoc(configDocRef.current, config);
        setNotification('Configuration sauvegardée avec succès !');
    } catch (error) {
        setNotification('Erreur lors de la sauvegarde.');
    } finally {
        setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleProductChange = (category, key, type, field, value) => {
    setConfig(prev => ({
        ...prev,
        [category]: {
            ...prev[category],
            [key]: {
                ...prev[category][key],
                [type]: {
                    ...(prev[category][key][type] || {}),
                    [field]: parseFloat(value) || 0
                }
            }
        }
    }));
  };

  const handleExtraItemChange = (index, field, value) => {
    const newItems = [...config.extraItems];
    newItems[index] = { ...newItems[index], [field]: field === 'price' ? parseFloat(value) || 0 : value };
    setConfig(prev => ({ ...prev, extraItems: newItems }));
  };
  
  const addExtraItem = () => setConfig(prev => ({...prev, extraItems: [...prev.extraItems, { id: `new_${Date.now()}`, name: 'Nouvel élément', price: 0 }]}));
  const removeExtraItem = (index) => setConfig(prev => ({...prev, extraItems: config.extraItems.filter((_, i) => i !== index)}));
  
  const handleDiscountChange = (index, field, value) => {
    const newDiscounts = [...config.discounts];
    let finalValue = value;
    if (field === 'value') finalValue = parseFloat(value) || 0;
    if (field === 'code') finalValue = value.toUpperCase();
    newDiscounts[index] = { ...newDiscounts[index], [field]: finalValue };
    setConfig(prev => ({...prev, discounts: newDiscounts}));
  };
  
  const addDiscount = () => setConfig(prev => ({...prev, discounts: [...prev.discounts, { id: `new_${Date.now()}`, code: 'NOUVEAUCODE', value: 10, active: true, type: 'materiel' }]}));
  const removeDiscount = (index) => setConfig(prev => ({...prev, discounts: config.discounts.filter((_, i) => i !== index)}));
  
  const handleSettingsChange = (field, value, subfield = null) => {
    if (subfield) {
        setConfig(prev => ({ ...prev, settings: { ...prev.settings, [field]: { ...prev.settings[field], [subfield]: parseFloat(value) / 100 || 0 }}}));
    } else {
        setConfig(prev => ({ ...prev, settings: { ...prev.settings, [field]: parseFloat(value) || 0 }}));
    }
  };

  if (isLoading || !config) {
      return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p className="text-gray-600 animate-pulse">Chargement du back-office...</p></div>
  }

  const renderContent = () => {
    switch(activeTab) {
        case 'devis':
            return <SectionCard title="Devis Réalisés"><DevisList db={dbRef.current} appId={appIdRef.current} /></SectionCard>;
        case 'products':
            return (
                <>
                    <SectionCard title="Offres Principales">
                        <div className="space-y-4">
                            {Object.entries(config.offers).map(([key, offer]) => (
                                <DifferentiatedProductInputs key={key} name={offer.name} data={offer} onChange={(type, field, value) => handleProductChange('offers', key, type, field, value)} />
                            ))}
                        </div>
                    </SectionCard>
                    <SectionCard title="Packs Supplémentaires">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {Object.entries(config.packs).map(([key, pack]) => (
                                <DifferentiatedProductInputs key={key} name={pack.name} data={pack} onChange={(type, field, value) => handleProductChange('packs', key, type, field, value)} />
                            ))}
                        </div>
                    </SectionCard>
                </>
            );
        case 'items':
            return <SectionCard title="Éléments Supplémentaires (Achat unique)">
                    <div className="space-y-4">
                        {config.extraItems.map((item, index) => (
                            <div key={item.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-3 bg-gray-50 rounded-md">
                                <input type="text" value={item.name} onChange={(e) => handleExtraItemChange(index, 'name', e.target.value)} className="p-2 border rounded-md flex-grow" placeholder="Nom de l'élément" />
                                <div className="sm:w-40 flex-shrink-0"><PriceInput label="" value={item.price} onChange={(e) => handleExtraItemChange(index, 'price', e.target.value)} /></div>
                                <button onClick={() => removeExtraItem(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full self-center sm:self-auto"><TrashIcon /></button>
                            </div>
                        ))}
                        <button onClick={addExtraItem} className="flex items-center gap-2 text-blue-600 font-semibold mt-4 hover:text-blue-800"><PlusCircleIcon /> Ajouter un élément</button>
                    </div>
                </SectionCard>;
        case 'discounts':
            return <SectionCard title="Codes de Réduction">
                    <div className="space-y-4">
                        {config.discounts.map((discount, index) => (
                            <div key={discount.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 items-center gap-4 p-3 bg-gray-50 rounded-md">
                                <input type="text" value={discount.code} onChange={(e) => handleDiscountChange(index, 'code', e.target.value)} className="p-2 border rounded-md lg:col-span-4" placeholder="CODEPROMO" />
                                <div className="lg:col-span-3">
                                    <PriceInput label="Montant de la remise" value={discount.value} onChange={(e) => handleDiscountChange(index, 'value', e.target.value)} />
                                </div>
                                <select value={discount.type} onChange={(e) => handleDiscountChange(index, 'type', e.target.value)} className="p-2 border rounded-md bg-white lg:col-span-3">
                                    <option value="materiel">Matériel</option>
                                    <option value="abonnement">Abonnement</option>
                                </select>
                                <div className="flex items-center justify-between lg:col-span-2">
                                    <label className="flex items-center gap-2 p-2 bg-white border rounded-md cursor-pointer">
                                        <input type="checkbox" checked={discount.active} onChange={(e) => handleDiscountChange(index, 'active', e.target.checked)} className="h-4 w-4 rounded text-indigo-600"/>
                                        <span>Actif</span>
                                    </label>
                                    <button onClick={() => removeDiscount(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon /></button>
                                </div>
                            </div>
                        ))}
                        <button onClick={addDiscount} className="flex items-center gap-2 text-blue-600 font-semibold mt-4 hover:text-blue-800"><PlusCircleIcon /> Ajouter un code</button>
                    </div>
                </SectionCard>;
        case 'settings':
            return <SectionCard title="Paramètres Généraux">
                    <div className="space-y-4 max-w-sm">
                        <PriceInput label="Frais d'installation" value={config.settings.installationFee} onChange={e => handleSettingsChange('installationFee', e.target.value)} />
                        <hr/><h3 className="font-semibold pt-2 text-gray-800">Taux de TVA</h3>
                        <PercentageInput label="TVA Résidentiel" value={config.settings.vat.residentiel} onChange={e => handleSettingsChange('vat', e.target.value, 'residentiel')} />
                        <PercentageInput label="TVA Professionnel" value={config.settings.vat.professionnel} onChange={e => handleSettingsChange('vat', e.target.value, 'professionnel')} />
                    </div>
                </SectionCard>;
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
                <TabButton tabName="products" label="Offres & Packs" icon={<TagIcon />} />
                <TabButton tabName="items" label="Éléments" icon={<ListIcon />} />
                <TabButton tabName="discounts" label="Réductions" icon={<TagIcon />} />
                <TabButton tabName="settings" label="Paramètres" icon={<SettingsIcon />} />
            </div>

            <div>
                {renderContent()}
            </div>
        </main>
        
        {notification && (
            <div className="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-5 rounded-lg shadow-lg animate-pulse z-20">
                {notification}
            </div>
        )}
    </div>
  );
}
