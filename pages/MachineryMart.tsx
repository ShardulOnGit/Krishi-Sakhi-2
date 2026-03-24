import React, { useState, useEffect, useMemo } from 'react';
import { Tractor, Search, Filter, Plus, Phone, MessageCircle, MapPin, X, Tag, ShieldCheck, AlertTriangle, Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { MachineListing } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

// --- DATA GENERATION CONSTANTS ---
const MACHINE_TYPES = ['Tractor', 'Harvester', 'Rotavator', 'Sprayer', 'Pump', 'Tiller'];
const BRANDS = ['Mahindra', 'John Deere', 'Kubota', 'Swaraj', 'Sonalika', 'New Holland', 'Massey Ferguson', 'Shaktiman'];
const DISTRICTS = ['Pune', 'Satara', 'Nashik', 'Ahmednagar', 'Solapur', 'Kolhapur', 'Sangli', 'Aurangabad', 'Nagpur', 'Amravati', 'Kottayam', 'Idukki', 'Ernakulam'];
const SELLERS = ['Rajesh', 'Suresh', 'Amit', 'Vijay', 'Rahul', 'Arjun', 'Joseph', 'Mathew', 'Abdullah', 'Vikram'];

const getPlaceholderImage = (type: string) => {
    switch(type) {
        case 'Tractor': return 'https://images.unsplash.com/photo-1595246733230-e4d67389c922?auto=format&fit=crop&q=80&w=600';
        case 'Harvester': return 'https://images.unsplash.com/photo-1628062973977-96c342797441?auto=format&fit=crop&q=80&w=600';
        case 'Sprayer': return 'https://images.unsplash.com/photo-1615811361524-78891518f1f9?auto=format&fit=crop&q=80&w=600';
        case 'Pump': return 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&q=80&w=600';
        default: return 'https://plus.unsplash.com/premium_photo-1661962360334-a63907ebc792?auto=format&fit=crop&q=80&w=600';
    }
};

const generateMockMachines = (count: number): MachineListing[] => {
    const listings: MachineListing[] = [];
    for (let i = 1; i <= count; i++) {
        const type = MACHINE_TYPES[Math.floor(Math.random() * MACHINE_TYPES.length)];
        const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
        const district = DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)];
        const listingType = Math.random() > 0.6 ? 'Sell' : 'Rent'; // 60% Rent probability for Sell vs Rent balance
        const seller = SELLERS[Math.floor(Math.random() * SELLERS.length)];
        
        let price = 0;
        let unit: 'hour' | 'day' | 'flat' = 'flat';

        if (listingType === 'Rent') {
            price = Math.floor(Math.random() * 1000) + 400; // 400 - 1400 hourly
            unit = Math.random() > 0.7 ? 'day' : 'hour';
            if(unit === 'day') price *= 8; // approx 8 hours work
        } else {
            // Selling price
            if (type === 'Tractor' || type === 'Harvester') {
                 price = Math.floor(Math.random() * 500000) + 200000;
            } else {
                 price = Math.floor(Math.random() * 50000) + 15000;
            }
            unit = 'flat';
        }

        listings.push({
            id: i.toString(),
            machineType: type as any,
            listingType: listingType,
            brandModel: `${brand} ${type} ${Math.floor(Math.random() * 100)} Series`,
            condition: Math.random() > 0.3 ? 'Good' : (Math.random() > 0.5 ? 'Average' : 'Old'),
            year: (2015 + Math.floor(Math.random() * 9)).toString(),
            price: Math.floor(price),
            priceUnit: unit,
            available: Math.random() > 0.1, // 90% available
            state: district === 'Kottayam' || district === 'Idukki' || district === 'Ernakulam' ? 'Kerala' : 'Maharashtra',
            district: district,
            ownerName: seller,
            contactNumber: '9876543210',
            verifiedOwner: Math.random() > 0.2,
            verifiedLocation: Math.random() > 0.3,
            image: getPlaceholderImage(type),
            datePosted: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString().split('T')[0]
        });
    }
    return listings;
};

const ITEMS_PER_PAGE = 12;

