import { Truck, Leaf, Headphones, ShieldCheck, Clock, CreditCard } from "lucide-react";

const benefits = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over Ksh 2,000",
  },
  {
    icon: Leaf,
    title: "Organic Products",
    description: "100% certified organic",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated customer service",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "100% secure checkout",
  },
  {
    icon: Clock,
    title: "Fast Delivery",
    description: "Same day delivery",
  },
  {
    icon: CreditCard,
    title: "Easy Returns",
    description: "10 days return policy",
  },
];

const BenefitsStrip = () => {
  return (
    <section className="py-8 md:py-12 border-t border-border bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <benefit.icon className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-sm md:text-base text-foreground mb-1">
                {benefit.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsStrip;
