
export enum Category {
  TOPS = 'Tops',
  BOTTOMS = 'Bottoms',
  OUTERWEAR = 'Outerwear',
  DRESSES = 'Dresses',
  SHOES = 'Shoes',
  ACCESSORIES = 'Accessories',
  OTHER = 'Other'
}

export enum Season {
  SPRING = 'Spring',
  SUMMER = 'Summer',
  AUTUMN = 'Autumn',
  WINTER = 'Winter',
  ALL = 'All Seasons'
}

export interface Garment {
  id: string;
  name: string;
  category: Category;
  color: string;
  season: Season;
  imageUrl: string;
  notes?: string;
  addedAt: number;
}

export interface OutfitSuggestion {
  title: string;
  description: string;
  items: string[]; // IDs of items
  reasoning: string;
}

export type ViewState = 'dashboard' | 'wardrobe' | 'stylist' | 'analytics';
