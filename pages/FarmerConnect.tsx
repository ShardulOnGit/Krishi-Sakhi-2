import React, { useState, useEffect, useMemo } from 'react';
import { Globe, Search, MapPin, Sprout, Sparkles, Loader2, UserPlus, Edit, User, Map, Users, ArrowRight, Filter, ChevronLeft, ChevronRight, X, UserCheck, MessageCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { findSimilarFarmers } from '../services/geminiService';
import { UserProfile, PeerFarmer, Page } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { generateFarmerGroups, FarmerGroup, parseFarmerData, Farmer } from '../utils/farmerData';

interface FarmerConnectProps {
    setPage?: (page: Page) => void;
}

// Default profile for demo purposes if user hasn't set one up
const DEFAULT_PROFILE: UserProfile = {
    name: 'Shardul Kolekar',
    phone: '+91 98765 43210',
    email: 'shardul.k@example.com',
    gender: 'Male',
    age: '42',
    preferredLanguage: 'English',
    experienceYears: '15',
    farmerCategory: 'Medium',
    state: 'MH',
    district: 'Pune',
    taluka: 'Haveli',
    village: 'Wagholi',
    pinCode: '412207',
    location: 'Wagholi, Pune, MH',
    totalLandArea: '4.5',
    landUnit: 'Acres',
    numberOfPlots: '3',
    soilType: 'black',
    soilFertility: 'Medium',
    soilTestingDone: 'Yes',
    lastSoilTestYear: '2023',
    irrigationMethods: ['Canal', 'Rainfed'],
    waterAvailability: 'Medium',
    mainCrop: 'sugarcane',
    secondaryCrop: 'tomato',
    cropsHistory: ['sugarcane', 'tomato'],
    machinery: ['Tractor'],
    laborAvailability: 'Medium',
    modernTechniquesUsed: 'No',
    organicCertified: false,
    kccCardHolder: true,
    livestock: ['Cows (2)'],
};

const ITEMS_PER_PAGE = 24;

const FarmerConnect: React.FC<FarmerConnectProps> = ({ setPage }) => {
    const { t, language } = useLanguage();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    
    // Data State
    const [allFarmers, setAllFarmers] = useState<Farmer[]>([]);
    const [communityGroups, setCommunityGroups] = useState<FarmerGroup[]>([]);
    const [connectedIds, setConnectedIds] = useState<string[]>([]);
    const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>([]);
    
    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [activeTab, setActiveTab] = useState<'individual' | 'groups' | 'network'>('individual');
    const [viewingGroup, setViewingGroup] = useState<FarmerGroup | null>(null);
    
    // Filters & Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        district: '',
        crop: '',
        soil: ''
    });

    useEffect(() => {
        const savedProfile = localStorage.getItem('krishi_user_profile');
        if (savedProfile) {
            setProfile(JSON.parse(savedProfile));
        } else {
            setProfile(DEFAULT_PROFILE);
        }
        
        // Load generated data
        const farmers = parseFarmerData();
        setAllFarmers(farmers);
        setCommunityGroups(generateFarmerGroups());

        // Load connections & joined groups
        const savedConnections = localStorage.getItem('krishi_connections');
        if (savedConnections) setConnectedIds(JSON.parse(savedConnections));
        
        const savedGroups = localStorage.getItem('krishi_joined_groups');
        if (savedGroups) setJoinedGroupIds(JSON.parse(savedGroups));
    }, []);

    const handleConnect = (id: string) => {
        if (!connectedIds.includes(id)) {
            const newIds = [...connectedIds, id];
            setConnectedIds(newIds);
            localStorage.setItem('krishi_connections', JSON.stringify(newIds));
        }
    };

    const handleJoinGroup = (groupId: string) => {
        if (!joinedGroupIds.includes(groupId)) {
            const newIds = [...joinedGroupIds, groupId];
            setJoinedGroupIds(newIds);
            localStorage.setItem('krishi_joined_groups', JSON.stringify(newIds));
        }
    };

    const calculateSimilarity = (farmer: Farmer, userProfile: UserProfile): number => {
        let score = 0;
        // Same District: +30
        if (farmer.district.toLowerCase() === userProfile.district.toLowerCase()) score += 30;
        else if (farmer.state === userProfile.state) score += 10;

        // Same Crop: +40
        if (userProfile.cropsHistory.map(c => c.toLowerCase()).includes(farmer.crop.toLowerCase()) || 
            userProfile.mainCrop.toLowerCase() === farmer.crop.toLowerCase()) {
            score += 40;
        }

        // Same Soil: +20
        if (userProfile.soilType.toLowerCase().includes(farmer.soil.toLowerCase())) score += 20;

        // Random jitter for variety in demo (0-10)
        score += Math.floor(Math.random() * 10);

        return Math.min(100, score);
    };

    const handleFindPeers = () => {
        if (!profile) return;
        setIsLoading(true);
        // Simulate network delay for effect
        setTimeout(() => {
            setHasSearched(true);
            setIsLoading(false);
        }, 800);
    };

    // Filter Logic
    const filteredFarmers = useMemo(() => {
        if (!hasSearched && activeTab === 'individual') return [];
        
        // Base list depends on tab
        let sourceList = allFarmers;
        
        // For network tab, we show connected farmers regardless of "hasSearched" state
        if (activeTab === 'network') {
            sourceList = allFarmers.filter(f => connectedIds.includes(f.farmer_id));
        }

        return sourceList.filter(farmer => {
            const matchesSearch = farmer.name.toLowerCase().includes(filters.search.toLowerCase()) || 
                                  farmer.farmer_id.toLowerCase().includes(filters.search.toLowerCase());
            const matchesDistrict = !filters.district || farmer.district === filters.district;
            const matchesCrop = !filters.crop || farmer.crop === filters.crop;
            const matchesSoil = !filters.soil || farmer.soil === filters.soil;
            return matchesSearch && matchesDistrict && matchesCrop && matchesSoil;
        }).map(f => ({
            ...f,
            similarity: profile ? calculateSimilarity(f, profile) : 0
        })).sort((a, b) => b.similarity - a.similarity);
    }, [allFarmers, filters, hasSearched, profile, activeTab, connectedIds]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredFarmers.length / ITEMS_PER_PAGE);
    const paginatedFarmers = filteredFarmers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Unique values for dropdowns
    const uniqueDistricts = Array.from(new Set(allFarmers.map(f => f.district))).sort();
    const uniqueCrops = Array.from(new Set(allFarmers.map(f => f.crop))).sort();
    const uniqueSoils = Array.from(new Set(allFarmers.map(f => f.soil))).sort();

    const clearFilters = () => {
        setFilters({ search: '', district: '', crop: '', soil: '' });
        setCurrentPage(1);
    };

    const renderFarmerCard = (farmer: Farmer & { similarity: number }) => {
        const isConnected = connectedIds.includes(farmer.farmer_id);
        const isNetworkView = activeTab === 'network';
        const isGroupMember = viewingGroup !== null; // If viewing a group, styling might change slightly

        return (
            <div key={farmer.farmer_id} className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all group relative flex flex-col h-full">
                <div className={`h-16 relative ${isNetworkView ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}>
                    <div className="absolute -bottom-6 left-4">
                        <div className="w-12 h-12 bg-white rounded-full p-1 shadow-sm">
                            <div className={`w-full h-full rounded-full flex items-center justify-center font-bold text-sm border border-gray-200 ${isNetworkView ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-indigo-600'}`}>
                                {farmer.name.charAt(0)}
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-medium border border-white/30">
                        {farmer.farmer_id}
                    </div>
                </div>
                
                <div className="pt-8 p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 truncate pr-2">{farmer.name}</h3>
                        <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                            <Sparkles size={10} className="text-green-600" />
                            <span className="text-[10px] font-bold text-green-700">{farmer.similarity}%</span>
                        </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                        <MapPin size={10} /> {farmer.district}, {farmer.state}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-gray-50 p-1.5 rounded text-center border border-gray-100">
                            <p className="text-[9px] text-gray-400 uppercase font-bold">Crop</p>
                            <p className="text-xs font-medium text-gray-800 truncate" title={farmer.crop}>{farmer.crop}</p>
                        </div>
                        <div className="bg-gray-50 p-1.5 rounded text-center border border-gray-100">
                            <p className="text-[9px] text-gray-400 uppercase font-bold">Soil</p>
                            <p className="text-xs font-medium text-gray-800 truncate" title={farmer.soil}>{farmer.soil}</p>
                        </div>
                    </div>

                    <div className="mt-auto pt-2 border-t border-gray-50 flex gap-2 mb-3">
                        <div className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                            {farmer.season}
                        </div>
                        <div className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                            {farmer.land} acres
                        </div>
                    </div>

                    {isNetworkView || isConnected ? (
                         isConnected ? (
                             <button className="w-full py-1.5 bg-white border border-green-600 text-green-600 rounded text-xs font-bold hover:bg-green-50 transition-colors flex items-center justify-center gap-1">
                                <MessageCircle size={12} /> Message
                            </button>
                         ) : (
                             // Should not happen in network view logic but good fallback
                            <button 
                                onClick={() => handleConnect(farmer.farmer_id)}
                                className="w-full py-1.5 bg-gray-900 text-white rounded text-xs font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                            >
                                <UserPlus size={12} /> Connect
                            </button>
                         )
                    ) : (
                        <button 
                            onClick={() => handleConnect(farmer.farmer_id)}
                            className="w-full py-1.5 bg-gray-900 text-white rounded text-xs font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                        >
                            <UserPlus size={12} /> Connect
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderGroupCard = (group: FarmerGroup) => {
        const isJoined = joinedGroupIds.includes(group.group_id);

        return (
            <div key={group.group_id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:border-green-400 hover:shadow-md transition-all p-5 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isJoined ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                        <Users size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">{group.group_name}</h3>
                        <p className="text-xs text-gray-500">{group.district} • {group.members.length} Members</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded text-[10px] border border-gray-100 capitalize">{group.crop}</span>
                    <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded text-[10px] border border-gray-100 capitalize">{group.soil} soil</span>
                    <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded text-[10px] border border-gray-100 capitalize">{group.season}</span>
                </div>

                <div className="mt-auto">
                    <div className="flex items-center -space-x-2 mb-3">
                        {group.members.slice(0, 3).map((m, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-600" title={m.name}>
                                {m.name.charAt(0)}
                            </div>
                        ))}
                        {group.members.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-500">
                                +{group.members.length - 3}
                            </div>
                        )}
                    </div>
                    
                    {isJoined ? (
                        <button 
                            onClick={() => setViewingGroup(group)}
                            className="w-full py-2 bg-white border border-green-600 text-green-700 rounded-lg text-xs font-bold hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                        >
                            View Community <ArrowRight size={14} />
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleJoinGroup(group.group_id)}
                            className="w-full py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                        >
                            Join Community
                        </button>
                    )}
                </div>
            </div>
        );
    };

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="bg-gray-100 p-6 rounded-full mb-6">
                    <User size={64} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.profile_missing}</h2>
                <p className="text-gray-500 mb-8 max-w-md">
                    {t.complete_profile_msg}
                </p>
                <button 
                    onClick={() => setPage && setPage(Page.PROFILE)}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                    <Edit size={20} /> {t.complete_profile_btn}
                </button>
            </div>
        );
    }

    // VIEW GROUP DETAILS MODE
    if (viewingGroup) {
        // Filter full farmer objects for this group
        const groupMembers = allFarmers
            .filter(f => viewingGroup.members.some(m => m.farmer_id === f.farmer_id))
            .map(f => ({
                ...f,
                similarity: profile ? calculateSimilarity(f, profile) : 0
            }))
            .sort((a, b) => b.similarity - a.similarity);

        return (
            <div className="p-4 md:p-8 animate-fade-in max-w-7xl mx-auto min-h-screen">
                <button 
                    onClick={() => setViewingGroup(null)}
                    className="mb-6 flex items-center gap-2 text-gray-500 hover:text-green-700 transition-colors font-medium"
                >
                    <ArrowLeft size={20} /> Back to Communities
                </button>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
                                <Users size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{viewingGroup.group_name}</h1>
                                <p className="text-gray-500 flex items-center gap-2 mt-1">
                                    <MapPin size={16} /> {viewingGroup.district} • {viewingGroup.members.length} Members
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                             <CheckCircle2 size={18} className="text-green-600" />
                             <span className="text-green-800 font-bold text-sm">Joined</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-6 border-t border-gray-100 pt-6">
                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Crop</p>
                            <p className="font-bold text-gray-800 text-lg capitalize">{viewingGroup.crop}</p>
                        </div>
                        <div className="text-center border-l border-gray-100">
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Soil Type</p>
                            <p className="font-bold text-gray-800 text-lg capitalize">{viewingGroup.soil}</p>
                        </div>
                        <div className="text-center border-l border-gray-100">
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Season</p>
                            <p className="font-bold text-gray-800 text-lg capitalize">{viewingGroup.season}</p>
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-4">Group Members</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                    {groupMembers.map(farmer => renderFarmerCard(farmer))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-7xl mx-auto min-h-screen">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.connect_title}</h1>
                <p className="text-gray-500 max-w-xl mx-auto">{t.connect_subtitle}</p>
            </div>

            {/* Toggle Tabs */}
            <div className="flex justify-center mb-8">
                <div className="bg-gray-100 p-1 rounded-xl flex gap-1 shadow-inner overflow-x-auto">
                    <button 
                        onClick={() => setActiveTab('individual')}
                        className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                            activeTab === 'individual' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Individual Farmers
                    </button>
                    <button 
                        onClick={() => setActiveTab('groups')}
                        className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                            activeTab === 'groups' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Micro-Communities
                    </button>
                    <button 
                        onClick={() => setActiveTab('network')}
                        className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                            activeTab === 'network' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        My Network <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full text-[10px]">{connectedIds.length}</span>
                    </button>
                </div>
            </div>

            {/* INDIVIDUAL TAB */}
            {activeTab === 'individual' && (
                <>
                    {/* Search/Stats Card */}
                    {!hasSearched ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8 max-w-3xl mx-auto text-center animate-fade-in">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Globe size={40} className="text-blue-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Discover 1000+ Farmers</h2>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                Find farmers with similar crops, soil types, and farming conditions to exchange knowledge.
                            </p>
                            
                            <div className="flex flex-wrap justify-center gap-3 text-sm mb-8">
                                <div className="bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                                    <span className="text-gray-500">Your Crop:</span> <span className="font-bold text-gray-800">{profile.mainCrop || t.not_set}</span>
                                </div>
                                <div className="bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                                    <span className="text-gray-500">Your District:</span> <span className="font-bold text-gray-800">{profile.district || t.not_set}</span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleFindPeers}
                                disabled={isLoading}
                                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-70 mx-auto"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                                {isLoading ? t.finding_peers : t.find_peers}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in-up">
                            
                            {/* Filter Bar */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                                <div className="flex items-center gap-2 text-gray-500 font-medium whitespace-nowrap">
                                    <Filter size={18} /> Filters:
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Search name..."
                                            value={filters.search}
                                            onChange={(e) => { setFilters({...filters, search: e.target.value}); setCurrentPage(1); }}
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder-gray-500"
                                        />
                                    </div>
                                    
                                    <select 
                                        value={filters.district}
                                        onChange={(e) => { setFilters({...filters, district: e.target.value}); setCurrentPage(1); }}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                                    >
                                        <option value="">All Districts</option>
                                        {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>

                                    <select 
                                        value={filters.crop}
                                        onChange={(e) => { setFilters({...filters, crop: e.target.value}); setCurrentPage(1); }}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                                    >
                                        <option value="">All Crops</option>
                                        {uniqueCrops.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>

                                    <select 
                                        value={filters.soil}
                                        onChange={(e) => { setFilters({...filters, soil: e.target.value}); setCurrentPage(1); }}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                                    >
                                        <option value="">All Soils</option>
                                        {uniqueSoils.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                {(filters.search || filters.district || filters.crop || filters.soil) && (
                                    <button 
                                        onClick={clearFilters}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Clear Filters"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="flex justify-between items-center text-sm text-gray-500 px-2">
                                <span>Showing {paginatedFarmers.length} of {filteredFarmers.length} farmers</span>
                                <span>Page {currentPage} of {totalPages || 1}</span>
                            </div>

                            {/* Grid */}
                            {filteredFarmers.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                                    {paginatedFarmers.map(farmer => renderFarmerCard(farmer))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                                    <Users size={48} className="text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No farmers found matching your criteria.</p>
                                    <button onClick={clearFilters} className="text-blue-600 font-bold hover:underline mt-2">Clear Filters</button>
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-8">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    
                                    <span className="flex items-center px-4 font-bold text-gray-700 bg-white border rounded-lg">
                                        {currentPage}
                                    </span>

                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* MY NETWORK TAB */}
            {activeTab === 'network' && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Your Connected Network</h2>
                        <p className="text-gray-500 text-sm">Farmers you have connected with.</p>
                    </div>

                    {filteredFarmers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                            {filteredFarmers.map(farmer => renderFarmerCard(farmer))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                            <Users size={48} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">You haven't connected with any farmers yet.</p>
                            <button onClick={() => setActiveTab('individual')} className="text-blue-600 font-bold hover:underline mt-2">Find Farmers</button>
                        </div>
                    )}
                </div>
            )}

            {/* GROUPS TAB */}
            {activeTab === 'groups' && (
                <div className="animate-fade-in">
                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            Suggested Communities <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{communityGroups.length}</span>
                        </h2>
                    </div>
                    
                    {communityGroups.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {communityGroups.map(group => renderGroupCard(group))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                            <Users size={48} className="text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No community groups generated yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FarmerConnect;