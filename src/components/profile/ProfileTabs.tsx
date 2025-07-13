
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonalInfoTab from "./PersonalInfoTab";
import PasswordTab from "./PasswordTab";
import PreferencesTab from "./PreferencesTab";
import AutoReplenishTab from "./AutoReplenishTab";

const ProfileTabs = () => {
  return (
    <div className="flex-1">
      <Tabs defaultValue="personal">
        <TabsList className="mb-6">
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="autoreplenish">Auto Replenish</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <PersonalInfoTab />
        </TabsContent>
        
        <TabsContent value="password">
          <PasswordTab />
        </TabsContent>
        
        <TabsContent value="preferences">
          <PreferencesTab />
        </TabsContent>
        
        <TabsContent value="autoreplenish">
          <AutoReplenishTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileTabs;
