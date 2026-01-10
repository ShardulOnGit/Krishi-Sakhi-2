import React, { useState } from 'react';
import { ScrollText, ExternalLink, ChevronRight, Sparkles, Loader2, CheckCircle, Search, X } from 'lucide-react';
import { Scheme } from '../types';
import { getSchemeRecommendations, SchemeRecommendation } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

const SCHEMES: Scheme[] = [
    {
        id: '1',
        name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
        provider: 'Central',
        category: 'Financial Support',
        description: 'Direct income support of Rs. 6,000 per year to landholding farmer families, payable in three equal installments of Rs. 2,000 each.',
        benefits: 'Rs. 6000/year',
        eligibility: 'All landholding farmers with cultivable land.'
    },
    {
        id: '2',
        name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        provider: 'Central',
        category: 'Insurance',
        description: 'Crop insurance scheme that provides financial support to farmers suffering crop loss/damage arising out of unforeseen events.',
        benefits: 'Insurance coverage against crop failure',
        eligibility: 'Farmers with insurable crops',
        deadline: '31st July'
    },
    {
        id: '3',
        name: 'Subhiksha Keralam',
        provider: 'State (Kerala)',
        category: 'Development',
        description: 'Aims to achieve self-sufficiency in food production by bringing fallow land under cultivation in Kerala.',
        benefits: 'Subsidy for seeds and fertilizers',
        eligibility: 'Farmers residing in Kerala'
    },
    {
        id: '4',
        name: 'Kisan Credit Card (KCC)',
        provider: 'Central',
        category: 'Credit',
        description: 'Provides farmers with adequate and timely credit support from the banking system for their cultivation and other needs.',
        benefits: 'Low interest loans (4% effective rate)',
        eligibility: 'All farmers, tenant farmers, sharecroppers'
    },
    {
        id: '5',
        name: 'PM Krishi Sinchayi Yojana (PMKSY)',
        provider: 'Central',
        category: 'Irrigation',
        description: 'Subsidies for installing drip and sprinkler irrigation systems to improve water use efficiency.',
        benefits: 'Up to 55% subsidy on micro-irrigation systems',
        eligibility: 'Farmers with own land and water source'
    },
    {
        id: '6',
        name: 'Soil Health Card Scheme',
        provider: 'Central',
        category: 'Advisory',
        description: 'Provides information to farmers on nutrient status of their soil along with recommendation on appropriate dosage of nutrients.',
        benefits: 'Free soil testing and report every 2 years',
        eligibility: 'All farmers'
    }
];

