
import DietaryPreferences from "./DietaryPreferences";
import NotificationPreferences from "./NotificationPreferences";

const PreferencesTab = () => {
  return (
    <div className="space-y-6">
      <DietaryPreferences />
      <NotificationPreferences />
    </div>
  );
};

export default PreferencesTab;
