export type RootStackParamList = {
  Home: undefined;
  Onboarding: undefined;
  ProfileDetail: { profileId: string };
  ProjectDetail: { projectId: string };
  ProductReview: { 
    profileId: string; 
    projectId: string; 
    extractedData?: any; 
    imageUri: string | undefined;
    product?: any; // Existing product to edit
    shouldExtract?: boolean;
    debugSimulate?: boolean;
  };
  CameraCapture: { profileId: string; projectId: string };
  PromptGenerator: { profileId: string; projectId: string };
  AIChat: { profileId: string; projectId: string; initialSystemPrompt?: string };
  ExperienceInput: { productId: string; projectId: string };
  Routine: { projectId: string; routineId?: string };
  Profiles: undefined;
  PersonalProfile: { profileId: string };
  Settings: undefined;
  Products: undefined;
  UnifiedAdd: undefined;
  Contact: undefined;
  ProductPicker: { projectId: string; profileId: string };
  HealthProfile: { profileId: string };
};
