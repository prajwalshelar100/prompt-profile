import { create } from 'zustand';
import { AppState, Profile, Project, Product, Note, Prompt, ProductExperience, Routine, HealthRecord } from '../types';
import * as dbService from '../database/dbService';
import * as Crypto from 'expo-crypto';

export const useStore = create<AppState>((set, get) => ({
  isLoading: false,
  profiles: [],
  projects: {},
  products: {}, // projectId -> Product[]
  allProducts: {}, // profileId -> Product[]
  notes: {},
  prompts: {},
  experiences: {}, // productId -> ProductExperience[]
  routines: {}, // projectId -> Routine[]
  health_records: {}, // projectId -> HealthRecord[]
  aiEnabled: true,
  includeHistory: true,
  userName: null,

  recentOnly: false,
  smartFiltering: true,
  recentPrompts: [],

  loadState: async () => {
    set({ isLoading: true });
    try {
      const [profiles, userName, recentPrompts] = await Promise.all([
        dbService.getProfiles(),
        dbService.getGlobalSetting('user_name'),
        dbService.getRecentPrompts(5)
      ]);
      set({ profiles, userName, recentPrompts });
    } catch (e) {
      console.error('Failed to load state', e);
    } finally {
      set({ isLoading: false });
    }
  },

  loadProfileProjects: async (profileId: string) => {
    try {
      const projects = await dbService.getProjectsByProfile(profileId);
      set((state) => ({
        projects: { ...state.projects, [profileId]: projects },
      }));
    } catch (e) {
      console.error('Failed to load profile projects', e);
    }
  },

  loadProjectData: async (projectId: string) => {
    try {
      const [products, notes, prompts, routines, healthRecords] = await Promise.all([
        dbService.getProductsByProject(projectId),
        dbService.getNotesByProject(projectId),
        dbService.getPromptsByProject(projectId),
        dbService.getRoutinesByProject(projectId),
        dbService.getHealthRecordsByProject(projectId),
      ]);
      set((state) => ({
        products: { ...state.products, [projectId]: products },
        notes: { ...state.notes, [projectId]: notes },
        prompts: { ...state.prompts, [projectId]: prompts },
        routines: { ...state.routines, [projectId]: routines },
        health_records: { ...state.health_records, [projectId]: healthRecords },
      }));
    } catch (e) {
      console.error('Failed to load project data', e);
    }
  },
  
  loadAllProducts: async (profileId: string) => {
    try {
      const products = await dbService.getProductsByProfile(profileId);
      set((state) => ({
        allProducts: { ...state.allProducts, [profileId]: products },
      }));
    } catch (e) {
      console.error('Failed to load all products', e);
    }
  },

  addProfile: async (name: string, description?: string) => {
    const id = Crypto.randomUUID();
    await dbService.createProfile({ id, name, description, created_at: Date.now() });
    await get().loadState();
    return id;
  },

  updateProfile: async (id: string, updates: Partial<Profile>) => {
    const profiles = get().profiles;
    const profile = profiles.find(p => p.id === id);
    if (profile) {
      const updatedProfile = { ...profile, ...updates };
      await dbService.updateProfileDB(updatedProfile);
      await get().loadState();
    }
  },

  deleteProfile: async (profileId: string) => {
    await dbService.deleteProfileDB(profileId);
    await get().loadState();
  },

  addProject: async (projectData: Omit<Project, 'id'>) => {
    const id = Crypto.randomUUID();
    await dbService.createProject({ ...projectData, id });
    await get().loadProfileProjects(projectData.profile_id);
    return id;
  },

  addProduct: async (productData: Omit<Product, 'id'>) => {
    const id = Crypto.randomUUID();
    const product = { ...productData, id, created_at: productData.created_at || Date.now() };
    await dbService.createProduct(product);
    if (product.project_id) {
      await get().loadProjectData(product.project_id);
    }
    return id;
  },

  updateProduct: async (product: Product) => {
    await dbService.updateProductDB(product);
    if (product.project_id) {
      await get().loadProjectData(product.project_id);
    }
    await get().loadAllProducts(product.profile_id);
  },

  deleteProduct: async (productId: string, profileId: string, projectId?: string) => {
    await dbService.deleteProductDB(productId);
    if (projectId) {
      await get().loadProjectData(projectId);
    }
    await get().loadAllProducts(profileId);
  },

  addNote: async (noteData: Omit<Note, 'id'>) => {
    const id = Crypto.randomUUID();
    const note = { ...noteData, id, created_at: Date.now() };
    await dbService.createNote(note);
    if (note.project_id) {
      await get().loadProjectData(note.project_id);
    }
    return id;
  },

  savePrompt: async (profileId: string, projectId: string, content: string, source: 'offline' | 'hybrid' | 'ai-only' = 'offline') => {
    const id = Crypto.randomUUID();
    await dbService.createPrompt({
      id,
      profile_id: profileId,
      project_id: projectId,
      content,
      source,
      created_at: Date.now(),
      is_favorite: false,
    });
    await get().loadProjectData(projectId);
    const recent = await dbService.getRecentPrompts(5);
    set({ recentPrompts: recent });
    return id;
  },

  toggleFavoritePrompt: async (promptId: string, projectId: string) => {
    await dbService.toggleFavoritePromptDB(promptId);
    await get().loadProjectData(projectId);
  },

  addExperience: async (experienceData: Omit<ProductExperience, 'id'>) => {
    const id = Crypto.randomUUID();
    const experience = { ...experienceData, id, created_at: Date.now() };
    await dbService.createExperience(experience);
    await get().loadProductExperiences(experience.product_id);
    return id;
  },

  loadProductExperiences: async (productId: string) => {
    try {
      const experiences = await dbService.getExperiencesByProduct(productId);
      set((state) => ({
        experiences: { ...state.experiences, [productId]: experiences },
      }));
    } catch (e) {
      console.error('Failed to load product experiences', e);
    }
  },

  addRoutine: async (routineData: Omit<Routine, 'id'>) => {
    const id = Crypto.randomUUID();
    const routine = { ...routineData, id, created_at: Date.now() };
    await dbService.createRoutine(routine);
    await get().loadProjectRoutines(routine.project_id);
    return id;
  },

  loadProjectRoutines: async (projectId: string) => {
    try {
      const routines = await dbService.getRoutinesByProject(projectId);
      set((state) => ({
        routines: { ...state.routines, [projectId]: routines },
      }));
    } catch (e) {
      console.error('Failed to load project routines', e);
    }
  },

  deleteRoutine: async (id: string) => {
    try {
      const routinesMap = get().routines;
      let projectId = '';
      for (const pid in routinesMap) {
        if (routinesMap[pid].some(r => r.id === id)) {
           projectId = pid;
           break;
        }
      }
      await dbService.deleteRoutineDB(id);
      if (projectId) await get().loadProjectData(projectId);
    } catch (e) {
      console.error('Failed to delete routine', e);
    }
  },

  updateRoutine: async (routine: Routine) => {
    try {
      await dbService.updateRoutineDB(routine);
      await get().loadProjectData(routine.project_id);
    } catch (e) {
      console.error('Failed to update routine', e);
    }
  },

  addProductsToProject: async (projectId: string, productIds: string[]) => {
    try {
      const profileId = get().profiles[0]?.id;
      if (!profileId) return;
      const allProds = await dbService.getProductsByProfile(profileId);
      const productsToLink = allProds.filter(p => productIds.includes(p.id));
      
      for (const product of productsToLink) {
        await dbService.updateProductDB({ ...product, project_id: projectId });
      }
      await get().loadProjectData(projectId);
      await get().loadAllProducts(profileId);
    } catch (e) {
      console.error('Failed to add products to project', e);
    }
  },

  addHealthRecord: async (recordData: Omit<HealthRecord, 'id'>) => {
    const id = Crypto.randomUUID();
    const record: HealthRecord = { 
      id, 
      profile_id: recordData.profile_id,
      project_id: recordData.project_id,
      title: recordData.title,
      type: recordData.type,
      file_uri: recordData.file_uri,
      extracted_text: recordData.extracted_text,
      created_at: Date.now() 
    };
    await dbService.createHealthRecord(record);
    if (record.project_id) {
      await get().loadProjectData(record.project_id);
    }
    return id;
  },

  deleteHealthRecord: async (id: string, projectId?: string) => {
    await dbService.deleteHealthRecordDB(id);
    if (projectId) {
      await get().loadProjectData(projectId);
    }
  },

  setAiEnabled: (enabled: boolean) => set({ aiEnabled: enabled }),
  setUserName: async (name: string) => {
    await dbService.setGlobalSetting('user_name', name);
    set({ userName: name });
  },
  setSetting: async (key: string, value: any) => {
    await dbService.setGlobalSetting(key, value);
    set((state) => ({ ...state, [key]: value }));
  },
}));
