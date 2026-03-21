import * as SQLite from 'expo-sqlite';
import { Profile, Project, Product, Note, Prompt, ProductExperience, Routine, HealthRecord } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

const getDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('prompt_profile.db');
  }
  return db;
};

export const initDB = async () => {
  try {
    const database = await getDB();
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        created_at INTEGER NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY NOT NULL,
        profile_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY NOT NULL,
        profile_id TEXT NOT NULL,
        project_id TEXT,
        name TEXT NOT NULL,
        description TEXT,
        ingredients TEXT,
        category TEXT,
        notes TEXT,
        image_uri TEXT,
        raw_text TEXT,
        parsed_data TEXT,
        source_type TEXT,
        source_url TEXT,
        created_at INTEGER,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY NOT NULL,
        profile_id TEXT NOT NULL,
        project_id TEXT,
        content TEXT NOT NULL,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS prompts (
        id TEXT PRIMARY KEY NOT NULL,
        profile_id TEXT NOT NULL,
        project_id TEXT,
        content TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'offline',
        created_at INTEGER NOT NULL,
        is_favorite INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS product_experiences (
        id TEXT PRIMARY KEY NOT NULL,
        product_id TEXT NOT NULL,
        experience_text TEXT NOT NULL,
        result_type TEXT NOT NULL, -- 'worked', 'not_worked', 'neutral'
        side_effects TEXT,
        rating INTEGER NOT NULL,
        reuse_decision TEXT NOT NULL, -- 'yes', 'no'
        created_at INTEGER NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS health_records (
        id TEXT PRIMARY KEY NOT NULL,
        profile_id TEXT NOT NULL,
        project_id TEXT,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        file_uri TEXT NOT NULL,
        extracted_text TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS routines (
        id TEXT PRIMARY KEY NOT NULL,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        products_json TEXT NOT NULL, -- JSON array of product IDs
        created_at INTEGER NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT
      );
      `);

    // Migrations for existing users (V3, V4 & V5)
    try { await database.runAsync("ALTER TABLE profiles ADD COLUMN icon TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE routines ADD COLUMN start_time TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE routines ADD COLUMN days_of_week TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE profiles ADD COLUMN description TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE products ADD COLUMN description TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE products ADD COLUMN source_type TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE products ADD COLUMN source_url TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE products ADD COLUMN created_at INTEGER;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE products ADD COLUMN raw_text TEXT;"); } catch (e) {}
    try { await database.runAsync("ALTER TABLE products ADD COLUMN parsed_data TEXT;"); } catch (e) {}
    try { await database.runAsync("ALTER TABLE products ADD COLUMN project_id TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE notes ADD COLUMN project_id TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE prompts ADD COLUMN source TEXT DEFAULT 'offline';"); } catch (e) {}
    try { await database.runAsync("ALTER TABLE prompts ADD COLUMN project_id TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE profiles ADD COLUMN age TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE profiles ADD COLUMN height TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE profiles ADD COLUMN weight TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE profiles ADD COLUMN experience TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE profiles ADD COLUMN occupation TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE profiles ADD COLUMN healthIssues TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE profiles ADD COLUMN medicines TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE profiles ADD COLUMN sportsInterest TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE profiles ADD COLUMN blood_group TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE profiles ADD COLUMN allergies TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE products ADD COLUMN dosage TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE products ADD COLUMN frequency TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE products ADD COLUMN duration TEXT;"); } catch(e){}
    try { await database.runAsync("ALTER TABLE products ADD COLUMN is_medicine INTEGER DEFAULT 0;"); } catch(e){}

    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Error initializing database', error);
  }
};

export const createProfile = async (profile: Profile): Promise<void> => {
  const database = await getDB();
  await database.runAsync(
    'INSERT INTO profiles (id, name, description, created_at, age, height, weight, experience, occupation, healthIssues, medicines, sportsInterest, blood_group, allergies, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
    [
      profile.id, 
      profile.name, 
      profile.description || null, 
      profile.created_at || Date.now(),
      profile.age || null,
      profile.height || null,
      profile.weight || null,
      profile.experience || null,
      profile.occupation || null,
      profile.healthIssues || null,
      profile.medicines || null,
      profile.sportsInterest || null,
      profile.blood_group || null,
      profile.allergies || null,
      profile.icon || null
    ]
  );
};

export const deleteProfileDB = async (id: string): Promise<void> => {
  const database = await getDB();
  await database.runAsync('DELETE FROM profiles WHERE id = ?;', [id]);
};

export const updateProfileDB = async (profile: Profile): Promise<void> => {
  const database = await getDB();
  await database.runAsync(
    'UPDATE profiles SET name = ?, description = ?, age = ?, height = ?, weight = ?, experience = ?, occupation = ?, healthIssues = ?, medicines = ?, sportsInterest = ?, blood_group = ?, allergies = ?, icon = ? WHERE id = ?;',
    [
      profile.name, 
      profile.description || null,
      profile.age || null,
      profile.height || null,
      profile.weight || null,
      profile.experience || null,
      profile.occupation || null,
      profile.healthIssues || null,
      profile.medicines || null,
      profile.sportsInterest || null,
      profile.blood_group || null,
      profile.allergies || null,
      profile.icon || null,
      profile.id
    ]
  );
};

export const getProfiles = async (): Promise<Profile[]> => {
  const database = await getDB();
  return await database.getAllAsync<Profile>('SELECT * FROM profiles ORDER BY created_at DESC;');
};

export const createProject = async (project: Omit<Project, 'id'> & { id: string }): Promise<void> => {
  const database = await getDB();
  await database.runAsync(
    'INSERT INTO projects (id, profile_id, name, description, created_at) VALUES (?, ?, ?, ?, ?);',
    [project.id, project.profile_id, project.name, project.description || null, project.created_at || Date.now()]
  );
};

export const getProjectsByProfile = async (profileId: string): Promise<Project[]> => {
  const database = await getDB();
  return await database.getAllAsync<Project>('SELECT * FROM projects WHERE profile_id = ? ORDER BY created_at DESC;', [profileId]);
};

export const createProduct = async (product: Omit<Product, 'id'> & { id: string }): Promise<void> => {
  const database = await getDB();
  await database.runAsync(
    'INSERT INTO products (id, profile_id, project_id, name, description, ingredients, category, notes, image_uri, raw_text, parsed_data, source_type, source_url, dosage, frequency, duration, is_medicine, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
    [
      product.id, 
      product.profile_id, 
      product.project_id || null, 
      product.name, 
      product.description || null, 
      product.ingredients || null, 
      product.category || null, 
      product.notes || null, 
      product.image_uri || null, 
      product.raw_text || null, 
      product.parsed_data || null, 
      product.source_type || 'manual', 
      product.source_url || null,
      product.dosage || null,
      product.frequency || null,
      product.duration || null,
      product.is_medicine ? 1 : 0,
      product.created_at || Date.now()
    ]
  );
};

export const updateProductDB = async (product: Product): Promise<void> => {
  const database = await getDB();
  await database.runAsync(
    'UPDATE products SET name = ?, description = ?, ingredients = ?, category = ?, notes = ?, image_uri = ?, raw_text = ?, parsed_data = ?, source_type = ?, source_url = ?, project_id = ?, dosage = ?, frequency = ?, duration = ?, is_medicine = ? WHERE id = ?;',
    [
      product.name, 
      product.description || null, 
      product.ingredients || null, 
      product.category || null, 
      product.notes || null, 
      product.image_uri || null, 
      product.raw_text || null, 
      product.parsed_data || null, 
      product.source_type || 'manual', 
      product.source_url || null, 
      product.project_id || null,
      product.dosage || null,
      product.frequency || null,
      product.duration || null,
      product.is_medicine ? 1 : 0,
      product.id
    ]
  );
};

export const getProductsByProject = async (projectId: string): Promise<Product[]> => {
  const database = await getDB();
  return await database.getAllAsync<Product>('SELECT * FROM products WHERE project_id = ?;', [projectId]);
};

export const getProductsByProfile = async (profileId: string): Promise<Product[]> => {
  const database = await getDB();
  return await database.getAllAsync<Product>('SELECT * FROM products WHERE profile_id = ? ORDER BY created_at DESC;', [profileId]);
};

export const deleteProductDB = async (id: string): Promise<void> => {
  const database = await getDB();
  await database.runAsync('DELETE FROM products WHERE id = ?;', [id]);
};

export const createNote = async (note: Omit<Note, 'id'> & { id: string }): Promise<void> => {
  const database = await getDB();
  await database.runAsync(
    'INSERT INTO notes (id, profile_id, project_id, content, created_at) VALUES (?, ?, ?, ?, ?);',
    [note.id, note.profile_id, note.project_id || null, note.content, note.created_at || Date.now()]
  );
};

export const getNotesByProject = async (projectId: string): Promise<Note[]> => {
  const database = await getDB();
  return await database.getAllAsync<Note>('SELECT * FROM notes WHERE project_id = ?;', [projectId]);
};

export const createPrompt = async (prompt: Prompt): Promise<void> => {
  const database = await getDB();
  await database.runAsync(
    'INSERT INTO prompts (id, profile_id, project_id, content, source, created_at, is_favorite) VALUES (?, ?, ?, ?, ?, ?, ?);',
    [prompt.id, prompt.profile_id, prompt.project_id || null, prompt.content, prompt.source, prompt.created_at, prompt.is_favorite ? 1 : 0]
  );
};

export const getPromptsByProject = async (projectId: string): Promise<Prompt[]> => {
  const database = await getDB();
  const prompts = await database.getAllAsync<any>('SELECT * FROM prompts WHERE project_id = ? ORDER BY created_at DESC;', [projectId]);
  return prompts.map(p => ({ ...p, is_favorite: p.is_favorite === 1 }));
};

export const toggleFavoritePromptDB = async (promptId: string): Promise<void> => {
  const database = await getDB();
  await database.runAsync(
    'UPDATE prompts SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ?;',
    [promptId]
  );
};

export const getRecentPrompts = async (limit: number = 5): Promise<Prompt[]> => {
  const database = await getDB();
  const prompts = await database.getAllAsync<any>('SELECT * FROM prompts ORDER BY created_at DESC LIMIT ?;', [limit]);
  return prompts.map(p => ({ ...p, is_favorite: p.is_favorite === 1 }));
};

export const createExperience = async (experience: ProductExperience): Promise<void> => {
  const database = await getDB();
  await database.runAsync(
    'INSERT INTO product_experiences (id, product_id, experience_text, result_type, side_effects, rating, reuse_decision, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
    [experience.id, experience.product_id, experience.experience_text, experience.result_type, experience.side_effects || null, experience.rating, experience.reuse_decision, experience.created_at]
  );
};

export const getExperiencesByProduct = async (productId: string): Promise<ProductExperience[]> => {
  const database = await getDB();
  return await database.getAllAsync<ProductExperience>('SELECT * FROM product_experiences WHERE product_id = ? ORDER BY created_at DESC;', [productId]);
};

export const createRoutine = async (routine: Routine): Promise<void> => {
  const database = await getDB();
  await database.runAsync(
    'INSERT INTO routines (id, project_id, name, products_json, start_time, days_of_week, created_at) VALUES (?, ?, ?, ?, ?, ?, ?);',
    [routine.id, routine.project_id, routine.name, JSON.stringify(routine.products), routine.startTime || null, routine.daysOfWeek ? JSON.stringify(routine.daysOfWeek) : null, routine.created_at]
  );
};

export const getRoutinesByProject = async (projectId: string): Promise<Routine[]> => {
  const database = await getDB();
  const routines = await database.getAllAsync<any>('SELECT * FROM routines WHERE project_id = ? ORDER BY created_at DESC;', [projectId]);
  return routines.map(r => ({
    ...r,
    products: JSON.parse(r.products_json),
    startTime: r.start_time,
    daysOfWeek: r.days_of_week ? JSON.parse(r.days_of_week) : undefined
  }));
};

export const updateRoutineDB = async (routine: Routine): Promise<void> => {
  const database = await getDB();
  await database.runAsync(
    'UPDATE routines SET name = ?, products_json = ?, start_time = ?, days_of_week = ? WHERE id = ?;',
    [routine.name, JSON.stringify(routine.products), routine.startTime || null, routine.daysOfWeek ? JSON.stringify(routine.daysOfWeek) : null, routine.id]
  );
};

export const deleteRoutineDB = async (id: string): Promise<void> => {
  const database = await getDB();
  await database.runAsync('DELETE FROM routines WHERE id = ?;', [id]);
};

export const setGlobalSetting = async (key: string, value: string): Promise<void> => {
  const database = await getDB();
  await database.runAsync(
    'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);',
    [key, value]
  );
};

export const createHealthRecord = async (record: HealthRecord): Promise<void> => {
  const database = await getDB();
  await database.runAsync(
    'INSERT INTO health_records (id, profile_id, project_id, title, type, file_uri, extracted_text, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
    [record.id, record.profile_id, record.project_id || null, record.title, record.type, record.file_uri, record.extracted_text || null, record.created_at]
  );
};

export const getHealthRecordsByProject = async (projectId: string): Promise<HealthRecord[]> => {
  const database = await getDB();
  return await database.getAllAsync<HealthRecord>('SELECT * FROM health_records WHERE project_id = ? ORDER BY created_at DESC;', [projectId]);
};

export const getHealthRecordsByProfile = async (profileId: string): Promise<HealthRecord[]> => {
  const database = await getDB();
  return await database.getAllAsync<HealthRecord>('SELECT * FROM health_records WHERE profile_id = ? ORDER BY created_at DESC;', [profileId]);
};

export const deleteHealthRecordDB = async (id: string): Promise<void> => {
  const database = await getDB();
  await database.runAsync('DELETE FROM health_records WHERE id = ?;', [id]);
};
export const getGlobalSetting = async (key: string): Promise<string | null> => {
  const database = await getDB();
  const result = await database.getFirstAsync<{ value: string }>('SELECT value FROM app_settings WHERE key = ?;', [key]);
  return result ? result.value : null;
};

