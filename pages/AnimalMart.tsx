import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Search, Filter, Plus, Phone, MessageCircle, MapPin, X, Tag, ShieldCheck, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { AnimalListing } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

// --- DATA GENERATION UTILITIES ---
const ANIMAL_TYPES = ['Cow', 'Buffalo', 'Goat', 'Sheep', 'Chicken'];
const BREEDS: Record<string, string[]> = {
    'Cow': ['Gir', 'Sahiwal', 'Red Sindhi', 'Jersey', 'Holstein'],
    'Buffalo': ['Murrah', 'Surti', 'Jaffrabadi', 'Mehsana'],
    'Goat': ['Osmanabadi', 'Boer', 'Jamnapari', 'Sirohi'],
    'Sheep': ['Deccani', 'Nellore', 'Marwari'],
    'Chicken': ['Kadaknath', 'Rhode Island', 'Local']
};
const DISTRICTS = ['Pune', 'Satara', 'Nashik', 'Ahmednagar', 'Solapur', 'Kolhapur', 'Sangli', 'Aurangabad', 'Nagpur', 'Amravati', 'Kottayam', 'Idukki', 'Ernakulam'];
const SELLERS = ['Ramesh', 'Suresh', 'Mahesh', 'Ganesh', 'Vijay', 'Arjun', 'Joseph', 'Mathew', 'Abdullah', 'Raj'];

const generateMockListings = (count: number): AnimalListing[] => {
    const listings: AnimalListing[] = [];
    for (let i = 1; i <= count; i++) {
        const type = ANIMAL_TYPES[Math.floor(Math.random() * ANIMAL_TYPES.length)];
        const breeds = BREEDS[type] || ['Mixed'];
        const breed = breeds[Math.floor(Math.random() * breeds.length)];
        const district = DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)];
        const seller = SELLERS[Math.floor(Math.random() * SELLERS.length)] + ' ' + String.fromCharCode(65 + Math.floor(Math.random() * 26));
        
        // Price logic based on type
        let basePrice = 5000;
        if (type === 'Cow') basePrice = 40000;
        if (type === 'Buffalo') basePrice = 60000;
        if (type === 'Goat') basePrice = 12000;
        if (type === 'Chicken') basePrice = 500;

        const price = Math.floor(basePrice + (Math.random() * basePrice * 0.5));

        listings.push({
            id: i.toString(),
            type: type as any,
            breed: breed,
            age: `${Math.floor(Math.random() * 8) + 1} Years`,
            gender: Math.random() > 0.3 ? 'Female' : 'Male',
            purpose: type === 'Chicken' ? 'Meat' : (Math.random() > 0.5 ? 'Milk' : 'Breeding'),
            healthStatus: Math.random() > 0.2 ? 'Healthy' : 'Average',
            vaccinated: Math.random() > 0.3,
            state: district === 'Kottayam' || district === 'Idukki' ? 'Kerala' : 'Maharashtra',
            district: district,
            price: price,
            sellerName: seller,
            contactNumber: '9876543210',
            datePosted: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString().split('T')[0],
            image: getPlaceholderImage(type)
        });
    }
    return listings;
};

const getPlaceholderImage = (type: string) => {
    switch(type) {
        case 'Cow': return 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=600';
        case 'Buffalo': return 'https://images.unsplash.com/photo-1504283562203-82f5b89a6326?auto=format&fit=crop&q=80&w=600';
        case 'Goat': return 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=600';
        case 'Sheep': return 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&q=80&w=600';
        case 'Chicken': return 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=600';
        default: return 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=600';
    }
};

const ITEMS_PER_PAGE = 12;

