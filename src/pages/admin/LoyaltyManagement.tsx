
import LoyaltySettingsForm from "@/components/admin/loyalty/LoyaltySettingsForm";
import LoyaltyRedemptionsTable from "@/components/admin/loyalty/LoyaltyRedemptionsTable";

const LoyaltyManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loyalty Points Management</h1>
        <p className="text-muted-foreground">
          Manage loyalty point settings and view redemption history
        </p>
      </div>
      
      <LoyaltySettingsForm />
      <LoyaltyRedemptionsTable />
    </div>
  );
};

export default LoyaltyManagement;