const MachineryMart: React.FC = () => {
    const { t } = useLanguage();
    const [listings, setListings] = useState<MachineListing[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Filters & Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [filterType, setFilterType] = useState('All');
    const [listingTypeFilter, setListingTypeFilter] = useState('All');
    const [filterDistrict, setFilterDistrict] = useState('');

    // Form State
    const [formData, setFormData] = useState<Partial<MachineListing>>({
        machineType: 'Tractor',
        listingType: 'Rent',
        brandModel: '',
        condition: 'Good',
        year: '',
        price: 0,
        priceUnit: 'hour',
        available: true,
        state: 'Kerala',
        district: '',
        ownerName: 'Shardul Kolekar', // Pre-fill with user info
        contactNumber: '+91 98765 43210'
    });

    useEffect(() => {
        const saved = localStorage.getItem('krishi_machine_listings_v2');
        if (saved) {
            setListings(JSON.parse(saved));
        } else {
            const generated = generateMockMachines(100);
            setListings(generated);
            localStorage.setItem('krishi_machine_listings_v2', JSON.stringify(generated));
        }
    }, []);

    const saveListings = (updated: MachineListing[]) => {
        setListings(updated);
        localStorage.setItem('krishi_machine_listings_v2', JSON.stringify(updated));
    };

    const handleSubmit = () => {
        if (!formData.brandModel || !formData.district || !formData.price) {
            alert("Please fill in all required fields.");
            return;
        }

        const newListing: MachineListing = {
            id: Date.now().toString(),
            machineType: formData.machineType as any,
            listingType: formData.listingType as any,
            brandModel: formData.brandModel,
            condition: formData.condition as any,
            year: formData.year || 'N/A',
            price: Number(formData.price),
            priceUnit: formData.listingType === 'Sell' ? 'flat' : formData.priceUnit,
            available: true,
            state: formData.state || '',
            district: formData.district,
            ownerName: formData.ownerName || 'Anonymous',
            contactNumber: formData.contactNumber || '',
            verifiedOwner: true, // Auto-verified for logged in user (mock)
            verifiedLocation: true,
            datePosted: new Date().toISOString().split('T')[0],
            image: getPlaceholderImage(formData.machineType as string)
        };

        saveListings([newListing, ...listings]);
        setIsModalOpen(false);
        setFormData({ ...formData, brandModel: '', price: 0, district: '' });
    };

    const filteredListings = useMemo(() => {
        return listings.filter(item => {
            const typeMatch = filterType === 'All' || item.machineType === filterType;
            const listTypeMatch = listingTypeFilter === 'All' || item.listingType === listingTypeFilter;
            const distMatch = item.district.toLowerCase().includes(filterDistrict.toLowerCase());
            return typeMatch && listTypeMatch && distMatch;
        });
    }, [listings, filterType, listingTypeFilter, filterDistrict]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
    const paginatedListings = filteredListings.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterType, listingTypeFilter, filterDistrict]);

    const reportListing = (id: string) => {
        alert("Listing reported to admins for review.");
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Tractor className="text-blue-600" /> {t.machinery_title}
                    </h1>
                    <p className="text-gray-500 mt-1">{t.machinery_subtitle}</p>
                </div>
                
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                    <Plus size={20} /> {t.list_machine}
                </button>
            </div>

            {/* Safety Notice */}
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-yellow-800">{t.safety_disclaimer}</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button 
                        onClick={() => setListingTypeFilter('All')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${listingTypeFilter === 'All' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setListingTypeFilter('Rent')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${listingTypeFilter === 'Rent' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                    >
                        {t.rent}
                    </button>
                    <button 
                        onClick={() => setListingTypeFilter('Sell')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${listingTypeFilter === 'Sell' ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                    >
                        {t.sell}
                    </button>
                </div>

                <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="text-gray-400" size={18} />
                    <select 
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-40 text-gray-900"
                    >
                        <option value="All">All Types</option>
                        <option value="Tractor">Tractor</option>
                        <option value="Harvester">Harvester</option>
                        <option value="Rotavator">Rotavator</option>
                        <option value="Sprayer">Sprayer</option>
                        <option value="Pump">Pump</option>
                        <option value="Tiller">Power Tiller</option>
                    </select>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder={t.filter_district}
                        value={filterDistrict}
                        onChange={(e) => setFilterDistrict(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    />
                </div>
            </div>

            {/* Stats Row */}
            <div className="flex justify-between items-center mb-4 px-2">
                <p className="text-gray-500 text-sm">
                    Showing <span className="font-bold text-gray-900">{paginatedListings.length}</span> of {filteredListings.length} machines
                </p>
                <p className="text-gray-500 text-sm">
                   Page {currentPage} of {totalPages || 1}
                </p>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedListings.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No machinery found matching your criteria.
                    </div>
                ) : (
                    paginatedListings.map(item => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group flex flex-col h-full">
                            <div className="h-48 overflow-hidden relative">
                                <img src={item.image} alt={item.machineType} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <div className={`px-2 py-1 rounded text-xs font-bold shadow-sm backdrop-blur-sm ${item.listingType === 'Rent' ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white'}`}>
                                        {item.listingType === 'Rent' ? t.rent : t.sell}
                                    </div>
                                </div>
                                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                                    <Tag size={12} className="text-blue-500" /> {item.machineType}
                                </div>
                            </div>
                            
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-gray-900 font-bold text-lg">{item.brandModel}</h3>
                                    <button onClick={() => reportListing(item.id)} className="text-gray-300 hover:text-red-500" title={t.report_listing}>
                                        <Flag size={14} />
                                    </button>
                                </div>

                                <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
                                    <MapPin size={14} className="text-red-500" /> {item.district}, {item.state}
                                </p>

                                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                                    <div className="bg-gray-50 p-2 rounded">
                                        <span className="text-gray-400 text-xs block">{t.condition}</span>
                                        <span className="font-medium text-gray-800">{item.condition}</span>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded">
                                        <span className="text-gray-400 text-xs block">{t.year_purchase}</span>
                                        <span className="font-medium text-gray-800">{item.year}</span>
                                    </div>
                                </div>

                                {/* Trust Badges */}
                                <div className="flex gap-2 mb-4 flex-wrap">
                                    {item.verifiedOwner && (
                                        <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-100 font-bold">
                                            <ShieldCheck size={12} /> {t.verified_owner}
                                        </span>
                                    )}
                                    {item.verifiedLocation && (
                                        <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-100 font-bold">
                                            <MapPin size={12} /> {t.location_verified}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-auto border-t border-gray-100 pt-3">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <span className="text-xl font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                                            {item.listingType === 'Rent' && <span className="text-xs text-gray-500"> / {item.priceUnit}</span>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <a 
                                            href={`tel:${item.contactNumber}`}
                                            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                                        >
                                            <Phone size={16} /> {t.call}
                                        </a>
                                        <a 
                                            href={`https://wa.me/${item.contactNumber.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
                                        >
                                            <MessageCircle size={16} /> {t.whatsapp}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 pb-8">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    
                    <span className="font-bold text-gray-700">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            )}

            {/* List Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h3 className="font-bold text-gray-900 text-lg">{t.list_machine}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                            {/* Type Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.machine_type}</label>
                                    <select 
                                        value={formData.machineType}
                                        onChange={(e) => setFormData({...formData, machineType: e.target.value as any})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                                    >
                                        <option value="Tractor">Tractor</option>
                                        <option value="Harvester">Harvester</option>
                                        <option value="Rotavator">Rotavator</option>
                                        <option value="Sprayer">Sprayer</option>
                                        <option value="Pump">Pump</option>
                                        <option value="Tiller">Power Tiller</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
                                    <select 
                                        value={formData.listingType}
                                        onChange={(e) => setFormData({...formData, listingType: e.target.value as any})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                                    >
                                        <option value="Rent">{t.rent}</option>
                                        <option value="Sell">{t.sell}</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.brand_model} *</label>
                                <input 
                                    type="text" 
                                    value={formData.brandModel}
                                    onChange={(e) => setFormData({...formData, brandModel: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                                    placeholder="e.g. Mahindra 575 DI"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.condition}</label>
                                    <select 
                                        value={formData.condition}
                                        onChange={(e) => setFormData({...formData, condition: e.target.value as any})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                                    >
                                        <option value="Good">Good</option>
                                        <option value="Average">Average</option>
                                        <option value="Old">Old / Needs Repair</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.year_purchase}</label>
                                    <input 
                                        type="number" 
                                        value={formData.year}
                                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                                        placeholder="e.g. 2020"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.price_rs} *</label>
                                    <input 
                                        type="number" 
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                                    />
                                </div>
                                {formData.listingType === 'Rent' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.price_unit}</label>
                                        <select 
                                            value={formData.priceUnit}
                                            onChange={(e) => setFormData({...formData, priceUnit: e.target.value as any})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                                        >
                                            <option value="hour">{t.per_hour}</option>
                                            <option value="day">{t.per_day}</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.state}</label>
                                    <input 
                                        type="text" 
                                        value={formData.state}
                                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.filter_district} *</label>
                                    <input 
                                        type="text" 
                                        value={formData.district}
                                        onChange={(e) => setFormData({...formData, district: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                                        placeholder="e.g. Pune"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-200 transition-colors"
                            >
                                {t.cancel}
                            </button>
                            <button 
                                onClick={handleSubmit} 
                                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md transition-colors"
                            >
                                {t.submit}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MachineryMart;