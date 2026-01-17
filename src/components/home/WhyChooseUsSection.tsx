import { Leaf, Clock, Wallet, ShieldCheck, Truck, Headphones } from "lucide-react";

const reasons = [
  {
    icon: Leaf,
    title: "100% Fresh & Organic",
    description: "We source directly from local Kenyan farmers. Our produce is handpicked daily to ensure maximum freshness and quality.",
  },
  {
    icon: Wallet,
    title: "Competitive Pricing",
    description: "No middlemen means better prices for you. Save up to 20% compared to traditional supermarkets on your weekly groceries.",
  },
  {
    icon: Clock,
    title: "Same-Day Delivery",
    description: "Order before 2 PM and receive your groceries the same day. We deliver across Nairobi and Kiambu County.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Guaranteed",
    description: "Not satisfied with your order? We offer hassle-free returns and replacements within 24 hours of delivery.",
  },
  {
    icon: Truck,
    title: "Free Delivery",
    description: "Enjoy free delivery on orders above Ksh 2,000. Affordable delivery rates for smaller orders too.",
  },
  {
    icon: Headphones,
    title: "24/7 Customer Support",
    description: "Our dedicated support team is available round the clock via WhatsApp, phone, or email to assist you.",
  },
];

const WhyChooseUsSection = () => {
  return (
    <section className="py-12 md:py-16 bg-muted/30" id="why-choose-us">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Why Choose The Food Basket?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover why thousands of Kenyan families trust us for their daily grocery needs.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="bg-background rounded-xl p-6 border border-border hover:border-primary/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <reason.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {reason.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
