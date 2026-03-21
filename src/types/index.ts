export type ThemeMode = 'light' | 'dark' | 'system';

export interface Profile {
  id: string;
  name: string;
  description?: string;
  created_at: number;
  // V12 Personalization
  age?: string;
  height?: string;
  weight?: string;
  experience?: string;
  occupation?: string;
  healthIssues?: string;
  medicines?: string;
  sportsInterest?: string;
  blood_group?: string;
  allergies?: string;
  icon?: string; // Preset icon name
}

export interface Project {
  id: string;
  profile_id: string;
  name: string;
  description?: string;
  created_at: number;
}

export interface Product {
  id: string;
  profile_id: string;
  project_id?: string;
  name: string;
  description?: string;
  ingredients?: string;
  category?: string;
  notes?: string;
  image_uri?: string;
  raw_text?: string;
  parsed_data?: string;
  source_type?: 'link' | 'image' | 'manual' | 'pdf';
  source_url?: string;
  // Medical/Health extensions
  dosage?: string;
  frequency?: string;
  duration?: string; // Time used
  is_medicine?: boolean;
  created_at?: number;
}

export interface HealthRecord {
  id: string;
  profile_id: string;
  project_id?: string;
  title: string;
  type: 'prescription' | 'lab_report' | 'imaging' | 'other';
  file_uri: string;
  extracted_text?: string;
  created_at: number;
}

export interface Note {
  id: string;
  profile_id: string;
  project_id?: string;
  title?: string;
  content: string;
  created_at: number;
}

export interface Prompt {
  id: string;
  profile_id: string;
  project_id?: string;
  content: string;
  source: 'offline' | 'hybrid' | 'ai-only';
  created_at: number;
  is_favorite: boolean;
}

export interface ProductExperience {
  id: string;
  product_id: string;
  experience_text: string;
  result_type: 'worked' | 'not_worked' | 'neutral';
  side_effects?: string;
  rating: number; // 1-5
  reuse_decision: 'yes' | 'no';
  created_at: number;
}

export interface Routine {
  id: string;
  project_id: string;
  name: string; // e.g. "Morning", "Night"
  products: string[]; // List of product IDs in order
  startTime?: string; // e.g. "08:00 AM"
  daysOfWeek?: string[]; // e.g. ["Mon", "Wed"]
  created_at: number;
}

export interface ExtractedProductData {
  product_name: string;
  ingredients: string | string[];
  category: string;
  notes: string;
  raw_text?: string;
}

export interface AppState {
  isLoading: boolean;
  profiles: Profile[];
  projects: Record<string, Project[]>; // profileId -> Project[]
  products: Record<string, Product[]>; // projectId -> Product[]
  allProducts: Record<string, Product[]>; // profileId -> Product[]
  notes: Record<string, Note[]>; // projectId -> Note[]
  prompts: Record<string, Prompt[]>; // projectId -> Prompt[]
  experiences: Record<string, ProductExperience[]>; // productId -> ProductExperience[]
  routines: Record<string, Routine[]>; // projectId -> Routine[]
  aiEnabled: boolean;
  userName: string | null;
  health_records: Record<string, HealthRecord[]>; // projectId -> HealthRecord[]
  recentPrompts: Prompt[];
  
  // New V7 Settings
  includeHistory: boolean;
  recentOnly: boolean;
  smartFiltering: boolean;
  
  loadState: () => Promise<void>;
  loadProfileProjects: (profileId: string) => Promise<void>;
  loadProjectData: (projectId: string) => Promise<void>;
  
  addProfile: (name: string, description?: string) => Promise<string>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  addProject: (projectData: Omit<Project, 'id'>) => Promise<string>;
  addProduct: (productData: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string, profileId: string, projectId?: string) => Promise<void>;
  loadAllProducts: (profileId: string) => Promise<void>;
  addNote: (noteData: Omit<Note, 'id'>) => Promise<string>;
  savePrompt: (profileId: string, projectId: string, content: string, source?: 'offline' | 'hybrid' | 'ai-only') => Promise<string>;
  toggleFavoritePrompt: (promptId: string, projectId: string) => Promise<void>;
  
  addExperience: (experienceData: Omit<ProductExperience, 'id'>) => Promise<string>;
  loadProductExperiences: (productId: string) => Promise<void>;
  
  addRoutine: (routineData: Omit<Routine, 'id'>) => Promise<string>;
  updateRoutine: (routine: Routine) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  loadProjectRoutines: (projectId: string) => Promise<void>;
  addProductsToProject: (projectId: string, productIds: string[]) => Promise<void>;
  
  // Health Record Actions
  addHealthRecord: (record: Omit<HealthRecord, 'id'>) => Promise<string>;
  deleteHealthRecord: (id: string, projectId?: string) => Promise<void>;
  
  setAiEnabled: (enabled: boolean) => void;
  setUserName: (name: string) => Promise<void>;
  setSetting: (key: 'includeHistory' | 'recentOnly' | 'smartFiltering', value: boolean) => void;
}
