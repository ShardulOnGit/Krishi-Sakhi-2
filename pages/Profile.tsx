import React, { useState, useEffect } from 'react';
import { 
    User, MapPin, Phone, Mail, Award, Tractor, Save, Edit2, 
    Droplets, Layers, Sprout, ShieldCheck, Banknote, Briefcase,
    Camera, Globe, Trophy, Plus, X, CheckCircle, Home, LayoutGrid, TestTube, Users
} from 'lucide-react';
import { UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const INITIAL_PROFILE: UserProfile = {
    // Personal
    name: 'Shardul Kolekar',
    phone: '+91 98765 43210',
    email: 'shardul.k@example.com',
    gender: 'Male',
    age: '42',
    preferredLanguage: 'English',
    experienceYears: '15',
    farmerCategory: 'Medium',
    
    // Location
    state: 'Kerala',
    district: 'Kottayam',
    taluka: 'Meenachil',
    village: 'Bharananganam',
    pinCode: '686578',
    location: 'Bharananganam, Kottayam, Kerala', // Computed default
    
    // Land & Soil
    totalLandArea: '4.5',
    landUnit: 'Acres',
    numberOfPlots: '3',
    soilType: 'Red Loam',
    soilFertility: 'Medium',
    soilTestingDone: 'Yes',
    lastSoilTestYear: '2023',
    
    // Water
    irrigationMethods: ['Canal', 'Rainfed'],
    waterAvailability: 'Medium',
    
    // Crops
    mainCrop: 'Rice',
    secondaryCrop: 'Coconut',
    cropsHistory: ['Rice', 'Coconut', 'Pepper'],
    
    // Resources & Practices
    machinery: ['Tractor'],
    laborAvailability: 'Medium',
    modernTechniquesUsed: 'No',
    organicCertified: false,
    kccCardHolder: true,
    
    // Other
    livestock: ['Cows (2)', 'Hens'],
};

const Profile: React.FC = () => {
    const { t } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
    const [tempProfile, setTempProfile] = useState<UserProfile>(INITIAL_PROFILE);
    const [points, setPoints] = useState(1250);
    const [showToast, setShowToast] = useState(false);
    const [newCropTag, setNewCropTag] = useState('');

    useEffect(() => {
        const savedProfile = localStorage.getItem('krishi_user_profile');
        const savedPoints = localStorage.getItem('krishi_points');
        
        if (savedProfile) {
            const parsed = JSON.parse(savedProfile);
            // Merge with initial to ensure new fields exist if loading old data
            const merged = { ...INITIAL_PROFILE, ...parsed };
            setProfile(merged);
            setTempProfile(merged);
        }
        if (savedPoints) {
            setPoints(parseInt(savedPoints));
        }
    }, []);

    const handleSave = () => {
        // Update display location based on specific fields
        const updatedProfile = {
            ...tempProfile,
            location: `${tempProfile.village}, ${tempProfile.district}, ${tempProfile.state}`
        };
        
        setProfile(updatedProfile);
        localStorage.setItem('krishi_user_profile', JSON.stringify(updatedProfile));
        setIsEditing(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleCancel = () => {
        setTempProfile(profile);
        setIsEditing(false);
    };

    const toggleArrayItem = (field: keyof UserProfile, value: string) => {
        const currentList = tempProfile[field] as string[];
        const updatedList = currentList.includes(value) 
            ? currentList.filter(item => item !== value)
            : [...currentList, value];
        setTempProfile({ ...tempProfile, [field]: updatedList });
    };

    const addCropTag = () => {
        if (newCropTag.trim() && !tempProfile.cropsHistory.includes(newCropTag.trim())) {
            setTempProfile({
                ...tempProfile,
                cropsHistory: [...tempProfile.cropsHistory, newCropTag.trim()]
            });
            setNewCropTag('');
        }
    };

    const removeCropTag = (tag: string) => {
        setTempProfile({
            ...tempProfile,
            cropsHistory: tempProfile.cropsHistory.filter(t => t !== tag)
        });
    };

    // Calculate Profile Strength
    const calculateStrength = () => {
        const fields = Object.values(profile);
        const filled = fields.filter(f => {
            if (Array.isArray(f)) return f.length > 0;
            if (typeof f === 'boolean') return true;
            return f !== '' && f !== null && f !== '0';
        });
        return Math.round((filled.length / fields.length) * 100);
    };

    const strength = calculateStrength();

    // Helper for rendering input fields consistently
    const renderInput = (label: string, field: keyof UserProfile, type: string = "text", options?: string[]) => {
        const value = isEditing ? tempProfile[field] : profile[field];
        
        return (
            <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                {isEditing ? (
                    options ? (
                        <select 
                            value={value as string}
                            onChange={(e) => setTempProfile({ ...tempProfile, [field]: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white"
                        >
                            <option value="">Select...</option>
                            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    ) : (
                        <input 
                            type={type} 
                            value={value as string}
                            onChange={(e) => setTempProfile({ ...tempProfile, [field]: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                        />
                    )
                ) : (
                    <p className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-1 min-h-[1.5rem]">
                        {value ? value.toString() : <span className="text-gray-400 italic">--</span>}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-6xl mx-auto space-y-6 relative">
            
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in-up">
                    <CheckCircle size={20} />
                    <span className="font-bold">Profile Updated Successfully!</span>
                </div>
            )}

            {/* Header / Identity Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative group">
                <div className="h-40 bg-gradient-to-r from-green-700 to-emerald-600 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="absolute top-4 right-4 bg-black/20 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm font-medium">
                        {t.member_since} 2024
                    </div>
                </div>
                
                <div className="px-8 pb-8">
                    <div className="relative -top-16 mb-[-40px] flex flex-col md:flex-row items-center md:items-end gap-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-lg shrink-0 z-10 relative">
                                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-3xl font-bold overflow-hidden border-4 border-white">
                                    <User size={48} className="text-gray-300" />
                                </div>
                            </div>
                            {isEditing && (
                                <button className="absolute bottom-2 right-2 bg-green-600 text-white p-2 rounded-full shadow-md hover:bg-green-700 transition-colors z-20">
                                    <Camera size={16} />
                                </button>
                            )}
                        </div>
                        
                        <div className="text-center md:text-left mb-4 md:mb-2 flex-1 pt-12 md:pt-0">
                            <div className="flex flex-col md:flex-row md:items-center gap-2">
                                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                                <div className="hidden md:flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-bold border border-yellow-200">
                                    <Trophy size={12} /> {t.level} 5 Farmer
                                </div>
                            </div>
                            
                            <p className="text-gray-500 flex items-center justify-center md:justify-start gap-1 text-sm mt-1">
                                <MapPin size={14} /> 
                                {profile.location}
                            </p>
                        </div>

                        <div className="md:ml-auto mb-6 md:mb-4 flex flex-col items-end gap-3">
                             <div className="flex items-center gap-4">
                                 <div className="text-right hidden md:block">
                                     <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t.reputation}</p>
                                     <p className="text-xl font-bold text-green-600">{points} pts</p>
                                 </div>
                                 {isEditing ? (
                                     <div className="flex gap-2">
                                         <button onClick={handleCancel} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                                             {t.cancel}
                                         </button>
                                         <button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 shadow-md flex items-center gap-2 transition-colors">
                                             <Save size={18} /> {t.save}
                                         </button>
                                     </div>
                                 ) : (
                                     <button onClick={() => setIsEditing(true)} className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 shadow-sm flex items-center gap-2 transition-colors hover:shadow-md">
                                         <Edit2 size={16} /> {t.edit_profile}
                                     </button>
                                 )}
                             </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-8 border-t border-gray-50 pt-6">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h3 className="text-sm font-bold text-gray-700">{t.profile_completion}</h3>
                                <p className="text-xs text-gray-400">Complete your profile to get better AI recommendations</p>
                            </div>
                            <span className="text-sm font-bold text-green-600">{strength}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${strength}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Personal Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                        <User className="text-blue-600" size={20} />
                        <h2 className="text-lg font-bold text-gray-900">{t.personal_info}</h2>
                    </div>
                    <div className="space-y-1">
                        {renderInput("Full Name", 'name')}
                        {renderInput("Mobile Number", 'phone')}
                        <div className="grid grid-cols-2 gap-4">
                            {renderInput(t.gender, 'gender', 'text', ['Male', 'Female', 'Other'])}
                            {renderInput(t.age, 'age', 'number')}
                        </div>
                        {renderInput(t.language, 'preferredLanguage', 'text', ['English', 'Hindi', 'Marathi', 'Malayalam', 'Tamil'])}
                        <div className="grid grid-cols-2 gap-4">
                            {renderInput(t.experience, 'experienceYears', 'number')}
                            {renderInput(t.farmer_category, 'farmerCategory', 'text', ['Small', 'Marginal', 'Medium', 'Large'])}
                        </div>
                    </div>
                </div>

                {/* 2. Location Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                        <MapPin className="text-red-500" size={20} />
                        <h2 className="text-lg font-bold text-gray-900">{t.location_details}</h2>
                    </div>
                    <div className="space-y-1">
                        {renderInput(t.state, 'state')}
                        {renderInput(t.district, 'district')}
                        {renderInput(t.taluka, 'taluka')}
                        <div className="grid grid-cols-2 gap-4">
                            {renderInput(t.village, 'village')}
                            {renderInput(t.pincode, 'pinCode', 'number')}
                        </div>
                    </div>
                </div>

                {/* 3. Land & Soil Health */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                        <Layers className="text-amber-600" size={20} />
                        <h2 className="text-lg font-bold text-gray-900">{t.land_soil_health}</h2>
                    </div>
                    <div className="space-y-1">
                        <div className="grid grid-cols-2 gap-4">
                            {renderInput(t.total_area, 'totalLandArea', 'number')}
                            {renderInput('Unit', 'landUnit', 'text', ['Acres', 'Hectares'])}
                        </div>
                        {renderInput(t.number_of_plots, 'numberOfPlots', 'number')}
                        {renderInput(t.soil_type, 'soilType', 'text', ['Black', 'Red', 'Sandy', 'Loamy', 'Clay', 'Alluvial'])}
                        {renderInput(t.soil_fertility, 'soilFertility', 'text', ['Low', 'Medium', 'High'])}
                        <div className="grid grid-cols-2 gap-4">
                            {renderInput(t.soil_test_done, 'soilTestingDone', 'text', ['Yes', 'No'])}
                            {renderInput(t.last_test_year, 'lastSoilTestYear', 'number')}
                        </div>
                    </div>
                </div>

                {/* 4. Water & Irrigation */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                        <Droplets className="text-blue-500" size={20} />
                        <h2 className="text-lg font-bold text-gray-900">{t.water_irrigation}</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.irrigation_sources}</label>
                            <div className="flex flex-wrap gap-2">
                                {['Well', 'Canal', 'Borewell', 'Rainfed', 'Drip', 'Sprinkler'].map(method => {
                                    const isSelected = (isEditing ? tempProfile : profile).irrigationMethods.includes(method);
                                    return (
                                        <button
                                            key={method}
                                            disabled={!isEditing}
                                            onClick={() => toggleArrayItem('irrigationMethods', method)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                                                isSelected 
                                                ? 'bg-blue-100 text-blue-700 border-blue-200' 
                                                : 'bg-gray-50 text-gray-500 border-gray-200'
                                            }`}
                                        >
                                            {method}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {renderInput(t.water_availability, 'waterAvailability', 'text', ['Low', 'Medium', 'High'])}
                    </div>
                </div>

                {/* 5. Crops & Practice */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                        <Sprout className="text-green-600" size={20} />
                        <h2 className="text-lg font-bold text-gray-900">{t.crops_practice}</h2>
                    </div>
                    <div className="space-y-1">
                        <div className="grid grid-cols-2 gap-4">
                            {renderInput(t.main_crop, 'mainCrop')}
                            {renderInput(t.secondary_crop, 'secondaryCrop')}
                        </div>
                        {renderInput(t.modern_techniques, 'modernTechniquesUsed', 'text', ['Yes', 'No'])}
                        
                        <div className="mt-4 space-y-3">
                            <label className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                                (isEditing ? tempProfile.organicCertified : profile.organicCertified) ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'
                            }`}>
                                <input 
                                    type="checkbox" 
                                    disabled={!isEditing}
                                    checked={isEditing ? tempProfile.organicCertified : profile.organicCertified}
                                    onChange={(e) => setTempProfile({...tempProfile, organicCertified: e.target.checked})}
                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                />
                                <div className="flex-1">
                                    <span className="text-sm font-bold text-gray-800 block">{t.organic_certified}</span>
                                </div>
                                {(isEditing ? tempProfile.organicCertified : profile.organicCertified) && <ShieldCheck size={18} className="text-green-600" />}
                            </label>

                            <label className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                                (isEditing ? tempProfile.kccCardHolder : profile.kccCardHolder) ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'
                            }`}>
                                <input 
                                    type="checkbox" 
                                    disabled={!isEditing}
                                    checked={isEditing ? tempProfile.kccCardHolder : profile.kccCardHolder}
                                    onChange={(e) => setTempProfile({...tempProfile, kccCardHolder: e.target.checked})}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                    <span className="text-sm font-bold text-gray-800 block">{t.kcc_holder}</span>
                                </div>
                                {(isEditing ? tempProfile.kccCardHolder : profile.kccCardHolder) && <Banknote size={18} className="text-blue-600" />}
                            </label>
                        </div>
                    </div>
                </div>

                {/* 6. Resources (Machinery & Labor & Livestock) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                        <Tractor className="text-orange-600" size={20} />
                        <h2 className="text-lg font-bold text-gray-900">{t.resources}</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.machinery_owned}</label>
                            <div className="flex flex-wrap gap-2">
                                {['Tractor', 'Power Tiller', 'Harvester', 'Thresher', 'Pump Set', 'Sprayer', 'Drone'].map(item => {
                                    const isSelected = (isEditing ? tempProfile : profile).machinery.includes(item);
                                    return (
                                        <button
                                            key={item}
                                            disabled={!isEditing}
                                            onClick={() => toggleArrayItem('machinery', item)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                                                isSelected 
                                                ? 'bg-orange-100 text-orange-700 border-orange-200' 
                                                : 'bg-gray-50 text-gray-500 border-gray-200'
                                            }`}
                                        >
                                            {item}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {renderInput(t.labor_availability, 'laborAvailability', 'text', ['Low', 'Medium', 'High'])}

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.livestock}</label>
                            {isEditing ? (
                                <textarea 
                                    value={tempProfile.livestock.join(', ')}
                                    onChange={(e) => setTempProfile({...tempProfile, livestock: e.target.value.split(',').map(s => s.trim())})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 h-16"
                                    placeholder="e.g. 2 Cows, 10 Hens"
                                />
                            ) : (
                                <div className="flex gap-2 flex-wrap">
                                    {profile.livestock.map((item, idx) => (
                                        <span key={idx} className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                                            {item}
                                        </span>
                                    ))}
                                    {profile.livestock.length === 0 && <span className="text-gray-400 text-sm italic">No livestock added</span>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;