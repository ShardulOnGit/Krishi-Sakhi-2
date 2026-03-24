
export interface Crop {
  id: string;
  name: string;
  variety?: string;
  area: string;
  sowingDate: string;
  harvestDate?: string;
  stage: string; // e.g., Germination, Vegetative, Flowering
  image: string;
  health: 'Good' | 'Needs Attention' | 'Critical';
  nextAction?: string;
  expectedYield?: string;
  seedSource?: string;
  irrigationMethod?: string;
  notes?: string;
}

export interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
    conditionCode: number;
    isDay: boolean;
  };
  daily: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    conditionCode: number;
    rainProb: number;
    sunrise: string;
    sunset: string;
  }>;
  hourly: Array<{
    time: string;
    temp: number;
    conditionCode: number;
    rainProb: number;
  }>;
  location: string;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
  type?: 'community' | 'verified' | 'web'; // Added for Smart Community
  sources?: { title: string; uri: string }[]; // Added for Web Answers
}

export interface ForumPost {
  id: string;
  author: string;
  avatar: string; // color or initial
  title: string;
  content: string;
  tags: string[];
  replies: number;
  likes: number;
  timestamp: string;
  comments: Comment[];
}

export interface Scheme {
  id: string;
  name: string;
  provider: string; // Central or State
  category: string;
  description: string;
  benefits: string;
  eligibility: string;
  deadline?: string;
  link?: string; // Official website link
}

export interface ApplicationGuide {
  steps: string[];
  documents: string[];
  tips: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  points: number;
  progress: number; // 0 to 100
  total: number;
  current: number;
  unit: string;
  icon: string;
}

export interface QuestVerificationResult {
  verified: boolean;
  confidence: number;
  feedback: string;
}

export interface ActivityLog {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'fertilizer' | 'water' | 'harvest' | 'planting' | 'other';
  status: 'completed' | 'pending';
}

export enum Page {
  DASHBOARD = 'dashboard',
  ADVISORY = 'advisory',
  QUESTS = 'quests',
  LEADERBOARD = 'leaderboard',
  PROFILE = 'profile',
  CROPS = 'crops',
  ACTIVITIES = 'activities',
  WEATHER = 'weather',
  COMMUNITY = 'community',
  DISEASE_CHECK = 'disease_check',
  SCHEMES = 'schemes',
  CONNECT = 'connect',
  ANIMAL_MART = 'animal_mart',
  MACHINERY = 'machinery'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface UserProfile {
  // Personal
  name: string;
  phone: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  age: string;
  preferredLanguage: string;
  experienceYears: string;
  farmerCategory: 'Small' | 'Marginal' | 'Medium' | 'Large';
  
  // Location
  state: string;
  district: string;
  taluka: string;
  village: string;
  pinCode: string;
  location: string; // Legacy/Display field (e.g. Village, District)
  
  // Land & Soil
  totalLandArea: string;
  landUnit: 'Acres' | 'Hectares';
  numberOfPlots: string;
  soilType: string;
  soilFertility: 'Low' | 'Medium' | 'High';
  soilTestingDone: 'Yes' | 'No';
  lastSoilTestYear: string;
  
  // Water
  irrigationMethods: string[];
  waterAvailability: 'Low' | 'Medium' | 'High';
  
  // Crops
  mainCrop: string;
  secondaryCrop: string;
  cropsHistory: string[];
  
  // Resources & Practices
  machinery: string[];
  laborAvailability: 'Low' | 'Medium' | 'High';
  modernTechniquesUsed: 'Yes' | 'No';
  organicCertified: boolean;
  kccCardHolder: boolean;
  
  // Other
  livestock: string[];
}

export interface PeerFarmer {
  id: string;
  name: string;
  location: string;
  country: string;
  crops: string[];
  similarity: number;
  reason: string;
}

export interface AnimalListing {
  id: string;
  type: 'Cow' | 'Buffalo' | 'Goat' | 'Sheep' | 'Chicken' | 'Other';
  breed: string;
  age: string;
  gender: 'Male' | 'Female';
  purpose: 'Milk' | 'Breeding' | 'Farming' | 'Meat' | 'Other';
  healthStatus: string;
  vaccinated: boolean;
  state: string;
  district: string;
  price: number;
  sellerName: string;
  contactNumber: string;
  image?: string;
  datePosted: string;
}

export interface MachineListing {
  id: string;
  machineType: 'Tractor' | 'Harvester' | 'Rotavator' | 'Sprayer' | 'Pump' | 'Tiller' | 'Other';
  listingType: 'Rent' | 'Sell';
  brandModel: string;
  condition: 'Good' | 'Average' | 'Old';
  year: string;
  price: number;
  priceUnit?: 'hour' | 'day' | 'flat'; // flat for selling, hour/day for renting
  available: boolean;
  state: string;
  district: string;
  ownerName: string;
  contactNumber: string;
  verifiedOwner: boolean;
  verifiedLocation: boolean;
  image: string;
  datePosted: string;
}

export interface DiseaseAnalysis {
  diagnosis: string;
  confidence: string;
  symptoms: string[];
  treatment: {
    organic: string[];
    chemical: string[];
  };
  prevention: string[];
  cureSteps: Array<{
    title: string;
    description: string;
    imagePrompt: string; // Used to generate the AI image
  }>;
}