const Schemes: React.FC = () => {
    const { t, language } = useLanguage();
    const [filter, setFilter] = useState('All');
    const [showMatchmaker, setShowMatchmaker] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [recommendations, setRecommendations] = useState<SchemeRecommendation[]>([]);
    
    // User Profile Form State
    const [profile, setProfile] = useState({
        state: 'Kerala',
        landArea: '',
        category: 'General',
        crops: '',
        needs: ''
    });

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        const results = await getSchemeRecommendations(profile, SCHEMES, language);
        setRecommendations(results);
        setIsAnalyzing(false);
    };

    const getRecommendationDetails = (schemeId: string) => {
        return recommendations.find(r => r.schemeId === schemeId);
    };

    // Filter Logic: If recommendations exist, prioritize them. Otherwise filter by tag.
    let displaySchemes = SCHEMES;
    
    if (recommendations.length > 0) {
        // Sort schemes: Recommended ones first
        displaySchemes = [...SCHEMES].sort((a, b) => {
            const recA = getRecommendationDetails(a.id);
            const recB = getRecommendationDetails(b.id);
            const scoreA = recA ? recA.matchScore : 0;
            const scoreB = recB ? recB.matchScore : 0;
            return scoreB - scoreA;
        });
    } else {
        displaySchemes = filter === 'All' ? SCHEMES : SCHEMES.filter(s => s.provider.includes(filter) || s.category === filter);
    }

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ScrollText className="text-pink-600" /> {t.schemes_title}
                    </h1>
                    <p className="text-gray-500 mt-1">{t.schemes_subtitle}</p>
                </div>
                
                <button 
                    onClick={() => setShowMatchmaker(!showMatchmaker)}
                    className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                    {showMatchmaker ? <X size={20} /> : <Sparkles size={20} />}
                    {showMatchmaker ? t.close_matchmaker : t.check_eligibility}
                </button>
            </div>

            {/* AI Matchmaker Panel */}
            {showMatchmaker && (
                <div className="bg-white rounded-2xl p-6 md:p-8 mb-8 border border-purple-100 shadow-xl animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-6 text-purple-700">
                        <Sparkles size={24} />
                        <h2 className="text-xl font-bold">{t.ai_matchmaker}</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.state}</label>
                            <select 
                                value={profile.state}
                                onChange={(e) => setProfile({...profile, state: e.target.value})}
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option>Kerala</option>
                                <option>Maharashtra</option>
                                <option>Punjab</option>
                                <option>Tamil Nadu</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.land_area} ({t.acres})</label>
                            <input 
                                type="number" 
                                value={profile.landArea}
                                onChange={(e) => setProfile({...profile, landArea: e.target.value})}
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g. 2.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.crop_name}</label>
                            <input 
                                type="text" 
                                value={profile.crops}
                                onChange={(e) => setProfile({...profile, crops: e.target.value})}
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g. Rice, Coconut"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.specific_need}</label>
                            <input 
                                type="text" 
                                value={profile.needs}
                                onChange={(e) => setProfile({...profile, needs: e.target.value})}
                                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g. Loan, Irrigation"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button 
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                        >
                            {isAnalyzing ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                            {isAnalyzing ? t.analyzing_profile : t.find_schemes}
                        </button>
                    </div>
                </div>
            )}

            {/* Filters (Hidden if matchmaker results are active to reduce clutter, or kept for fallback) */}
            {!recommendations.length && (
                <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
                    {['All', 'Central', 'State', 'Financial Support', 'Insurance', 'Credit', 'Irrigation'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displaySchemes.map(scheme => {
                    const rec = getRecommendationDetails(scheme.id);
                    const isRecommended = !!rec;

                    return (
                        <div 
                            key={scheme.id} 
                            className={`bg-white p-6 rounded-xl border transition-all group relative ${
                                isRecommended ? 'border-purple-300 shadow-md ring-1 ring-purple-100' : 'border-gray-200 shadow-sm hover:border-pink-300'
                            }`}
                        >
                            {isRecommended && (
                                <div className="absolute -top-3 left-6 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 flex items-center gap-1">
                                    <Sparkles size={12} /> {rec.matchScore}% {t.match_score}
                                </div>
                            )}

                            <div className="absolute top-6 right-6 text-gray-300 group-hover:text-pink-600 transition-colors">
                                <ExternalLink size={20} />
                            </div>
                            
                            <div className="mb-4 mt-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${
                                    scheme.provider === 'Central' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                }`}>
                                    {scheme.provider}
                                </span>
                                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {scheme.category}
                                </span>
                            </div>
                            
                            <h3 className="font-bold text-xl text-gray-900 mb-2 pr-8">{scheme.name}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{scheme.description}</p>
                            
                            {/* AI Reason */}
                            {isRecommended && (
                                <div className="mb-4 bg-purple-50 p-3 rounded-lg border border-purple-100 flex gap-2 items-start">
                                    <CheckCircle size={16} className="text-purple-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-purple-800 font-medium">
                                        {rec.reason}
                                    </p>
                                </div>
                            )}
                            
                            <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t.benefits}:</span>
                                    <span className="font-medium text-gray-900">{scheme.benefits}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">{t.eligibility}:</span>
                                    <span className="font-medium text-gray-900">{scheme.eligibility}</span>
                                </div>
                                 {scheme.deadline && (
                                    <div className="flex justify-between text-red-600">
                                        <span>{t.deadline}:</span>
                                        <span className="font-bold">{scheme.deadline}</span>
                                    </div>
                                )}
                            </div>

                            <button className="w-full py-2 border border-pink-600 text-pink-600 font-bold rounded-lg hover:bg-pink-50 transition-colors flex items-center justify-center gap-1">
                                {t.check_eligibility} <ChevronRight size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Schemes;