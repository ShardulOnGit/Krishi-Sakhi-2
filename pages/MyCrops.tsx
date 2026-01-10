import React, { useState, useEffect } from 'react';
import { Wheat, Calendar, Plus, Trash2, Sprout, AlertCircle, Edit2, Droplets, Leaf, ArrowRight, TrendingUp, Scale, ShoppingBag, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Crop } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

// Predefined crop templates for "Real World" ease of use
const CROP_TEMPLATES = [
    { name: 'Rice', duration: 120, image: 'https://images.unsplash.com/photo-1536617621972-060442017c26?auto=format&fit=crop&q=80&w=600' },
    { name: 'Wheat', duration: 110, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600' },
    { name: 'Cotton', duration: 160, image: 'https://images.unsplash.com/photo-1594294026359-c2900738c6e2?auto=format&fit=crop&q=80&w=600' },
    { name: 'Corn (Maize)', duration: 100, image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600' },
    { name: 'Tomato', duration: 90, image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=600' },
    { name: 'Potato', duration: 90, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=600' },
    { name: 'Sugarcane', duration: 365, image: 'https://images.unsplash.com/photo-1601633596280-459846b0e8c0?auto=format&fit=crop&q=80&w=600' },
    { name: 'Coconut', duration: 365, image: 'https://images.unsplash.com/photo-1596434466228-5e20d2d2c161?auto=format&fit=crop&q=80&w=600' },
    { name: 'Areca Nut', duration: 365, image: 'https://images.unsplash.com/photo-1620067645152-326922370783?auto=format&fit=crop&q=80&w=600' },
    { name: 'Other', duration: 90, image: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80&w=600' },
];

const MyCrops: React.FC = () => {
    const { t } = useLanguage();
    const [crops, setCrops] = useState<Crop[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Crop>>({
        name: '',
        variety: '',
        area: '',
        sowingDate: new Date().toISOString().split('T')[0],
        stage: 'Seedling',
        health: 'Good',
        nextAction: '',
        image: '',
        expectedYield: '',
        seedSource: '',
        irrigationMethod: '',
        notes: ''
    });

    useEffect(() => {
        const saved = localStorage.getItem('krishi_crops');
        if (saved) {
            setCrops(JSON.parse(saved));
        } else {
            // Initial Seed Data if empty
            const initialCrops: Crop[] = [
                { 
                    id: '1', 
                    name: 'Rice', 
                    variety: 'Sona Masoori', 
                    area: '4', 
                    sowingDate: '2024-11-01', 
                    harvestDate: '2025-03-01', 
                    stage: 'Vegetative', 
                    health: 'Good', 
                    image: CROP_TEMPLATES[0].image, 
                    nextAction: 'Maintain water level',
                    expectedYield: '2.5 Tons',
                    irrigationMethod: 'Canal'
                }
            ];
            setCrops(initialCrops);
            localStorage.setItem('krishi_crops', JSON.stringify(initialCrops));
        }
    }, []);

    const saveCrops = (updatedCrops: Crop[]) => {
        setCrops(updatedCrops);
        localStorage.setItem('krishi_crops', JSON.stringify(updatedCrops));
    };

    const handleOpenModal = (crop?: Crop) => {
        if (crop) {
            setEditingId(crop.id);
            setFormData({ ...crop });
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                variety: '',
                area: '',
                sowingDate: new Date().toISOString().split('T')[0],
                stage: 'Seedling',
                health: 'Good',
                nextAction: '',
                image: '',
                expectedYield: '',
                seedSource: '',
                irrigationMethod: '',
                notes: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCropTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedName = e.target.value;
        const template = CROP_TEMPLATES.find(c => c.name === selectedName);
        
        let newFormData = { ...formData, name: selectedName };
        
        if (template) {
            newFormData.image = template.image;
            // Auto-calculate estimated harvest date
            if (newFormData.sowingDate) {
                const date = new Date(newFormData.sowingDate);
                date.setDate(date.getDate() + template.duration);
                newFormData.harvestDate = date.toISOString().split('T')[0];
            }
        }
        setFormData(newFormData);
    };

    const handleSowingDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateStr = e.target.value;
        let newFormData = { ...formData, sowingDate: dateStr };
        
        // Update harvest date if crop type is known
        const template = CROP_TEMPLATES.find(c => c.name === formData.name);
        if (template && dateStr) {
            const date = new Date(dateStr);
            date.setDate(date.getDate() + template.duration);
            newFormData.harvestDate = date.toISOString().split('T')[0];
        }
        setFormData(newFormData);
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.area || !formData.sowingDate) {
            alert("Please fill in required fields (Name, Area, Sowing Date)");
            return;
        }

        const cropData = {
            id: editingId || Date.now().toString(),
            name: formData.name || 'Unknown',
            variety: formData.variety || '',
            area: formData.area || '0',
            sowingDate: formData.sowingDate || '',
            harvestDate: formData.harvestDate,
            stage: formData.stage || 'Seedling',
            health: formData.health || 'Good',
            nextAction: formData.nextAction || 'Monitor Growth',
            image: formData.image || CROP_TEMPLATES[9].image, // Default to 'Other' if empty
            expectedYield: formData.expectedYield || '',
            seedSource: formData.seedSource || '',
            irrigationMethod: formData.irrigationMethod || '',
            notes: formData.notes || ''
        } as Crop;

        if (editingId) {
            saveCrops(crops.map(c => c.id === editingId ? cropData : c));
        } else {
            saveCrops([...crops, cropData]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to remove this crop record?')) {
            saveCrops(crops.filter(c => c.id !== id));
        }
    };

    // Calculate progress percentage
    const getProgress = (start: string, end?: string) => {
        if (!end) return 50;
        const startDate = new Date(start).getTime();
        const endDate = new Date(end).getTime();
        const now = new Date().getTime();
        const total = endDate - startDate;
        const elapsed = now - startDate;
        
        if (total <= 0) return 100;
        return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
    };

    // Helper to count days
    const getDaysElapsed = (date: string) => {
        const start = new Date(date).getTime();
        const now = new Date().getTime();
        const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        return diff;
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-7xl mx-auto space-y-8">
            {/* Header with Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Wheat className="text-green-600" /> {t.crops_title}
                    </h1>
                    <p className="text-gray-500 mt-1">{t.crops_subtitle}</p>
                </div>
                
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm flex items-center gap-3 flex-1 md:flex-none">
                        <div className="bg-green-100 p-2 rounded-full text-green-600"><Sprout size={18} /></div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">{t.active_crops}</p>
                            <p className="font-bold text-lg">{crops.length}</p>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm flex items-center gap-3 flex-1 md:flex-none">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600"><TrendingUp size={18} /></div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">{t.total_area}</p>
                            <p className="font-bold text-lg">{crops.reduce((acc, curr) => acc + parseFloat(curr.area || '0'), 0)} <span className="text-xs text-gray-400">{t.acres}</span></p>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all ml-auto"
                    >
                        <Plus size={20} /> {t.add_crop}
                    </button>
                </div>
            </div>

            {/* Crop Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {crops.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Sprout size={48} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">{t.no_crops}</h3>
                        <p className="text-gray-500 mb-6">{t.start_adding_crops}</p>
                        <button onClick={() => handleOpenModal()} className="text-green-600 font-bold hover:underline">{t.add_first_crop}</button>
                    </div>
                )}

                {crops.map((crop) => {
                    const progress = getProgress(crop.sowingDate, crop.harvestDate);
                    const daysOld = getDaysElapsed(crop.sowingDate);
                    const isExpanded = expandedCardId === crop.id;

                    return (
                        <div key={crop.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col h-full">
                            {/* Image Header */}
                            <div className="h-44 overflow-hidden relative bg-gray-100">
                                <img src={crop.image} alt={crop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <button onClick={() => handleOpenModal(crop)} className="bg-white/90 p-1.5 rounded-full hover:bg-white text-gray-700 transition-colors shadow-sm">
                                        <Edit2 size={14} />
                                    </button>
                                </div>
                                
                                <div className="absolute bottom-0 left-0 p-4 w-full text-white">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h3 className="font-bold text-2xl drop-shadow-sm">{crop.name}</h3>
                                            <p className="text-sm text-gray-200 font-medium flex items-center gap-1">
                                                {crop.variety || 'Unknown Variety'}
                                                {crop.irrigationMethod && (
                                                    <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] backdrop-blur-sm border border-white/30 ml-1">
                                                        {crop.irrigationMethod}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm mb-1 ${
                                            crop.health === 'Good' ? 'bg-green-500/90 border-green-400 text-white' : 
                                            crop.health === 'Needs Attention' ? 'bg-yellow-500/90 border-yellow-400 text-white' : 'bg-red-500/90 border-red-400 text-white'
                                        }`}>
                                            {crop.health}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-4 text-sm">
                                    <div className="bg-gray-50 p-2 rounded-lg">
                                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">{t.total_area}</p>
                                        <p className="font-bold text-gray-800 text-lg">{crop.area} <span className="text-xs font-normal text-gray-500">{t.acres}</span></p>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded-lg">
                                        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">{t.days}</p>
                                        <p className="font-bold text-gray-800 text-lg">{daysOld}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex justify-between items-end mb-1">
                                            <p className="text-gray-500 text-xs">{t.stage}: <span className="font-bold text-blue-600">{crop.stage}</span></p>
                                            <span className="text-xs font-bold text-green-600">{progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-green-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                                            <span>Sown: {new Date(crop.sowingDate).toLocaleDateString()}</span>
                                            <span>Harvest: {crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : '--'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 pt-3 mt-1 space-y-3 text-sm animate-fade-in">
                                        {(crop.expectedYield || crop.seedSource) && (
                                            <div className="grid grid-cols-2 gap-2">
                                                {crop.expectedYield && (
                                                    <div>
                                                        <span className="text-gray-500 text-xs block">{t.expected_yield}</span>
                                                        <span className="font-medium text-gray-800">{crop.expectedYield}</span>
                                                    </div>
                                                )}
                                                {crop.seedSource && (
                                                    <div>
                                                        <span className="text-gray-500 text-xs block">{t.seed_source}</span>
                                                        <span className="font-medium text-gray-800">{crop.seedSource}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {crop.notes && (
                                            <div className="bg-yellow-50 p-2 rounded border border-yellow-100 text-xs text-yellow-800 italic">
                                                "{crop.notes}"
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mt-auto pt-3 border-t border-gray-100">
                                     <div className="flex items-center justify-between mb-2">
                                        {crop.nextAction ? (
                                             <div className="flex items-center gap-2 text-xs font-medium text-orange-700 bg-orange-50 px-2 py-1 rounded-full border border-orange-100 max-w-[70%]">
                                                 <AlertCircle size={12} className="shrink-0" />
                                                 <span className="truncate">{crop.nextAction}</span>
                                             </div>
                                        ) : <span></span>}
                                        
                                        <button 
                                            onClick={() => setExpandedCardId(isExpanded ? null : crop.id)}
                                            className="text-gray-400 hover:text-green-600 transition-colors"
                                        >
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                     </div>
                                     
                                     <div className="flex justify-between items-center">
                                         <button 
                                            onClick={() => handleDelete(crop.id)} 
                                            className="text-gray-400 hover:text-red-500 transition-colors text-xs flex items-center gap-1 p-1 hover:bg-red-50 rounded"
                                         >
                                            <Trash2 size={12} /> {t.remove_crop}
                                         </button>
                                     </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{editingId ? t.edit : t.add_crop}</h2>
                                <p className="text-sm text-gray-500">{t.crops_subtitle}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><Trash2 size={20} className="hidden" /> <span className="text-2xl">&times;</span></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="space-y-6">
                                {/* Section 1: Basic Info */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Sprout size={16} className="text-green-600" /> {t.farm_details}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.crop_name} *</label>
                                            <select 
                                                value={formData.name}
                                                onChange={handleCropTypeChange}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
                                            >
                                                <option value="">Select a crop...</option>
                                                {CROP_TEMPLATES.map(t => (
                                                    <option key={t.name} value={t.name}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.variety}</label>
                                            <input 
                                                type="text" 
                                                value={formData.variety}
                                                onChange={(e) => setFormData({...formData, variety: e.target.value})}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                                                placeholder="e.g. Sona Masoori, Hybrid-45"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.land_area} ({t.acres}) *</label>
                                            <input 
                                                type="number" 
                                                value={formData.area}
                                                onChange={(e) => setFormData({...formData, area: e.target.value})}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                                                placeholder="0.0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.image_url} (Optional)</label>
                                            <input 
                                                type="text" 
                                                value={formData.image}
                                                onChange={(e) => setFormData({...formData, image: e.target.value})}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-900"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                {/* Section 2: Timeline & Status */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Calendar size={16} className="text-blue-600" /> {t.stage} & {t.health}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.sowing_date} *</label>
                                            <input 
                                                type="date" 
                                                value={formData.sowingDate}
                                                onChange={handleSowingDateChange}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.harvest_date}</label>
                                            <input 
                                                type="date" 
                                                value={formData.harvestDate}
                                                onChange={(e) => setFormData({...formData, harvestDate: e.target.value})}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.stage}</label>
                                            <select 
                                                value={formData.stage}
                                                onChange={(e) => setFormData({...formData, stage: e.target.value})}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
                                            >
                                                <option>Seedling</option>
                                                <option>Vegetative</option>
                                                <option>Flowering</option>
                                                <option>Fruiting</option>
                                                <option>Maturing</option>
                                                <option>Harvest Ready</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.health}</label>
                                            <select 
                                                value={formData.health}
                                                onChange={(e) => setFormData({...formData, health: e.target.value as any})}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
                                            >
                                                <option>Good</option>
                                                <option>Needs Attention</option>
                                                <option>Critical</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Additional Details */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 mt-6 flex items-center gap-2">
                                        <FileText size={16} className="text-orange-600" /> {t.notes} & {t.next_action}
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.next_action}</label>
                                            <input 
                                                type="text" 
                                                value={formData.nextAction}
                                                onChange={(e) => setFormData({...formData, nextAction: e.target.value})}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                                                placeholder="e.g. Apply Fertilizer, Water"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.notes}</label>
                                            <textarea 
                                                value={formData.notes}
                                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500 h-24 text-gray-900"
                                                placeholder="Any additional observations..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-200 transition-colors"
                            >
                                {t.cancel}
                            </button>
                            <button 
                                onClick={handleSubmit} 
                                className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 shadow-md transition-colors"
                            >
                                {editingId ? t.update_crop : t.save_crop}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCrops;