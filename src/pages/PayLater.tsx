
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useKYCStatus } from "@/hooks/useKYCStatus";
import PayLaterNavigation from "@/components/payLater/PayLaterNavigation";
import PayLaterHeader from "@/components/payLater/PayLaterHeader";
import KYCStatusCard from "@/components/payLater/KYCStatusCard";
import PayLaterOptionsGrid from "@/components/payLater/PayLaterOptionsGrid";
import PayLaterFooter from "@/components/payLater/PayLaterFooter";

const PayLater = () => {
  const { user } = useAuth();
  const { kycStatus, setKycStatus, checkingStatus } = useKYCStatus();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              Please login to access Pay Later options
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <PayLaterNavigation />
        <PayLaterHeader />

        <div className="grid md:grid-cols-2 gap-8">
          <KYCStatusCard 
            kycStatus={kycStatus}
            setKycStatus={setKycStatus}
            checkingStatus={checkingStatus}
          />
          <PayLaterOptionsGrid kycStatus={kycStatus} />
        </div>

        <PayLaterFooter />
      </div>
    </div>
  );
};

export default PayLater;
