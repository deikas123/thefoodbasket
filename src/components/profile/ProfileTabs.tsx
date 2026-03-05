
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonalInfoTab from "./PersonalInfoTab";
import PasswordTab from "./PasswordTab";
import PreferencesTab from "./PreferencesTab";
import AutoReplenishTab from "./AutoReplenishTab";

const ProfileTabs = () => {
  return (
    <div className="flex-1">
      <Tabs defaultValue="personal">
        <TabsList className="mb-4 md:mb-6 w-full flex overflow-x-auto scrollbar-hide">
          <TabsTrigger value="personal" className="flex-1 text-xs md:text-sm whitespace-nowrap">
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="password" className="flex-1 text-xs md:text-sm whitespace-nowrap">
            Password
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex-1 text-xs md:text-sm whitespace-nowrap">
            Preferences
          </TabsTrigger>
          <TabsTrigger value="autoreplenish" className="flex-1 text-xs md:text-sm whitespace-nowrap">
            Auto Replenish
          </TabsTrigger>
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
