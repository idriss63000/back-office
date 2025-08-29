/* global __firebase_config, __app_id, __initial_auth_token */
import React, { useState, useEffect, useRef, useMemo } from 'react';
// Importations Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, setLogLevel, onSnapshot, addDoc, deleteDoc, where, serverTimestamp } from 'firebase/firestore';

// --- Icônes SVG pour l'interface ---
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0 2l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const ArchiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const VideoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;
const BarChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;

// --- Données par défaut ---
const initialData = {
  offers: {
    initiale: { name: 'Offre Initiale', description: 'Description de base pour l\'offre initiale.', residentiel: { price: 1500, mensualite: 29.99 }, professionnel: { price: 1800, mensualite: 39.99 } },
    optimale: { name: 'Offre Optimale', description: 'Description complète pour l\'offre optimale.', residentiel: { price: 2500, mensualite: 49.99 }, professionnel: { price: 2900, mensualite: 59.99 } },
  },
  packs: {
    argent: { name: 'Pack Argent', residentiel: { price: 500, mensualite: 10 }, professionnel: { price: 600, mensualite: 15 } },
    or: { name: 'Pack Or', residentiel: { price: 1000, mensualite: 20 }, professionnel: { price: 1200, mensualite: 25 } },
    platine: { name: 'Pack Platine', residentiel: { price: 1500, mensualite: 30 }, professionnel: { price: 1800, mensualite: 35 } },
  },
  extraItems: [],
  discounts: [],
  settings: { installationFee: 350, vat: { residentiel: 0.10, professionnel: 0.20 } }
};

// --- Composants du Back-Office ---

