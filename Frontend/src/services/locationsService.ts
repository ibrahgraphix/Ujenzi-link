import apiClient from './apiClient';

const DEFAULT_REGIONS = [
  'Dar es Salaam',
  'Arusha',
  'Mwanza',
  'Dodoma',
  'Tanga',
  'Kilimanjaro',
  'Mbeya',
  'Morogoro',
  'Pwani',
  'Zanzibar',
];

const DEFAULT_DISTRICTS: Record<string, string[]> = {
  'Dar es Salaam': ['Kinondoni', 'Ilala', 'Temeke', 'Ubungo', 'Kigamboni'],
  Arusha: ['Arusha Urban', 'Arumeru', 'Karatu', 'Monduli', 'Ngorongoro'],
  Mwanza: ['Nyamagana', 'Ilemela', 'Sengerema', 'Ukerewe', 'Misungwi'],
  Dodoma: ['Dodoma Urban', 'Bahi', 'Chamwino', 'Kondoa', 'Kongwa'],
  Tanga: ['Tanga Urban', 'Muheza', 'Korogwe', 'Lushoto', 'Pangani'],
};

export async function getRegions(): Promise<string[]> {
  try {
    const res = await apiClient.get<{ regions: string[] }>('/api/search/locations/regions');
    if (res && Array.isArray(res.regions) && res.regions.length > 0) {
      return res.regions;
    }
  } catch (err) {
    console.warn('Failed to fetch regions from API, using default list:', err);
  }
  return DEFAULT_REGIONS;
}

export async function getDistrictsByRegion(region: string): Promise<string[]> {
  if (!region || region === 'all') return [];

  try {
    const res = await apiClient.get<{ districts: string[] }>(
      `/api/search/locations/regions/${encodeURIComponent(region)}/districts`
    );
    if (res && Array.isArray(res.districts) && res.districts.length > 0) {
      return res.districts;
    }
  } catch (err) {
    console.warn(`Failed to fetch districts for region ${region} from API:`, err);
  }

  return DEFAULT_DISTRICTS[region] || ['Central', 'North', 'South', 'East', 'West'];
}
