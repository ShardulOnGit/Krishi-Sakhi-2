import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, ThumbsUp, Search, Plus, ArrowLeft, Send, Hash, Heart, ArrowRight, BookOpen, Globe, CheckCircle2, AlertCircle, Loader2, ExternalLink, Sparkles, X } from 'lucide-react';
import { ForumPost, Comment } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { searchFarmingQuery } from '../services/geminiService';

// Default mock data used only for initial load
const MOCK_POSTS: ForumPost[] = [
    {
        id: '1',
        author: 'Ramesh Patel',
        avatar: 'bg-orange-100 text-orange-600',
        title: 'Best organic fertilizer for Rice?',
        content: 'I have been using chemical fertilizers but want to switch to organic. What are the best options for Sona Masoori rice in black soil?',
        tags: ['Organic', 'Rice', 'Fertilizer'],
        replies: 2,
        likes: 45,
        timestamp: '2 hours ago',
        comments: [
            { id: 'c1', author: 'Suresh K', avatar: 'bg-blue-100 text-blue-600', text: 'Vermicompost works wonders! Try applying it twice.', timestamp: '1 hour ago', likes: 5, type: 'community' },
            { id: 'c2', author: 'Anita R', avatar: 'bg-green-100 text-green-600', text: 'Cow dung manure is also good if properly aged.', timestamp: '30 mins ago', likes: 2, type: 'community' }
        ]
    },
    {
        id: '2',
        author: 'Sita Devi',
        avatar: 'bg-pink-100 text-pink-600',
        title: 'Yellowing of Coconut leaves',
        content: 'My coconut trees are showing yellow leaves at the bottom. Is this magnesium deficiency? Please suggest remedies.',
        tags: ['Coconut', 'Disease', 'Help'],
        replies: 0,
        likes: 23,
        timestamp: '5 hours ago',
        comments: []
    },
    {
        id: '3',
        author: 'Abdullah K',
        avatar: 'bg-blue-100 text-blue-600',
        title: 'Govt Subsidy for Drip Irrigation',
        content: 'Does anyone know the current status of PMKSY subsidy for drip irrigation in Kerala? I applied 2 months ago.',
        tags: ['Subsidy', 'Irrigation', 'Government'],
        replies: 1,
        likes: 89,
        timestamp: '1 day ago',
        comments: [
             { id: 'c3', author: 'Admin', avatar: 'bg-purple-100 text-purple-600', text: 'Please check the status on the PMKSY portal. Approvals are delayed this month.', timestamp: '10 hours ago', likes: 12, type: 'verified' }
        ]
    }
];

