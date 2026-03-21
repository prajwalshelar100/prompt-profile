import { Profile, Project, Product, Note, ProductExperience, Routine, HealthRecord } from '../types';

export const buildMasterPrompt = (
  project: Project, 
  profile: Profile, 
  products: Product[], 
  notes: Note[],
  experiences: Record<string, ProductExperience[]>, // productId -> experiences[]
  routines: Routine[],
  healthRecords: HealthRecord[] = []
): string => {
  const cleanStr = (s?: string) => s ? s.trim().replace(/\s+/g, ' ') : '';

  // 1. Organize Products by Outcome
  const workedProducts: string[] = [];
  const failedProducts: string[] = [];
  const neutralProducts: string[] = [];
  const untestedProducts: string[] = [];

  products.forEach(p => {
    const productExps = experiences[p.id] || [];
    if (productExps.length === 0) {
      untestedProducts.push(p.name);
      return;
    }

    // Use most recent experience for categorization
    const latest = productExps[0];
    if (latest.result_type === 'worked') workedProducts.push(p.name);
    else if (latest.result_type === 'not_worked') failedProducts.push(p.name);
    else neutralProducts.push(p.name);
  });

  // 2. Build Detailed Product Inventory
  const productsStr = products.map((p, i) => {
    let out = `- Product: ${p.name}`;
    if (p.category) out += ` (${p.category})`;
    if (p.description) out += `\n  - Details: ${cleanStr(p.description)}`;
    if (p.ingredients) out += `\n  - Ingredients: ${cleanStr(p.ingredients)}`;
    if (p.notes) out += `\n  - Intelligence Notes: ${cleanStr(p.notes)}`;
    if (p.source_url) out += `\n  - Resource Link: ${p.source_url}`;
    
    const productExps = experiences[p.id] || [];
    if (productExps.length > 0) {
      out += `\n  - Experience History:`;
      productExps.forEach(exp => {
        out += `\n    * [${exp.result_type.toUpperCase()}] ${exp.experience_text} (Rating: ${exp.rating}/5)`;
        if (exp.side_effects) out += ` | Side Effects: ${exp.side_effects}`;
      });
    }
    return out;
  }).join('\n');

  // 3. Build Routine Summaries
  const routinesStr = routines.map(r => {
    const routineProducts = r.products.map(pid => {
      const p = products.find(prod => prod.id === pid);
      return p ? p.name : 'Unknown Product';
    }).join(' -> ');
    return `- ${r.name}: ${routineProducts}`;
  }).join('\n');

  const notesStr = notes.map(n => {
    const title = n.title ? `[${n.title}] ` : '';
    return `- ${title}${cleanStr(n.content)}`;
  }).join('\n');

  const personalContext = [
    profile.age ? `- Age: ${profile.age}` : null,
    profile.occupation ? `- Occupation: ${profile.occupation}` : null,
    profile.experience ? `- Professional Experience: ${cleanStr(profile.experience)}` : null,
    profile.height || profile.weight ? `- Physical Stats: ${profile.height || 'N/A'} height, ${profile.weight || 'N/A'} weight` : null,
    profile.healthIssues ? `- Health Constraints/Issues: ${cleanStr(profile.healthIssues)}` : null,
    profile.medicines ? `- Current Medications: ${cleanStr(profile.medicines)}` : null,
    profile.sportsInterest ? `- Sports & Fitness Interests: ${cleanStr(profile.sportsInterest)}` : null,
  ].filter(Boolean).join('\n');

  // 4. Construct Final Prompt
  return `You are a specialized Personal Intelligence Assistant. Your goal is to analyze the user's specific project context and provide hyper-personalized advice based on their real-world experiences.

### 👤 PROFILE & PROJECT
- User: ${profile.name}
- Project: ${project.name}
${project.description ? `- Project Objective: ${cleanStr(project.description)}\n` : ''}
${profile.description ? `- User Persona/Goals: ${cleanStr(profile.description)}\n` : ''}

${personalContext ? `### 🧬 PERSONAL BIOMETRICS & CONSTRAINTS\n${personalContext}\n` : ''}

### 🧠 EXPERIENCE INTELLIGENCE (Worked vs Failed)
- **SUCCESSFUL (Worked well):** ${workedProducts.length > 0 ? workedProducts.join(', ') : 'None yet.'}
- **AVOID (Did not work):** ${failedProducts.length > 0 ? failedProducts.join(', ') : 'None yet.'}
- **NEUTRAL/MIXED:** ${neutralProducts.length > 0 ? neutralProducts.join(', ') : 'None.'}

### 🔁 ACTIVE ROUTINES
${routines.length > 0 ? routinesStr : 'No routines defined for this project.'}

### 📦 COMPLETE PRODUCT INVENTORY
${productsStr || 'No products listed.'}

### 📝 ADDITIONAL NOTES & CONSTRAINTS
${notes.length > 0 ? notesStr : 'None.'}

### 🏥 MEDICAL RECORDS & LAB REPORTS
${healthRecords.length > 0 ? healthRecords.map(r => `- [${r.type.toUpperCase()}] ${r.title}${r.extracted_text ? `: ${r.extracted_text.substring(0, 300)}...` : ''}`).join('\n') : 'No records uploaded.'}

### 🎯 INSTRUCTIONS FOR AI
1. Prioritize products listed as "SUCCESSFUL".
2. Strictly avoid recommending ingredients or habits associated with "AVOID" products.
3. Your advice must be strictly tailored to the ${project.name} context.
4. Maintain a professional, memory-aware tone (e.g., "Since Product X didn't work for you because of Y, let's try...").
5. Do NOT hallucinate information not present in the context above.`;
};