const AnimalMart: React.FC = () => {
    const { t } = useLanguage();
    const [listings, setListings] = useState<AnimalListing[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Filters & Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    
    const [filters, setFilters] = useState({
        type: 'All',
        district: '',
        minPrice: '',
        maxPrice: '',
        sort: 'newest' // 'newest', 'price_low', 'price_high'
    });

    // Form State for Selling
    const [formData, setFormData] = useState<Partial<AnimalListing>>({
        type: 'Cow',
        breed: '',
        age: '',
        gender: 'Female',
        purpose: 'Milk',
        healthStatus: 'Good',
        vaccinated: true,
        state: 'Kerala',
        district: '',
        price: 0,
        sellerName: 'Shardul Kolekar', 
        contactNumber: '+91 98765 43210'
    });

    useEffect(() => {
        const saved = localStorage.getItem('krishi_animal_listings_v2'); // New key for large dataset
        if (saved) {
            setListings(JSON.parse(saved));
        } else {
            // Generate 1000 items
            const generated = generateMockListings(1000);
            setListings(generated);
            localStorage.setItem('krishi_animal_listings_v2', JSON.stringify(generated));
        }
    }, []);

    const saveListings = (updated: AnimalListing[]) => {
        setListings(updated);
        localStorage.setItem('krishi_animal_listings_v2', JSON.stringify(updated));
    };

    const handleSubmit = () => {
        if (!formData.breed || !formData.age || !formData.district || !formData.price) {
            alert("Please fill in all required fields.");
            return;
        }

        const newListing: AnimalListing = {
            id: Date.now().toString(),
            type: formData.type as any,
            breed: formData.breed,
            age: formData.age,
            gender: formData.gender as any,
            purpose: formData.purpose as any,
            healthStatus: formData.healthStatus || 'Good',
            vaccinated: formData.vaccinated || false,
            state: formData.state || '',
            district: formData.district,
            price: Number(formData.price),
            sellerName: formData.sellerName || 'Anonymous',
            contactNumber: formData.contactNumber || '',
            datePosted: new Date().toISOString().split('T')[0],
            image: getPlaceholderImage(formData.type as string)
        };

        saveListings([newListing, ...listings]);
        setIsModalOpen(false);
        setFormData({ ...formData, breed: '', age: '', district: '', price: 0 });
    };

    // Filter Logic
    const filteredListings = useMemo(() => {
        let result = listings.filter(item => {
            const typeMatch = filters.type === 'All' || item.type === filters.type;
            const distMatch = item.district.toLowerCase().includes(filters.district.toLowerCase());
            const minPriceMatch = filters.minPrice ? item.price >= Number(filters.minPrice) : true;
            const maxPriceMatch = filters.maxPrice ? item.price <= Number(filters.maxPrice) : true;
            
            return typeMatch && distMatch && minPriceMatch && maxPriceMatch;
        });

        // Sorting
        if (filters.sort === 'price_low') {
            result.sort((a, b) => a.price - b.price);
        } else if (filters.sort === 'price_high') {
            result.sort((a, b) => b.price - a.price);
        } else {
            // Newest (Date string compare)
            result.sort((a, b) => b.datePosted.localeCompare(a.datePosted));
        }

        return result;
    }, [listings, filters]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
    const paginatedListings = filteredListings.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to first page on filter change
    };

    const clearFilters = () => {
        setFilters({
            type: 'All',
            district: '',
            minPrice: '',
            maxPrice: '',
            sort: 'newest'
        });
        setCurrentPage(1);
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="text-orange-600" /> {t.mart_title}
                    </h1>
                    <p className="text-gray-500 mt-1">{t.mart_subtitle}</p>
                </div>
                
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                    <Plus size={20} /> {t.sell_animal}
                </button>
            </div>

            {/* Advanced Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                                showFilters ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-700'
                            }`}
                        >
                            <SlidersHorizontal size={18} /> Filters
                        </button>
                        
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder={t.filter_district}
                                value={filters.district}
                                onChange={(e) => handleFilterChange('district', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none text-gray-900"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                         <span className="text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
                         <select 
                            value={filters.sort}
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                         >
                             <option value="newest">Newest First</option>
                             <option value="price_low">Price: Low to High</option>
                             <option value="price_high">Price: High to Low</option>
                         </select>
                    </div>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Animal Type</label>
                            <select 
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                            >
                                <option value="All">All Types</option>
                                <option value="Cow">Cow</option>
                                <option value="Buffalo">Buffalo</option>
                                <option value="Goat">Goat</option>
                                <option value="Sheep">Sheep</option>
                                <option value="Chicken">Chicken</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Price (₹)</label>
                            <input 
                                type="number"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                placeholder="0"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max Price (₹)</label>
                            <input 
                                type="number"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                placeholder="Max"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                        <div className="flex items-end">
                             <button onClick={clearFilters} className="text-sm text-red-500 font-bold hover:underline mb-2">Clear All</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Row */}
            <div className="flex justify-between items-center mb-4 px-2">
                <p className="text-gray-500 text-sm">
                    Showing <span className="font-bold text-gray-900">{filteredListings.length}</span> listings
                    {filteredListings.length > 0 && ` (Page ${currentPage} of ${totalPages})`}
                </p>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {paginatedListings.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <Search className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-gray-700">No animals found</h3>
                        <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
                        <button onClick={clearFilters} className="mt-4 text-orange-600 font-bold hover:underline">Clear Filters</button>
                    </div>
                ) : (
                    paginatedListings.map(item => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group flex flex-col h-full">
                            <div className="h-48 overflow-hidden relative">
                                <img src={item.image || getPlaceholderImage(item.type)} alt={item.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                                    <Tag size={12} className="text-orange-500" /> {item.type}
                                </div>
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
                                    <h3 className="text-white font-bold text-lg">{item.breed}</h3>
                                    <p className="text-white/80 text-xs flex items-center gap-1">
                                        <MapPin size={12} /> {item.district}, {item.state}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="text-sm space-y-1 text-gray-600">
                                        <p><span className="text-gray-400 text-xs uppercase font-bold">{t.age}:</span> {item.age}</p>
                                        <p><span className="text-gray-400 text-xs uppercase font-bold">{t.gender}:</span> {item.gender}</p>
                                        <p><span className="text-gray-400 text-xs uppercase font-bold">{t.purpose}:</span> {item.purpose}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-green-700">₹{item.price.toLocaleString()}</p>
                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${item.vaccinated ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {item.vaccinated ? 'Vaccinated' : 'Not Vaccinated'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-2 rounded-lg mb-4">
                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">{t.health_status}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-700">
                                        <ShieldCheck size={14} className="text-blue-500" /> {item.healthStatus}
                                    </div>
                                </div>

                                <div className="mt-auto grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
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

            {/* Sell Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h3 className="font-bold text-gray-900 text-lg">{t.sell_animal}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.animal_type}</label>
                                    <select 
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none bg-white text-gray-900"
                                    >
                                        <option value="Cow">Cow</option>
                                        <option value="Buffalo">Buffalo</option>
                                        <option value="Goat">Goat</option>
                                        <option value="Sheep">Sheep</option>
                                        <option value="Chicken">Chicken</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.breed} *</label>
                                    <input 
                                        type="text" 
                                        value={formData.breed}
                                        onChange={(e) => setFormData({...formData, breed: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none text-gray-900"
                                        placeholder="e.g. Gir, Murrah"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.age} *</label>
                                    <input 
                                        type="text" 
                                        value={formData.age}
                                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none text-gray-900"
                                        placeholder="e.g. 2 Years"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.gender}</label>
                                    <select 
                                        value={formData.gender}
                                        onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none bg-white text-gray-900"
                                    >
                                        <option value="Female">Female</option>
                                        <option value="Male">Male</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.purpose}</label>
                                    <select 
                                        value={formData.purpose}
                                        onChange={(e) => setFormData({...formData, purpose: e.target.value as any})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none bg-white text-gray-900"
                                    >
                                        <option value="Milk">Milk</option>
                                        <option value="Breeding">Breeding</option>
                                        <option value="Farming">Farming</option>
                                        <option value="Meat">Meat</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.price_rs} *</label>
                                    <input 
                                        type="number" 
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none text-gray-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.health_status}</label>
                                <input 
                                    type="text" 
                                    value={formData.healthStatus}
                                    onChange={(e) => setFormData({...formData, healthStatus: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none text-gray-900"
                                    placeholder="e.g. Healthy, Recent checkup done"
                                />
                            </div>

                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <input 
                                    type="checkbox" 
                                    checked={formData.vaccinated}
                                    onChange={(e) => setFormData({...formData, vaccinated: e.target.checked})}
                                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm font-medium text-gray-700">{t.vaccination_status}: {t.yes}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.state}</label>
                                    <input 
                                        type="text" 
                                        value={formData.state}
                                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.filter_district} *</label>
                                    <input 
                                        type="text" 
                                        value={formData.district}
                                        onChange={(e) => setFormData({...formData, district: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none text-gray-900"
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
                                className="px-6 py-2.5 rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 shadow-md transition-colors"
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

export default AnimalMart;