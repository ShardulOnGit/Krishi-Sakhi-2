import React, { useState } from 'react';
import { ScrollText, ExternalLink, ChevronRight, Sparkles, Loader2, CheckCircle, Search, X, FileText, CheckSquare, Lightbulb, Link as LinkIcon } from 'lucide-react';
import { Scheme, ApplicationGuide } from '../types';
import { getSchemeRecommendations, SchemeRecommendation, generateSchemeApplicationGuide } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

const SCHEMES: Scheme[] = [
    {
        id: '1',
        name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
        provider: 'Central',
        category: 'Financial Support',
        description: 'Direct income support of Rs. 6,000 per year to landholding farmer families, payable in three equal installments of Rs. 2,000 each.',
        benefits: 'Rs. 6000/year',
        eligibility: 'All landholding farmers with cultivable land.',
        link: 'https://pmkisan.gov.in/'
    },
    {
        id: '2',
        name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        provider: 'Central',
        category: 'Insurance',
        description: 'Crop insurance scheme that provides financial support to farmers suffering crop loss/damage arising out of unforeseen events.',
        benefits: 'Insurance coverage against crop failure',
        eligibility: 'Farmers with insurable crops',
        deadline: '31st July',
        link: 'https://pmfby.gov.in/'
    },
    {
        id: '3',
        name: 'Subhiksha Keralam',
        provider: 'State (Kerala)',
        category: 'Development',
        description: 'Aims to achieve self-sufficiency in food production by bringing fallow land under cultivation in Kerala.',
        benefits: 'Subsidy for seeds and fertilizers',
        eligibility: 'Farmers residing in Kerala',
        link: 'https://aims.kerala.gov.in/'
    },
    {
        id: '4',
        name: 'Kisan Credit Card (KCC)',
        provider: 'Central',
        category: 'Credit',
        description: 'Provides farmers with adequate and timely credit support from the banking system for their cultivation and other needs.',
        benefits: 'Low interest loans (4% effective rate)',
        eligibility: 'All farmers, tenant farmers, sharecroppers',
        link: 'https://myscheme.gov.in/schemes/kcc'
    },
    {
        id: '5',
        name: 'PM Krishi Sinchayi Yojana (PMKSY)',
        provider: 'Central',
        category: 'Irrigation',
        description: 'Subsidies for installing drip and sprinkler irrigation systems to improve water use efficiency.',
        benefits: 'Up to 55% subsidy on micro-irrigation systems',
        eligibility: 'Farmers with own land and water source',
        link: 'https://pmksy.gov.in/'
    },
    {
        id: '6',
        name: 'Soil Health Card Scheme',
        provider: 'Central',
        category: 'Advisory',
        description: 'Provides information to farmers on nutrient status of their soil along with recommendation on appropriate dosage of nutrients.',
        benefits: 'Free soil testing and report every 2 years',
        eligibility: 'All farmers',
        link: 'https://www.soilhealth.dac.gov.in/'
    }
];

const Schemes: React.FC = () => {
    const { t, language } = useLanguage();
    const [filter, setFilter] = useState('All');
    const [showMatchmaker, setShowMatchmaker] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [recommendations, setRecommendations] = useState<SchemeRecommendation[]>([]);
    
    // Guide State
    const [activeGuideScheme, setActiveGuideScheme] = useState<Scheme | null>(null);
    const [guideData, setGuideData] = useState<ApplicationGuide | null>(null);
    const [isGuideLoading, setIsGuideLoading] = useState(false);

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

    const handleOpenGuide = async (scheme: Scheme) => {
        setActiveGuideScheme(scheme);
        setGuideData(null);
        setIsGuideLoading(true);
        const data = await generateSchemeApplicationGuide(scheme.name, language);
        setGuideData(data);
        setIsGuideLoading(false);
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

                            {/* External Link Icon Button */}
                            {scheme.link && (
                                <a 
                                    href={scheme.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="absolute top-6 right-6 text-gray-400 hover:text-pink-600 transition-colors p-2 hover:bg-pink-50 rounded-full"
                                    title={t.visit_official_site}
                                >
                                    <ExternalLink size={20} />
                                </a>
                            )}
                            
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
                            
                            <h3 className="font-bold text-xl text-gray-900 mb-2 pr-12">{scheme.name}</h3>
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

                            <div className="flex gap-3">
                                {/* AI Guide Button */}
                                <button 
                                    onClick={() => handleOpenGuide(scheme)}
                                    className="flex-1 py-2 bg-pink-50 border border-pink-200 text-pink-700 font-bold rounded-lg hover:bg-pink-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FileText size={16} /> {t.guide_me}
                                </button>

                                {/* Official Apply Button */}
                                {scheme.link ? (
                                    <a 
                                        href={scheme.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-2 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {t.apply_now} <ChevronRight size={16} />
                                    </a>
                                ) : (
                                    <button disabled className="flex-1 py-2 bg-gray-100 text-gray-400 font-bold rounded-lg cursor-not-allowed">
                                        Link Unavailable
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* AI Application Guide Modal */}
            {activeGuideScheme && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Sparkles className="text-pink-600" size={20} /> {t.application_guide}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">{activeGuideScheme.name}</p>
                            </div>
                            <button onClick={() => setActiveGuideScheme(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {isGuideLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                    <Loader2 className="animate-spin mb-4 text-pink-600" size={40} />
                                    <p className="font-medium animate-pulse">{t.generating_guide}</p>
                                </div>
                            ) : guideData ? (
                                <div className="space-y-6">
                                    {/* Documents Section */}
                                    <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                                        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                            <CheckSquare size={18} /> {t.documents_required}
                                        </h3>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {guideData.documents.map((doc, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                                                    <CheckCircle size={14} className="mt-0.5 shrink-0 text-blue-600" />
                                                    {doc}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Steps Section */}
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <ChevronRight className="bg-pink-100 text-pink-600 rounded-full p-0.5" size={20} /> 
                                            {t.step_by_step}
                                        </h3>
                                        <div className="space-y-4 pl-2 border-l-2 border-pink-100 ml-2">
                                            {guideData.steps.map((step, idx) => (
                                                <div key={idx} className="relative pl-6">
                                                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-pink-100 border-2 border-white rounded-full flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                                                    </div>
                                                    <p className="text-gray-700 text-sm leading-relaxed">
                                                        <span className="font-bold text-gray-900 mr-2">Step {idx + 1}:</span>
                                                        {step}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tips Section */}
                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex gap-3">
                                        <Lightbulb className="text-yellow-600 shrink-0" size={24} />
                                        <div>
                                            <h4 className="font-bold text-yellow-800 text-sm mb-1">{t.important_tips}</h4>
                                            <p className="text-xs text-yellow-700 leading-relaxed">{guideData.tips}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-red-500">Failed to load guide. Please try again.</p>
                            )}
                        </div>

                        {/* Footer Action */}
                        {!isGuideLoading && (
                            <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
                                {activeGuideScheme.link && (
                                    <a 
                                        href={activeGuideScheme.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-pink-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-pink-700 transition-colors flex items-center gap-2 shadow-md"
                                    >
                                        {t.visit_official_site} <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schemes;