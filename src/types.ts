export interface Region {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface SubRegion {
  id: string;
  name: string;
  region_id: string;
  description: string | null;
  created_at: string;
}

export interface Distillery {
  id: string;
  name: string;
  region_id: string | null;
  sub_region_id: string | null;
  latitude: number;
  longitude: number;
  description: string | null;
  tours_available: boolean;
  tour_info: string | null;
  created_at: string;
}

export interface Bottle {
  id: string;
  name: string;
  age_statement: string | null;
  distillery_id: string;
  status: 'not_tasted' | 'tasted' | 'owned' | 'owned_and_tasted';
  tasting_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserNote {
  id: string;
  content: string;
  distillery_id: string | null;
  bottle_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserVisit {
  id: string;
  user_id: string;
  distillery_id: string;
  visit_date: string;
  notes: string | null;
  created_at: string;
}