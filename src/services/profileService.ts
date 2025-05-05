
import { supabase } from "@/integrations/supabase/client";
import { ProfileType } from "@/types/supabase";

export const getUserProfile = async (userId: string): Promise<ProfileType | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      // Profile not found
      return null;
    }
    console.error("Error fetching user profile:", error);
    throw error;
  }
  
  return data;
};

export const updateUserProfile = async (userId: string, profileData: Partial<ProfileType>): Promise<ProfileType> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
  
  return data;
};

export const getUserDietaryPreferences = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('dietary_preferences')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error("Error fetching dietary preferences:", error);
    throw error;
  }
  
  return data?.dietary_preferences || [];
};

export const updateUserDietaryPreferences = async (userId: string, preferences: string[]): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ dietary_preferences: preferences })
    .eq('id', userId);
    
  if (error) {
    console.error("Error updating dietary preferences:", error);
    throw error;
  }
};