const KNOWLEDGE_BASE_DATA = {
    en: [
        { id: 'kb1', question: 'How to control Stem Borer in Rice?', answer: 'Use biological controls like Trichogramma. If severe, apply Cartap Hydrochloride 4G.', tags: ['Rice', 'Pest'] },
        { id: 'kb2', question: 'Best time to plant Wheat?', answer: 'The ideal time for sowing wheat is from the first week of November to the end of November for best yield.', tags: ['Wheat', 'Planting'] },
        { id: 'kb3', question: 'Why is soil testing important?', answer: 'Soil testing determines nutrient levels and pH. It helps you apply the exact fertilizer needed, saving money and improving yield.', tags: ['Soil', 'General'] },
        { id: 'kb4', question: 'Subsidy for Solar Pump under PM-KUSUM?', answer: 'Under PM-KUSUM Component B, farmers can get up to 60% subsidy for standalone solar pumps.', tags: ['Subsidy', 'Solar'] },
        { id: 'kb5', question: 'How to clean drip irrigation laterals?', answer: 'Flush laterals every 15 days. Use acid treatment (HCL or Phosphoric acid) occasionally to remove salt deposits.', tags: ['Irrigation', 'Maintenance'] },
        { id: 'kb6', question: 'Treatment for Root Rot in Cotton?', answer: 'Seed treatment with Trichoderma viride @ 10g/kg seed. Avoid waterlogging in the field.', tags: ['Cotton', 'Disease'] },
        { id: 'kb7', question: 'Control for Early Blight in Tomato?', answer: 'Spray Mancozeb (2.5g/liter) or Chlorothalonil. Remove infected leaves immediately to stop spread.', tags: ['Tomato', 'Disease'] },
        { id: 'kb8', question: 'Organic pesticide for aphids?', answer: 'Neem oil spray (5ml/liter of water) is very effective against aphids and other sucking pests.', tags: ['Organic', 'Pest'] },
        { id: 'kb9', question: 'Balanced feed for high milk yield in cows?', answer: 'Provide a mix of green fodder (60%), dry fodder (40%), and concentrate feed mixed with mineral mixture.', tags: ['Dairy', 'Livestock'] },
        { id: 'kb10', question: 'How to claim crop insurance under PMFBY?', answer: 'Intimate the insurance company or bank within 72 hours of loss. Submit claim form with photos and land documents.', tags: ['Insurance', 'Finance'] }
    ],
    hi: [
        { id: 'kb1', question: 'धान में तना छेदक (Stem Borer) को कैसे नियंत्रित करें?', answer: 'ट्राइकोगामा (Trichogramma) जैसे जैविक नियंत्रण का प्रयोग करें। यदि प्रकोप अधिक हो, तो कार्टाप हाइड्रोक्लोराइड 4G का प्रयोग करें।', tags: ['Rice', 'Pest'] },
        { id: 'kb2', question: 'गेहूं बोने का सबसे अच्छा समय?', answer: 'गेहूं की बुवाई का आदर्श समय नवंबर के पहले सप्ताह से नवंबर के अंत तक है।', tags: ['Wheat', 'Planting'] },
        { id: 'kb3', question: 'मिट्टी परीक्षण क्यों महत्वपूर्ण है?', answer: 'मिट्टी परीक्षण से पोषक तत्वों और पीएच का पता चलता है। इससे सही खाद डालने में मदद मिलती है, जिससे पैसा बचता है और उपज बढ़ती है।', tags: ['Soil', 'General'] },
        { id: 'kb4', question: 'PM-KUSUM के तहत सोलर पंप पर सब्सिडी?', answer: 'PM-KUSUM घटक B के तहत, किसान स्टैंडअलोन सोलर पंपों के लिए 60% तक सब्सिडी प्राप्त कर सकते हैं।', tags: ['Subsidy', 'Solar'] },
        { id: 'kb5', question: 'ड्रिप सिंचाई लेटरल को कैसे साफ करें?', answer: 'हर 15 दिन में लेटरल को फ्लश करें। नमक के जमाव को हटाने के लिए कभी-कभी एसिड उपचार (HCL या फॉस्फोरिक एसिड) का उपयोग करें।', tags: ['Irrigation', 'Maintenance'] },
        { id: 'kb6', question: 'कपास में जड़ सड़न (Root Rot) का उपचार?', answer: '10 ग्राम/किलोग्राम बीज की दर से ट्राइकोडर्मा विरिडे से बीज उपचार करें। खेत में जलभराव से बचें।', tags: ['Cotton', 'Disease'] },
        { id: 'kb7', question: 'टमाटर में अगेती झुलसा (Early Blight) का नियंत्रण?', answer: 'मैंकोजेब (2.5 ग्राम/लीटर) या क्लोरोथालोनिल का छिड़काव करें। प्रसार को रोकने के लिए संक्रमित पत्तियों को तुरंत हटा दें।', tags: ['Tomato', 'Disease'] },
        { id: 'kb8', question: 'एफिड्स (माहू) के लिए जैविक कीटनाशक?', answer: 'एफिड्स और अन्य रस चूसने वाले कीटों के खिलाफ नीम के तेल का छिड़काव (5 मिली/लीटर पानी) बहुत प्रभावी है।', tags: ['Organic', 'Pest'] },
        { id: 'kb9', question: 'गायों में अधिक दूध उत्पादन के लिए संतुलित आहार?', answer: 'हरे चारे (60%), सूखे चारे (40%) और खनिज मिश्रण के साथ मिश्रित पशु आहार का मिश्रण प्रदान करें।', tags: ['Dairy', 'Livestock'] },
        { id: 'kb10', question: 'PMFBY के तहत फसल बीमा का दावा कैसे करें?', answer: 'नुकसान के 72 घंटों के भीतर बीमा कंपनी या बैंक को सूचित करें। फोटो और भूमि दस्तावेजों के साथ दावा प्रपत्र जमा करें।', tags: ['Insurance', 'Finance'] }
    ],
    mr: [
        { id: 'kb1', question: 'भातावरील खोडकिडा कसा नियंत्रित करावा?', answer: 'ट्रायकोग्रामा (Trichogramma) सारख्या जैविक नियंत्रणाचा वापर करा. प्रादुर्भाव जास्त असल्यास, कार्टाप हाइड्रोक्लोराइड 4G वापरा.', tags: ['Rice', 'Pest'] },
        { id: 'kb2', question: 'गहू पेरणीसाठी सर्वोत्तम वेळ कोणती?', answer: 'चांगल्या उत्पादनासाठी गहू पेरणीसाठी नोव्हेंबरचा पहिला आठवडा ते नोव्हेंबर अखेरपर्यंतची वेळ आदर्श आहे.', tags: ['Wheat', 'Planting'] },
        { id: 'kb3', question: 'माती परीक्षण का महत्त्वाचे आहे?', answer: 'माती परीक्षणामुळे जमिनीतील पोषक घटक आणि pH समजतात. यामुळे योग्य खत मात्रा देता येते, पैशाची बचत होते आणि उत्पादन वाढते.', tags: ['Soil', 'General'] },
        { id: 'kb4', question: 'PM-KUSUM अंतर्गत सौर पंपासाठी अनुदान?', answer: 'PM-KUSUM घटक B अंतर्गत, शेतकऱ्यांना स्वतंत्र सौर पंपांसाठी ६०% पर्यंत अनुदान मिळू शकते.', tags: ['Subsidy', 'Solar'] },
        { id: 'kb5', question: 'ठिबक सिंचन लेटरल कसे स्वच्छ करावे?', answer: 'दर १५ दिवसांनी लेटरल फ्लश करा. क्षारांचे साठे काढण्यासाठी अधूनमधून ॲसिड ट्रीटमेंट (HCL किंवा फॉस्फोरिक ॲसिड) वापरा.', tags: ['Irrigation', 'Maintenance'] },
        { id: 'kb6', question: 'कापसातील मूळ कुजणे (Root Rot) वर उपाय?', answer: '१० ग्रॅम/कि.ग्रा. बियाणे या प्रमाणात ट्रायकोडरमा विरिडे (Trichoderma viride) सह बीज प्रक्रिया करा. शेतात पाणी साचू देऊ नका.', tags: ['Cotton', 'Disease'] },
        { id: 'kb7', question: 'टोमॅटोवरील लवकर येणारा करपा (Early Blight) कसा रोखावा?', answer: 'मॅन्कोझेब (२.५ ग्रॅम/लिटर) किंवा क्लोरोथॅलोनिलची फवारणी करा. प्रसार रोखण्यासाठी बाधित पाने त्वरित काढून टाका.', tags: ['Tomato', 'Disease'] },
        { id: 'kb8', question: 'मावा (Aphids) साठी सेंद्रिय कीटकनाशक?', answer: 'मावा आणि इतर रस शोषणाऱ्या किडींच्या विरोधात कडुलिंबाच्या तेलाची फवारणी (५ मिली/लिटर पाणी) अत्यंत प्रभावी आहे.', tags: ['Organic', 'Pest'] },
        { id: 'kb9', question: 'गायीच्या जास्त दुधासाठी संतुलित आहार कोणता?', answer: 'हिरवा चारा (६०%), वाळलेला चारा (४०%) आणि खनिज मिश्रणासह पशुखाद्याचे मिश्रण द्या.', tags: ['Dairy', 'Livestock'] },
        { id: 'kb10', question: 'PMFBY अंतर्गत पीक विम्याचा दावा कसा करावा?', answer: 'नुकसानीच्या ७२ तासांच्या आत विमा कंपनी किंवा बँकेला कळवा. फोटो आणि जमिनीच्या कागदपत्रांसह दावा अर्ज सादर करा.', tags: ['Insurance', 'Finance'] }
    ]
};

