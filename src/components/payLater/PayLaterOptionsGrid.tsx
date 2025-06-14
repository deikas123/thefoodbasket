
import PayLaterOption from "./PayLaterOption";

interface PayLaterOptionsGridProps {
  kycStatus: 'pending' | 'approved' | 'rejected' | null;
}

const PayLaterOptionsGrid = ({ kycStatus }: PayLaterOptionsGridProps) => {
  const isEnabled = kycStatus === 'approved';

  return (
    <div className="space-y-6">
      <PayLaterOption
        title="Buy Now, Pay in 30 Days"
        description="Get your groceries today and pay in full after 30 days with no interest."
        features={["No interest charges", "30-day payment window", "Automatic reminders"]}
        isEnabled={isEnabled}
      />
      
      <PayLaterOption
        title="Split Payment Plan"
        description="Split your purchase into 3 equal installments over 60 days."
        features={["3 equal payments", "60-day payment period", "Small convenience fee"]}
        isEnabled={isEnabled}
      />
      
      <PayLaterOption
        title="Monthly Payment Plan"
        description="Pay for larger orders in monthly installments up to 6 months."
        features={["Up to 6 months", "Fixed monthly payments", "Competitive interest rates"]}
        isEnabled={isEnabled}
      />
    </div>
  );
};

export default PayLaterOptionsGrid;
