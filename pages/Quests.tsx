import React, { useState, useEffect } from 'react';
import { Award, Droplets, Leaf, Recycle, CheckCircle2, Upload, Loader2, X, Camera, RefreshCw } from 'lucide-react';
import { Quest, QuestVerificationResult } from '../types';
import { verifyQuestSubmission } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

const INITIAL_QUESTS: Quest[] = [
    {
        id: '1',
        title: 'Water Warrior',
        description: 'Install or use drip irrigation to save water in your field.',
        points: 500,
        progress: 0,
        total: 1,
        current: 0,
        unit: 'setup',
        icon: 'water'
    },
    {
        id: '2',
        title: 'Organic Convert',
        description: 'Apply organic compost or manure instead of chemical fertilizer.',
        points: 300,
        progress: 0,
        total: 1,
        current: 0,
        unit: 'application',
        icon: 'leaf'
    },
    {
        id: '3',
        title: 'Soil Health Guardian',
        description: 'Take a photo of a soil health card or soil testing kit in use.',
        points: 1000,
        progress: 0,
        total: 1,
        current: 0,
        unit: 'test',
        icon: 'test'
    }
];

const Quests: React.FC = () => {
    const { t, language } = useLanguage();
    const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
    const [totalPoints, setTotalPoints] = useState(1250);
    
    // Modal State
    const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
    const [proofImage, setProofImage] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<QuestVerificationResult | null>(null);

    // Load from local storage
    useEffect(() => {
        const savedQuests = localStorage.getItem('krishi_quests');
        const savedPoints = localStorage.getItem('krishi_points');
        if (savedQuests) setQuests(JSON.parse(savedQuests));
        if (savedPoints) setTotalPoints(parseInt(savedPoints));
    }, []);

    const saveState = (newQuests: Quest[], newPoints: number) => {
        setQuests(newQuests);
        setTotalPoints(newPoints);
        localStorage.setItem('krishi_quests', JSON.stringify(newQuests));
        localStorage.setItem('krishi_points', newPoints.toString());
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProofImage(reader.result as string);
                setVerificationResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVerify = async () => {
        if (!activeQuest || !proofImage) return;

        setIsVerifying(true);
        const result = await verifyQuestSubmission(proofImage, activeQuest.title, activeQuest.description, language);
        setIsVerifying(false);
        setVerificationResult(result);

        if (result.verified) {
            // Trigger confetti or success effect here conceptually
            const updatedQuests = quests.map(q => {
                if (q.id === activeQuest.id) {
                    return { ...q, progress: 100, current: q.total };
                }
                return q;
            });
            saveState(updatedQuests, totalPoints + activeQuest.points);
        }
    };

    const closeModal = () => {
        setActiveQuest(null);
        setProofImage(null);
        setVerificationResult(null);
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-4xl mx-auto">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-8 text-white mb-8 shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Award size={32} /> {t.quests_title}
                    </h1>
                    <p className="text-yellow-100 mb-6">{t.quests_subtitle}</p>
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                        <span className="font-bold text-2xl">{totalPoints.toLocaleString()}</span>
                        <span className="text-sm font-medium uppercase tracking-wider">{t.total_points}</span>
                    </div>
                </div>
                <Award size={200} className="absolute -right-10 -bottom-10 opacity-20 rotate-12" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.active_quests_title}</h2>
            <div className="grid gap-6">
                {quests.map(quest => (
                    <div key={quest.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 items-center transition-all hover:shadow-md">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${
                            quest.progress === 100 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                            {quest.icon === 'water' && <Droplets size={32} />}
                            {quest.icon === 'leaf' && <Leaf size={32} />}
                            {quest.icon === 'test' && <Recycle size={32} />}
                        </div>
                        
                        <div className="flex-1 w-full text-center md:text-left">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-lg text-gray-900">{quest.title}</h3>
                                {quest.progress === 100 && (
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <CheckCircle2 size={12} /> {t.quest_verified}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{quest.description}</p>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1 overflow-hidden">
                                <div 
                                    className={`h-2.5 rounded-full transition-all duration-1000 ${quest.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                                    style={{ width: `${quest.progress}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{quest.current} / {quest.total} {quest.unit}</span>
                                <span className="font-bold text-orange-500">+{quest.points} pts</span>
                            </div>
                        </div>

                        <button 
                            disabled={quest.progress === 100}
                            onClick={() => setActiveQuest(quest)}
                            className={`px-6 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors shadow-sm ${
                                quest.progress === 100 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {quest.progress === 100 ? t.claimed : t.check_in}
                        </button>
                    </div>
                ))}
            </div>

            {/* Verification Modal */}
            {activeQuest && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in-up overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">{t.verify_quest}: {activeQuest.title}</h3>
                            <button onClick={closeModal} className="p-1 hover:bg-gray-200 rounded-full"><X size={20} /></button>
                        </div>
                        
                        <div className="p-6">
                            {!verificationResult ? (
                                <>
                                    <p className="text-gray-600 text-sm mb-4">
                                        {t.upload_proof}: <br/>
                                        <span className="font-semibold text-gray-800">"{activeQuest.description}"</span>
                                    </p>

                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50 text-center relative hover:bg-gray-100 transition-colors">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            capture="environment"
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {proofImage ? (
                                            <div className="relative">
                                                <img src={proofImage} alt="Proof" className="max-h-48 mx-auto rounded-lg shadow-md" />
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault(); 
                                                        setProofImage(null);
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                                <Camera size={32} />
                                                <span className="font-medium text-sm">{t.tap_to_upload}</span>
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        onClick={handleVerify}
                                        disabled={!proofImage || isVerifying}
                                        className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                                    >
                                        {isVerifying ? (
                                            <><Loader2 className="animate-spin" /> {t.verifying}</>
                                        ) : (
                                            <><Upload size={18} /> {t.submit_proof}</>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                                        verificationResult.verified ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                        {verificationResult.verified ? <CheckCircle2 size={32} /> : <X size={32} />}
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {verificationResult.verified ? t.quest_verified : t.verification_failed}
                                    </h3>
                                    
                                    <p className="text-gray-600 mb-6 bg-gray-50 p-4 rounded-lg text-sm border">
                                        "{verificationResult.feedback}"
                                    </p>

                                    {verificationResult.verified ? (
                                        <div className="animate-bounce mb-4 text-orange-500 font-bold">
                                            +{activeQuest.points} Pts!
                                        </div>
                                    ) : null}

                                    <button 
                                        onClick={closeModal}
                                        className={`w-full py-3 rounded-xl font-bold transition-all ${
                                            verificationResult.verified 
                                            ? 'bg-green-600 text-white hover:bg-green-700' 
                                            : 'bg-gray-800 text-white hover:bg-gray-900'
                                        }`}
                                    >
                                        {verificationResult.verified ? t.awesome : t.try_again}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Quests;