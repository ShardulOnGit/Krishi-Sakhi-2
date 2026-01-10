// This utility processes farmer data to create WhatsApp-style communities.

export interface Farmer {
  farmer_id: string;
  name: string;
  district: string;
  state: string;
  crop: string;
  soil: string;
  irrigation: string;
  land: string;
  season: string;
}

export interface FarmerGroup {
  group_id: string;
  group_name: string;
  crop: string;
  soil: string;
  season: string;
  district: string;
  members: { farmer_id: string; name: string }[];
}

// Data pools based on the uploaded PDF content
const DISTRICTS = ['Nashik', 'Akola', 'Sangli', 'Yavatmal', 'Kolhapur', 'Wardha', 'Pune', 'Satara', 'Amravati', 'Nagpur'];
const CROPS = ['tomato', 'grapes', 'sugarcane', 'rice', 'maize', 'cotton', 'wheat', 'soybean'];
const SOILS = ['black', 'red', 'sandy', 'loamy'];
const IRRIGATIONS = ['canal', 'drip', 'sprinkler', 'rainfed'];
const SEASONS = ['rabi', 'annual', 'kharif'];
const STATES = ['MH']; // Mostly Maharashtra based on PDF

// Deterministic random generator for consistent data
const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

export const generateLargeFarmerDataset = (count: number = 1000): Farmer[] => {
    const farmers: Farmer[] = [];
    
    for (let i = 1; i <= count; i++) {
        const seed = i;
        const district = DISTRICTS[Math.floor(pseudoRandom(seed * 1) * DISTRICTS.length)];
        const crop = CROPS[Math.floor(pseudoRandom(seed * 2) * CROPS.length)];
        const soil = SOILS[Math.floor(pseudoRandom(seed * 3) * SOILS.length)];
        const irrigation = IRRIGATIONS[Math.floor(pseudoRandom(seed * 4) * IRRIGATIONS.length)];
        const season = SEASONS[Math.floor(pseudoRandom(seed * 5) * SEASONS.length)];
        const land = Math.floor(pseudoRandom(seed * 6) * 15 + 1).toString(); // 1 to 15 acres

        farmers.push({
            farmer_id: `F${i}`,
            name: `Farmer${i}`,
            district: district,
            state: 'MH',
            crop: crop,
            soil: soil,
            irrigation: irrigation,
            land: land,
            season: season
        });
    }
    return farmers;
};

export const parseFarmerData = (): Farmer[] => {
    // Return the generated 1000 dataset
    return generateLargeFarmerDataset(1000);
};

export const generateFarmerGroups = (): FarmerGroup[] => {
  const farmers = parseFarmerData();
  const groups: FarmerGroup[] = [];
  
  // Group key: crop-soil-season-district
  const groupedMap = new Map<string, Farmer[]>();

  farmers.forEach(farmer => {
    // Basic grouping criteria
    const key = `${farmer.crop}-${farmer.soil}-${farmer.season}-${farmer.district}`;
    if (!groupedMap.has(key)) {
      groupedMap.set(key, []);
    }
    groupedMap.get(key)?.push(farmer);
  });

  let groupIdCounter = 1;

  groupedMap.forEach((members, key) => {
    const [crop, soil, season, district] = key.split('-');
    
    // Split into chunks if > 20 members (Rule 3)
    for (let i = 0; i < members.length; i += 20) {
      const chunk = members.slice(i, i + 20);
      
      // Ignore very small groups if needed, but let's keep all valid groups
      if (chunk.length < 3) continue; 

      // Formatting the Group Name (e.g., "Rice Farmers – Amravati (Kharif)")
      const capitalizedCrop = crop.charAt(0).toUpperCase() + crop.slice(1);
      const capitalizedSeason = season.charAt(0).toUpperCase() + season.slice(1);
      const groupName = `${capitalizedCrop} Farmers – ${district} (${capitalizedSeason}) ${i > 0 ? '#' + (i/20 + 1) : ''}`;

      groups.push({
        group_id: `G${groupIdCounter++}`,
        group_name: groupName,
        crop,
        soil,
        season,
        district,
        members: chunk.map(m => ({ farmer_id: m.farmer_id, name: m.name }))
      });
    }
  });

  // Sort groups by size (larger communities first)
  return groups.sort((a, b) => b.members.length - a.members.length);
};
