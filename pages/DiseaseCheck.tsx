import React, { useState, useEffect } from 'react';
import { Upload, ScanLine, AlertTriangle, CheckCircle, Loader2, Camera, ChevronRight, Activity, Shield, Sprout, Image as ImageIcon } from 'lucide-react';
import { analyzePlantDisease, generateReferenceImage } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { DiseaseAnalysis } from '../types';

interface StepCardProps {
    step: {
        title: string;
        description: string;
        imagePrompt: string;
    };
    index: number;
}

const StepCard: React.FC<StepCardProps> = ({ step, index }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loadingImage, setLoadingImage] = useState(true);

    useEffect(() => {
        const fetchImage = async () => {
            const url = await generateReferenceImage(step.imagePrompt);
            setImageUrl(url);
            setLoadingImage(false);
        };
        fetchImage();
    }, [step.imagePrompt]);

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="h-40 bg-gray-100 relative flex items-center justify-center">
                {loadingImage ? (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-xs font-medium">Generating Visual...</span>
                    </div>
                ) : imageUrl ? (
                    <img src={imageUrl} alt={step.title} className="w-full h-full object-cover" />
                ) : (
                    <ImageIcon className="text-gray-300" size={32} />
                )}
                <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-bold shadow-sm">
                    Step {index + 1}
                </div>
            </div>
            <div className="p-4">
                <h4 className="font-bold text-gray-900 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
            </div>
        </div>
    );
};

const DiseaseCheck: React.FC = () => {
  const { t, language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<DiseaseAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
        setAnalysis(null); // Reset previous analysis
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    const result = await analyzePlantDisease(selectedImage, language);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-5xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4">
            <ScanLine size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{t.disease_title}</h1>
        <p className="text-gray-500 mt-2">{t.disease_subtitle}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Camera size={20} />
            {t.upload_plant_image}
        </h2>

        {/* Name Input */}
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.crop_name} *</label>
            <input 
                type="text" 
                placeholder="e.g., Rice, Coconut, Pepper, Cardamom..." 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            />
        </div>

        {/* Image Upload Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors relative h-64">
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {selectedImage ? (
                    <img src={selectedImage} alt="Uploaded plant" className="max-h-full rounded-lg object-contain" />
                ) : (
                    <>
                        <Upload size={40} className="text-gray-400 mb-4" />
                        <p className="font-medium text-gray-700">{t.click_to_upload}</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </>
                )}
            </div>

            {/* Action Area */}
            <div className="flex flex-col justify-center items-start space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 w-full">
                    <h3 className="font-bold text-blue-900 text-sm mb-2">{t.tips_results}:</h3>
                    <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                        <li>Take clear, well-lit photos of affected plant parts</li>
                        <li>Include both affected and healthy areas for comparison</li>
                        <li>Capture symptoms from different angles if possible</li>
                    </ul>
                </div>

                <button 
                    onClick={handleAnalyze}
                    disabled={!selectedImage || isAnalyzing}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-bold shadow-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                    {isAnalyzing ? (
                        <>
                           <Loader2 className="animate-spin" size={20} /> {t.analyzing}
                        </>
                    ) : (
                        <>
                           <ScanLine size={20} /> {t.detect_disease}
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>

      {/* Results Section */}
      {analysis && (
          <div className="animate-fade-in-up space-y-6">
              
              {/* Diagnosis Header */}
              <div className={`p-6 rounded-2xl border-l-8 shadow-sm bg-white ${
                  analysis.diagnosis.toLowerCase().includes('healthy') ? 'border-green-500' : 'border-red-500'
              }`}>
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Diagnosis Result</p>
                          <h2 className={`text-2xl font-bold ${
                              analysis.diagnosis.toLowerCase().includes('healthy') ? 'text-green-700' : 'text-red-700'
                          }`}>
                              {analysis.diagnosis}
                          </h2>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          analysis.confidence === 'High' ? 'bg-green-100 text-green-800' : 
                          analysis.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                          {analysis.confidence} Confidence
                      </div>
                  </div>
              </div>

              {/* Symptoms & Treatment Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Symptoms */}
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Activity className="text-orange-500" size={20} /> Symptoms Detected
                      </h3>
                      <ul className="space-y-2">
                          {analysis.symptoms.map((symptom, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <ChevronRight size={16} className="text-orange-300 shrink-0 mt-0.5" />
                                  {symptom}
                              </li>
                          ))}
                      </ul>
                  </div>

                  {/* Immediate Actions */}
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Shield className="text-blue-500" size={20} /> Preventive Measures
                      </h3>
                      <ul className="space-y-2">
                          {analysis.prevention.map((tip, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                                  {tip}
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>

              {/* Step-by-Step Cure */}
              {analysis.cureSteps && analysis.cureSteps.length > 0 && (
                  <div className="mt-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                          <Sprout className="text-green-600" /> Step-by-Step Cure Procedure
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {analysis.cureSteps.map((step, idx) => (
                              <StepCard key={idx} step={step} index={idx} />
                          ))}
                      </div>
                  </div>
              )}

              {/* Treatments List */}
              <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                  <h3 className="font-bold text-green-900 mb-4 text-lg">Recommended Treatments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                          <h4 className="font-bold text-green-800 mb-2 text-sm uppercase">Organic / Natural</h4>
                          <ul className="space-y-2">
                              {analysis.treatment.organic.map((t, i) => (
                                  <li key={i} className="flex gap-2 text-sm text-green-700">
                                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0"></div>
                                      {t}
                                  </li>
                              ))}
                          </ul>
                      </div>
                      <div>
                          <h4 className="font-bold text-green-800 mb-2 text-sm uppercase">Chemical / Pesticides</h4>
                          <ul className="space-y-2">
                              {analysis.treatment.chemical.map((t, i) => (
                                  <li key={i} className="flex gap-2 text-sm text-green-700">
                                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></div>
                                      {t}
                                  </li>
                              ))}
                          </ul>
                      </div>
                  </div>
              </div>

              {/* Disclaimer */}
              <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-100 flex gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <p>{t.ai_disclaimer}</p>
              </div>
          </div>
      )}
    </div>
  );
};

export default DiseaseCheck;