const ConfirmationModal = ({ title, message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500">{message}</p>
                    </div>
                </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={onConfirm}
                >
                    Confirmer
                </button>
                <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={onCancel}
                >
                    Annuler
                </button>
            </div>
        </div>
    </div>
);


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
            <div className="p-3 bg-white rounded-md border">
                <h4 className="font-semibold text-gray-700 mb-2">Particulier</h4>
                <div className="space-y-2">
                    <PriceInput label="Prix Achat" value={data.residentiel?.price || 0} onChange={(e) => onChange('residentiel', 'price', e.target.value)} />
                    <PriceInput label="Mensualité" value={data.residentiel?.mensualite || 0} onChange={(e) => onChange('residentiel', 'mensualite', e.target.value)} />
                </div>
            </div>
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

const Dashboard = ({ db, appId }) => {
    const [stats, setStats] = useState({ totalQuotes: 0, totalRevenue: 0, totalAppointments: 0, confirmedAppointments: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!db || !appId) {
            setIsLoading(false);
            return;
        }

        const fetchAllData = async () => {
            try {
                const quotesPath = `/artifacts/${appId}/public/data/devis`;
                const appointmentsPath = `/artifacts/${appId}/public/data/appointments`;

                const quotesQuery = query(collection(db, quotesPath));
                const appointmentsQuery = query(collection(db, appointmentsPath));

                const [quotesSnapshot, appointmentsSnapshot] = await Promise.all([
                    getDocs(quotesQuery),
                    getDocs(appointmentsQuery)
                ]);

                const quotesData = quotesSnapshot.docs.map(doc => doc.data());
                const totalQuotes = quotesData.length;
                const totalRevenue = quotesData.reduce((sum, quote) => sum + (quote.calculation?.oneTimeTotal || 0), 0);

                const appointmentsData = appointmentsSnapshot.docs.map(doc => doc.data());
                const totalAppointments = appointmentsData.length;
                const confirmedAppointments = appointmentsData.filter(app => app.status === 'confirmé').length;

                setStats({ totalQuotes, totalRevenue, totalAppointments, confirmedAppointments });
            } catch (error) {
                console.error("Erreur lors du calcul des statistiques:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, [db, appId]);

    if (isLoading) return <p>Chargement des données du tableau de bord...</p>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Total des Devis</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalQuotes}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Chiffre d'Affaires Potentiel</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Rendez-vous créés</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalAppointments}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Rendez-vous confirmés</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.confirmedAppointments}</p>
            </div>
        </div>
    );
};


const DevisList = ({ db, appId }) => {
    const [quotes, setQuotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!db || !appId) {
            setIsLoading(false);
            return;
        }
        const quotesPath = `/artifacts/${appId}/public/data/devis`;
        const q = query(collection(db, quotesPath));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const quotesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            quotesList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setQuotes(quotesList);
            setError(null);
            setIsLoading(false);
        }, (err) => {
            console.error("Erreur de lecture des devis:", err);
            setError("Impossible de charger les devis. Vérifiez les permissions Firestore.");
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [db, appId]);

    if (isLoading) return <p className="text-center text-gray-500">Chargement des devis...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (quotes.length === 0) return <p className="text-center text-gray-500">Aucun devis réalisé pour le moment.</p>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Commercial</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Client</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Date Création</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Montant TTC</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Statut</th>
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
                                        Install. le {new Date(quote.installationDate).toLocaleDateString()}
                                    </span>
                                ) : quote.followUpDate ? (
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        Relance le {new Date(quote.followUpDate).toLocaleDateString()}
                                    </span>
                                ) : (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">En attente</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AppointmentListBO = ({ db, appId }) => {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!db || !appId) {
            setIsLoading(false);
            return;
        }
        const appointmentsPath = `/artifacts/${appId}/public/data/appointments`;
        const q = query(collection(db, appointmentsPath));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setAppointments(list);
            setError(null);
            setIsLoading(false);
        }, (err) => {
            console.error("Erreur de lecture des RDV:", err);
            setError("Impossible de charger les rendez-vous. Vérifiez les permissions Firestore.");
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [db, appId]);

    const loadScript = (src) => new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Script load error for ${src}`));
        document.body.appendChild(script);
    });

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await loadScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");
            const dataToExport = appointments.map(app => ({
                'Commercial': app.salesperson,
                'Prospect': app.clientName,
                'Date': app.date ? new Date(app.date).toLocaleDateString() : '',
                'Heure': app.time,
                'Adresse': app.address,
                'Téléphone': app.phone,
                'Statut': app.status
            }));
            const worksheet = window.XLSX.utils.json_to_sheet(dataToExport);
            const workbook = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(workbook, worksheet, "Rendez-vous");
            window.XLSX.writeFile(workbook, "Export_Rendez-vous.xlsx");
        } catch (error) {
            console.error("Erreur lors de l'export Excel:", error);
        } finally {
            setIsExporting(false);
        }
    };


    if (isLoading) return <p className="text-center text-gray-500">Chargement des rendez-vous...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={handleExport} disabled={isExporting || appointments.length === 0} className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition shadow disabled:bg-gray-400">
                    <DownloadIcon />
                    {isExporting ? 'Exportation...' : 'Exporter en Excel'}
                </button>
            </div>
            {appointments.length === 0 ? (
                <p className="text-center text-gray-500">Aucun rendez-vous pour le moment.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Commercial</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Prospect</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Date & Heure</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Adresse</th>
                                <th className="text-left py-3 px-4 font-semibold text-sm">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(app => (
                                <tr key={app.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">{app.salesperson}</td>
                                    <td className="py-3 px-4">{app.clientName}</td>
                                    <td className="py-3 px-4">{app.date ? new Date(app.date).toLocaleDateString() : ''} à {app.time}</td>
                                    <td className="py-3 px-4">{app.address}</td>
                                    <td className="py-3 px-4">{app.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const SalespersonsManager = ({ db, appId }) => {
    const [salespersons, setSalespersons] = useState([]);
    const [newSalesperson, setNewSalesperson] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [addError, setAddError] = useState('');

    const salespersonsPath = useMemo(() => `/artifacts/${appId}/public/data/salespersons`, [appId]);

    useEffect(() => {
        if (!db || !appId) {
             setIsLoading(false);
             return;
        }
        const q = query(collection(db, salespersonsPath));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSalespersons(list);
            setIsLoading(false);
        }, (error) => {
            console.error("Erreur de lecture des commerciaux:", error);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [db, appId, salespersonsPath]);

    const handleAdd = async () => {
        setAddError('');
        if (newSalesperson.trim() === '') return;
        
        if (!db) {
            setAddError("La connexion à la base de données n'est pas disponible.");
            return;
        }

        const q = query(collection(db, salespersonsPath), where("name", "==", newSalesperson.trim()));
        const existing = await getDocs(q);
        if (existing.empty) {
            await addDoc(collection(db, salespersonsPath), { name: newSalesperson.trim(), createdAt: serverTimestamp() });
            setNewSalesperson('');
        } else {
            console.error("Ce commercial existe déjà.");
            setAddError(`Le commercial "${newSalesperson.trim()}" existe déjà.`);
        }
    };

    const confirmDelete = async () => {
        if (!deletingId || !db) return;
        await deleteDoc(doc(db, salespersonsPath, deletingId));
        setDeletingId(null);
    };

    if (isLoading) return <p className="text-center text-gray-500">Chargement...</p>;

    return (
        <div className="space-y-4">
            {deletingId && (
                <ConfirmationModal 
                    title="Supprimer le commercial ?"
                    message="Cette action est irréversible. Voulez-vous vraiment continuer ?"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeletingId(null)}
                />
            )}
            <div className="flex gap-2">
                <input
                    value={newSalesperson}
                    onChange={(e) => {
                        setNewSalesperson(e.target.value);
                        setAddError('');
                    }}
                    placeholder="Nom du nouveau commercial"
                    className="p-2 border rounded-md w-full"
                />
                <button onClick={handleAdd} className="bg-blue-600 text-white px-4 rounded-md font-semibold">Ajouter</button>
            </div>
            {addError && <p className="text-red-500 text-sm mt-2">{addError}</p>}
            <div className="space-y-2">
                {salespersons.map(sp => (
                    <div key={sp.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                        <span>{sp.name}</span>
                        <button onClick={() => setDeletingId(sp.id)} className="text-red-500 hover:text-red-700">
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PresentationManager = ({ db, appId }) => {
    const [videos, setVideos] = useState([]);
    const [newVideoTitle, setNewVideoTitle] = useState('');
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const videosPath = useMemo(() => `/artifacts/${appId}/public/data/presentationVideos`, [appId]);

    useEffect(() => {
        if (!db || !appId) {
            setIsLoading(false);
            return;
        }
        const q = query(collection(db, videosPath));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setVideos(list);
            setIsLoading(false);
        }, (error) => {
            console.error("Erreur de lecture des vidéos:", error);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [db, appId, videosPath]);

    const handleAdd = async () => {
        if (newVideoTitle.trim() === '' || newVideoUrl.trim() === '' || !db) return;
        await addDoc(collection(db, videosPath), { title: newVideoTitle.trim(), url: newVideoUrl.trim() });
        setNewVideoTitle('');
        setNewVideoUrl('');
    };
    
    const confirmDelete = async () => {
        if (!deletingId || !db) return;
        await deleteDoc(doc(db, videosPath, deletingId));
        setDeletingId(null);
    };

    if (isLoading) return <p className="text-center text-gray-500">Chargement des vidéos...</p>;

    return (
        <div className="space-y-4">
             {deletingId && (
                <ConfirmationModal 
                    title="Supprimer la vidéo ?"
                    message="Êtes-vous sûr de vouloir retirer cette vidéo de la présentation ?"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeletingId(null)}
                />
            )}
             <div className="p-4 border-l-4 border-blue-500 bg-blue-50 text-blue-800">
                <p className="font-bold">Comment ajouter une vidéo Google Drive ?</p>
                <p className="text-sm">1. Dans Google Drive, ouvrez la vidéo et cliquez sur "Partager".</p>
                <p className="text-sm">2. Assurez-vous que l'accès est réglé sur "Tous les utilisateurs disposant du lien".</p>
                <p className="text-sm">3. Copiez le lien et collez-le ci-dessous.</p>
             </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    placeholder="Titre de la vidéo"
                    className="p-2 border rounded-md w-full sm:w-1/3"
                />
                 <input
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="URL de la vidéo Google Drive"
                    className="p-2 border rounded-md w-full"
                />
                <button onClick={handleAdd} className="bg-blue-600 text-white px-4 rounded-md font-semibold">Ajouter</button>
            </div>
            <div className="space-y-2">
                {videos.map(video => (
                    <div key={video.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div>
                            <p className="font-semibold">{video.title}</p>
                            <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline break-all">{video.url}</a>
                        </div>
                        <button onClick={() => setDeletingId(video.id)} className="text-red-500 hover:text-red-700 ml-4">
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default function App() {
  const [config, setConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState('');
  
  const dbRef = useRef(null);
  const configDocRef = useRef(null);
  const appIdRef = useRef(null);

  useEffect(() => {
    const initFirebase = async () => {
        try {
            // CORRIGÉ: Rétablissement de la logique pour utiliser les variables d'environnement
            if (typeof __firebase_config === 'undefined' || typeof __app_id === 'undefined') {
                console.error("Firebase config non disponible. L'application ne pourra pas se connecter à la base de données.");
                setConfig(initialData);
                return;
            }

            const firebaseConfig = JSON.parse(__firebase_config);
            const appId = __app_id;
            appIdRef.current = appId;

            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            const auth = getAuth(app);
            dbRef.current = db;
            setLogLevel('debug');
            
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                await signInWithCustomToken(auth, __initial_auth_token);
            } else {
                await signInAnonymously(auth);
            }

            const docPath = `/artifacts/${appId}/public/data/config/main`;
            configDocRef.current = doc(db, docPath);
            const docSnap = await getDoc(configDocRef.current);

            if (docSnap.exists()) {
                const remoteData = docSnap.data();
                const mergedConfig = {
                    ...initialData, ...remoteData,
                    settings: { ...initialData.settings, ...remoteData.settings },
                    offers: { ...initialData.offers, ...remoteData.offers },
                    packs: { ...initialData.packs, ...remoteData.packs },
                };
                setConfig(mergedConfig);
            } else {
                await setDoc(configDocRef.current, initialData);
                setConfig(initialData);
            }
        } catch (error) {
            console.error("Erreur d'initialisation de Firebase:", error);
            setConfig(initialData);
        } finally {
            setIsLoading(false);
        }
    };
    initFirebase();
  }, []);

  const handleSave = async () => {
    if (!configDocRef.current || !config) {
        setNotification("Erreur: Connexion à la base de données non établie.");
        setTimeout(() => setNotification(''), 3000);
        return;
    }
    setNotification('Sauvegarde en cours...');
    try {
        await setDoc(configDocRef.current, config, { merge: true });
        setNotification('Configuration sauvegardée avec succès !');
    } catch (error) {
        setNotification('Erreur lors de la sauvegarde.');
        console.error("Erreur de sauvegarde:", error);
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
  
  const handleOfferFieldChange = (key, field, value) => {
    setConfig(prev => ({
        ...prev,
        offers: {
            ...prev.offers,
            [key]: {
                ...prev.offers[key],
                [field]: value
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
    
    const updatedDiscount = { ...newDiscounts[index], [field]: finalValue };

    if (field === 'type' && (finalValue !== 'prix_fixe')) delete updatedDiscount.targetOffer;
    if (field === 'type' && (finalValue === 'installation_offerte')) updatedDiscount.value = 0;
    if (field === 'type' && finalValue === 'prix_fixe' && !updatedDiscount.targetOffer) updatedDiscount.targetOffer = 'initiale';

    newDiscounts[index] = updatedDiscount;
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
        case 'dashboard':
            return <SectionCard title="Tableau de Bord"><Dashboard db={dbRef.current} appId={appIdRef.current} /></SectionCard>;
        case 'devis':
            return <SectionCard title="Devis Réalisés"><DevisList db={dbRef.current} appId={appIdRef.current} /></SectionCard>;
        case 'appointments':
            return <SectionCard title="Rendez-vous"><AppointmentListBO db={dbRef.current} appId={appIdRef.current} /></SectionCard>;
        case 'salespersons':
            return <SectionCard title="Commerciaux"><SalespersonsManager db={dbRef.current} appId={appIdRef.current} /></SectionCard>;
        case 'presentation':
            return <SectionCard title="Gérer les Vidéos de Présentation"><PresentationManager db={dbRef.current} appId={appIdRef.current} /></SectionCard>;
        case 'products':
            return (
                <>
                    <SectionCard title="Offres Principales">
                        <div className="space-y-6">
                            {Object.entries(config.offers).map(([key, offer]) => (
                                <div key={key} className="p-4 border rounded-lg bg-gray-50 space-y-4">
                                    <h3 className="font-semibold text-gray-900 text-lg text-center">{offer.name}</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea value={offer.description || ''} onChange={(e) => handleOfferFieldChange(key, 'description', e.target.value)} className="mt-1 block w-full p-2 border rounded-md" rows="3"></textarea>
                                    </div>
                                    <DifferentiatedProductInputs name="" data={offer} onChange={(type, field, value) => handleProductChange('offers', key, type, field, value)} />
                                </div>
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
            return (
                <SectionCard title="Éléments Supplémentaires (Achat unique)">
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
                </SectionCard>
            );
        case 'discounts':
            return (
                <SectionCard title="Codes de Réduction">
                    <div className="space-y-4">
                        {config.discounts.map((discount, index) => (
                            <div key={discount.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 items-end gap-4 p-3 bg-gray-50 rounded-md">
                                <input type="text" value={discount.code} onChange={(e) => handleDiscountChange(index, 'code', e.target.value)} className="p-2 border rounded-md lg:col-span-3" placeholder="CODEPROMO" />
                                
                                <div className="lg:col-span-3">
                                    {discount.type !== 'installation_offerte' && <PriceInput label={discount.type === 'prix_fixe' ? "Prix Fixe (€)" : "Montant Remise (€)"} value={discount.value} onChange={(e) => handleDiscountChange(index, 'value', e.target.value)} />}
                                </div>
                                
                                <select value={discount.type} onChange={(e) => handleDiscountChange(index, 'type', e.target.value)} className="p-2 border rounded-md bg-white lg:col-span-2 h-[42px]">
                                    <option value="materiel">Remise Matériel (€)</option>
                                    <option value="abonnement">Remise Abonnement (€)</option>
                                    <option value="prix_fixe">Prix Fixe Matériel</option>
                                    <option value="installation_offerte">Frais d'installation offerts</option>
                                </select>

                                {discount.type === 'prix_fixe' && (
                                    <div className="lg:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Offre Ciblée</label>
                                        <select value={discount.targetOffer} onChange={(e) => handleDiscountChange(index, 'targetOffer', e.target.value)} className="p-2 border rounded-md bg-white w-full h-[42px] mt-1">
                                            {Object.entries(config.offers).map(([key, offer]) => (
                                                <option key={key} value={key}>{offer.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                
                                <div className={`flex items-center justify-between ${discount.type === 'prix_fixe' ? 'lg:col-span-2' : 'lg:col-span-4'}`}>
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
                </SectionCard>
            );
        case 'settings':
            return (
                <SectionCard title="Paramètres Généraux">
                    <div className="space-y-4 max-w-sm">
                        <PriceInput label="Frais d'installation" value={config.settings.installationFee} onChange={e => handleSettingsChange('installationFee', e.target.value)} />
                        <hr/><h3 className="font-semibold pt-2 text-gray-800">Taux de TVA</h3>
                        <PercentageInput label="TVA Résidentiel" value={config.settings.vat.residentiel} onChange={e => handleSettingsChange('vat', e.target.value, 'residentiel')} />
                        <PercentageInput label="TVA Professionnel" value={config.settings.vat.professionnel} onChange={e => handleSettingsChange('vat', e.target.value, 'professionnel')} />
                    </div>
                </SectionCard>
            );
        default:
            return null;
    }
  }

  const TabButton = ({ tabName, label, icon }) => (
    <button onClick={() => setActiveTab(tabName)} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-md font-semibold transition text-sm ${activeTab === tabName ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}>
        {icon}
        <span>{label}</span>
    </button>
  )

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
        <header className="bg-white shadow-md sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Back-Office</h1>
                <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-3 sm:px-4 rounded-lg hover:bg-blue-700 transition shadow text-sm sm:text-base">
                    <SaveIcon /> <span className="hidden sm:inline">Sauvegarder les changements</span>
                </button>
            </div>
        </header>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                <aside className="lg:col-span-3 xl:col-span-2 mb-6 lg:mb-0">
                    <nav className="space-y-2">
                        <TabButton tabName="dashboard" label="Tableau de bord" icon={<BarChartIcon />} />
                        <hr/>
                        <TabButton tabName="devis" label="Devis" icon={<ArchiveIcon />} />
                        <TabButton tabName="appointments" label="Rendez-vous" icon={<CalendarIcon />} />
                        <TabButton tabName="salespersons" label="Commerciaux" icon={<UsersIcon />} />
                        <TabButton tabName="presentation" label="Présentation" icon={<VideoIcon />} />
                        <hr/>
                        <TabButton tabName="products" label="Offres & Packs" icon={<TagIcon />} />
                        <TabButton tabName="items" label="Éléments" icon={<ListIcon />} />
                        <TabButton tabName="discounts" label="Réductions" icon={<TagIcon />} />
                        <hr/>
                        <TabButton tabName="settings" label="Paramètres" icon={<SettingsIcon />} />
                    </nav>
                </aside>

                <main className="lg:col-span-9 xl:col-span-10">
                    {renderContent()}
                </main>
            </div>
        </div>
        
        {notification && (
            <div className="fixed bottom-5 right-5 bg-gray-800 text-white py-2 px-5 rounded-lg shadow-lg z-30">
                {notification}
            </div>
        )}
    </div>
  );
}