const Community: React.FC = () => {
    const { t, language } = useLanguage();
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [view, setView] = useState<'feed' | 'thread'>('feed');
    const [activeTab, setActiveTab] = useState<'discussions' | 'knowledge'>('discussions');
    const [activePost, setActivePost] = useState<ForumPost | null>(null);
    const [search, setSearch] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Web Search State
    const [isSearchingWeb, setIsSearchingWeb] = useState(false);
    const [webAnswer, setWebAnswer] = useState<{text: string, sources: any[]} | null>(null);

    // Form States
    const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
    const [newComment, setNewComment] = useState('');

    // Load from LocalStorage
    useEffect(() => {
        const savedPosts = localStorage.getItem('krishi_forum_posts');
        if (savedPosts) {
            setPosts(JSON.parse(savedPosts));
        } else {
            setPosts(MOCK_POSTS);
            localStorage.setItem('krishi_forum_posts', JSON.stringify(MOCK_POSTS));
        }
    }, []);

    // Save to LocalStorage helper
    const savePosts = (updatedPosts: ForumPost[]) => {
        setPosts(updatedPosts);
        localStorage.setItem('krishi_forum_posts', JSON.stringify(updatedPosts));
    };

    const handleCreatePost = () => {
        if (!newPost.title || !newPost.content) return;

        const post: ForumPost = {
            id: Date.now().toString(),
            author: 'You', // In a real app, this comes from auth context
            avatar: 'bg-green-100 text-green-600',
            title: newPost.title,
            content: newPost.content,
            tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
            replies: 0,
            likes: 0,
            timestamp: 'Just now',
            comments: []
        };

        savePosts([post, ...posts]);
        setNewPost({ title: '', content: '', tags: '' });
        setShowCreateModal(false);
    };

    const handleLikePost = (e: React.MouseEvent, postId: string) => {
        e.stopPropagation();
        const updatedPosts = posts.map(p => {
            if (p.id === postId) {
                return { ...p, likes: p.likes + 1 };
            }
            return p;
        });
        savePosts(updatedPosts);
        
        // Also update active post if open
        if (activePost && activePost.id === postId) {
             setActivePost(prev => prev ? ({ ...prev, likes: prev.likes + 1 }) : null);
        }
    };

    const handleAddComment = () => {
        if (!newComment.trim() || !activePost) return;

        const comment: Comment = {
            id: Date.now().toString(),
            author: 'You',
            avatar: 'bg-green-100 text-green-600',
            text: newComment,
            timestamp: 'Just now',
            likes: 0,
            type: 'community'
        };

        const updatedPosts = posts.map(p => {
            if (p.id === activePost.id) {
                return { 
                    ...p, 
                    comments: [...p.comments, comment],
                    replies: p.replies + 1
                };
            }
            return p;
        });

        savePosts(updatedPosts);
        setActivePost(updatedPosts.find(p => p.id === activePost.id) || null);
        setNewComment('');
    };

    const handleWebSearch = async () => {
        if (!activePost) return;
        setIsSearchingWeb(true);
        const result = await searchFarmingQuery(activePost.title + " " + activePost.content, language);
        setWebAnswer(result);
        setIsSearchingWeb(false);
    };

    const openThread = (post: ForumPost) => {
        setActivePost(post);
        setView('thread');
        setWebAnswer(null); // Reset web answer when opening new thread
        window.scrollTo(0, 0);
    };

    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(search.toLowerCase()) || 
        post.content.toLowerCase().includes(search.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );

    // Dynamic Knowledge Base based on Language
    const currentKB = KNOWLEDGE_BASE_DATA[language as keyof typeof KNOWLEDGE_BASE_DATA] || KNOWLEDGE_BASE_DATA['en'];

    const filteredKB = currentKB.filter(kb => 
        kb.question.toLowerCase().includes(search.toLowerCase()) || 
        kb.answer.toLowerCase().includes(search.toLowerCase()) ||
        kb.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );

    // --- RENDER HELPERS ---

    const renderHeader = () => (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="text-purple-600" /> {t.community_title}
                </h1>
                <p className="text-gray-500 mt-1">{t.community_subtitle}</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder={t.search_discussions} 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-full bg-white focus:ring-2 focus:ring-purple-500 outline-none shadow-sm text-gray-900"
                    />
                </div>
                {activeTab === 'discussions' && (
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-full font-medium hover:bg-purple-700 flex items-center gap-2 whitespace-nowrap shadow-md transition-all"
                    >
                        <Plus size={18} /> {t.new_post}
                    </button>
                )}
            </div>
        </div>
    );

    const renderTabs = () => (
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-full md:w-fit">
            <button 
                onClick={() => setActiveTab('discussions')}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'discussions' 
                    ? 'bg-white text-purple-700 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                {t.discussions}
            </button>
            <button 
                onClick={() => setActiveTab('knowledge')}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'knowledge' 
                    ? 'bg-white text-green-700 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                {t.knowledge_base}
            </button>
        </div>
    );

    const renderKnowledgeBase = () => (
        <div className="animate-fade-in space-y-4">
             <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-3 mb-6">
                <BookOpen className="text-green-600 shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-green-800">{t.knowledge_base}</h3>
                    <p className="text-sm text-green-700">{t.kb_subtitle}</p>
                </div>
             </div>

             {filteredKB.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Search size={48} className="mx-auto mb-4 text-gray-300" />
                    {t.no_kb_results}
                </div>
             ) : (
                filteredKB.map(kb => (
                    <div key={kb.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-green-300 transition-colors">
                        <h3 className="font-bold text-gray-900 text-lg mb-2">{kb.question}</h3>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-3 relative">
                            <span className="absolute -top-2.5 left-4 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <CheckCircle2 size={10} /> {t.verified_answer}
                            </span>
                            <p className="text-gray-800">{kb.answer}</p>
                        </div>
                        <div className="flex gap-2">
                            {kb.tags.map(tag => (
                                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))
             )}
        </div>
    );

    const renderFeed = () => (
        <div className="animate-fade-in space-y-6">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                 <span className="text-sm font-bold text-gray-500 flex items-center gap-1 shrink-0"><Hash size={14} /> {t.trending_tags}:</span>
                 {['Rice', 'Organic', 'Subsidy', 'Pest', 'Weather'].map(tag => (
                     <button 
                        key={tag}
                        onClick={() => setSearch(tag)} 
                        className="bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors whitespace-nowrap"
                     >
                        #{tag}
                     </button>
                 ))}
            </div>

            <div className="space-y-4">
                {filteredPosts.map(post => (
                    <div 
                        key={post.id} 
                        onClick={() => openThread(post)}
                        className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${post.avatar}`}>
                                    {post.author[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition-colors">{post.title}</h3>
                                    <p className="text-xs text-gray-500">{t.posted_by} {post.author} • {post.timestamp}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {post.tags.map(tag => (
                                    <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4 line-clamp-2 leading-relaxed">{post.content}</p>
                        
                        <div className="flex items-center gap-6 text-gray-500 text-sm border-t pt-3 border-gray-50">
                            <button 
                                onClick={(e) => handleLikePost(e, post.id)}
                                className="flex items-center gap-2 hover:text-red-500 transition-colors"
                            >
                                <Heart size={18} className={post.likes > 0 ? "text-red-500" : ""} /> {post.likes} {t.likes}
                            </button>
                            <button className="flex items-center gap-2 hover:text-purple-600 transition-colors">
                                <MessageSquare size={18} /> {post.replies} {t.replies}
                            </button>
                            <span className="ml-auto text-purple-600 font-bold text-xs hover:underline flex items-center gap-1">
                                {t.view_discussion} <ArrowRight size={14} />
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderThread = () => {
        if (!activePost) return null;
        return (
            <div className="animate-fade-in max-w-4xl mx-auto">
                <button 
                    onClick={() => {
                        setView('feed');
                        setWebAnswer(null);
                    }} 
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors"
                >
                    <ArrowLeft size={20} /> {t.back_to_feed}
                </button>

                {/* Main Post */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl shadow-sm ${activePost.avatar}`}>
                            {activePost.author[0]}
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900 text-2xl">{activePost.title}</h1>
                            <div className="flex gap-2 text-sm text-gray-500 mt-1">
                                <span>{activePost.author}</span>
                                <span>•</span>
                                <span>{activePost.timestamp}</span>
                            </div>
                        </div>
                    </div>

                    <div className="prose max-w-none text-gray-800 mb-6 leading-relaxed">
                        {activePost.content}
                    </div>

                    <div className="flex gap-2 mb-6">
                        {activePost.tags.map(tag => (
                            <span key={tag} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium border border-purple-100">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center justify-between border-t pt-4">
                         <div className="flex gap-6 text-gray-600">
                            <button onClick={(e) => handleLikePost(e, activePost.id)} className="flex items-center gap-2 hover:text-red-500 transition-colors font-medium">
                                <Heart size={20} className={activePost.likes > 0 ? "fill-red-500 text-red-500" : ""} /> {activePost.likes} {t.likes}
                            </button>
                            <div className="flex items-center gap-2">
                                <MessageSquare size={20} /> {activePost.replies} {t.replies}
                            </div>
                         </div>

                         {!webAnswer && (
                             <button 
                                onClick={handleWebSearch}
                                disabled={isSearchingWeb}
                                className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-bold hover:bg-blue-100 transition-colors flex items-center gap-2"
                             >
                                 {isSearchingWeb ? <Loader2 className="animate-spin" size={16} /> : <Globe size={16} />}
                                 {isSearchingWeb ? t.searching_web : t.search_web}
                             </button>
                         )}
                    </div>
                </div>

                {/* Web Answer Section (Smart Feature) */}
                {webAnswer && (
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 mb-8 animate-fade-in relative">
                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg font-bold flex items-center gap-1">
                            <Globe size={12} /> {t.web_answer}
                        </div>
                        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                            <Sparkles size={18} className="text-blue-500" /> Web Summary
                        </h3>
                        <p className="text-blue-900 mb-4 leading-relaxed">{webAnswer.text}</p>
                        
                        {webAnswer.sources.length > 0 && (
                            <div className="mb-3">
                                <p className="text-xs font-bold text-blue-800 uppercase mb-2">Sources:</p>
                                <ul className="space-y-1">
                                    {webAnswer.sources.map((source, idx) => (
                                        <li key={idx}>
                                            <a href={source.uri} target="_blank" rel="noreferrer" className="text-xs text-blue-700 hover:underline flex items-center gap-1 truncate">
                                                <ExternalLink size={10} /> {source.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-[10px] text-blue-800 bg-blue-100/50 p-2 rounded">
                            <AlertCircle size={12} />
                            {t.web_disclaimer}
                        </div>
                    </div>
                )}

                {/* Comments Section */}
                <div className="space-y-6">
                    <h3 className="font-bold text-gray-900 text-lg">{t.replies} ({activePost.comments.length})</h3>
                    
                    {/* New Comment Input */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4">
                         <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold shrink-0">Y</div>
                         <div className="flex-1">
                             <textarea 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={t.write_comment}
                                className="w-full border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none p-2 min-h-[80px] text-sm resize-y text-gray-900"
                             />
                             <div className="flex justify-end mt-2">
                                 <button 
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim()}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                 >
                                     <Send size={16} /> {t.post_comment}
                                 </button>
                             </div>
                         </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                        {activePost.comments.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 italic bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                {t.no_comments}
                            </div>
                        ) : (
                            activePost.comments.map(comment => (
                                <div key={comment.id} className={`bg-white p-5 rounded-xl border shadow-sm flex gap-4 ${
                                    comment.type === 'verified' ? 'border-green-200 bg-green-50/30' : 'border-gray-100'
                                }`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${comment.avatar}`}>
                                        {comment.author[0]}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-gray-900">{comment.author}</h4>
                                                {comment.type === 'verified' && (
                                                    <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 border border-green-200">
                                                        <CheckCircle2 size={10} /> Verified
                                                    </span>
                                                )}
                                                {(!comment.type || comment.type === 'community') && (
                                                    <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-bold">
                                                        {t.community_answer}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500">{comment.timestamp}</span>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed">{comment.text}</p>
                                        <div className="mt-2 flex items-center gap-4">
                                            <button className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors">
                                                <Heart size={12} /> {comment.likes}
                                            </button>
                                            <button className="text-xs text-gray-500 hover:text-purple-600 font-medium">Reply</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-5xl mx-auto">
            {view === 'feed' && renderHeader()}
            
            {view === 'feed' && (
                <>
                    {renderTabs()}
                    {activeTab === 'discussions' ? renderFeed() : renderKnowledgeBase()}
                </>
            )}

            {view === 'thread' && renderThread()}

            {/* Create Post Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-fade-in-up">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h3 className="font-bold text-gray-900">{t.create_post_title}</h3>
                            <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-200 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <input 
                                    type="text" 
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                                    placeholder={t.post_title_placeholder}
                                    className="w-full text-lg font-bold border-b border-gray-200 py-2 outline-none focus:border-purple-500 text-gray-900 placeholder-gray-400"
                                />
                            </div>
                            <div>
                                <textarea 
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                                    placeholder={t.post_content_placeholder}
                                    className="w-full border border-gray-200 rounded-lg p-3 h-32 outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 resize-none"
                                />
                            </div>
                            <div>
                                <input 
                                    type="text" 
                                    value={newPost.tags}
                                    onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                                    placeholder={t.post_tags_placeholder}
                                    className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-900"
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button 
                                    onClick={handleCreatePost}
                                    disabled={!newPost.title || !newPost.content}
                                    className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {t.new_post}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Community;