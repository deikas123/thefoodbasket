import { Search, ShoppingCart, CreditCard, Truck } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "1",
    title: "Browse & Select",
    description: "Explore our wide range of fresh vegetables, fruits, dairy, and pantry essentials. Filter by category or search for specific items.",
  },
  {
    icon: ShoppingCart,
    step: "2",
    title: "Add to Cart",
    description: "Add your favorite items to cart. Adjust quantities and check out our weekly deals for extra savings on your groceries.",
  },
  {
    icon: CreditCard,
    step: "3",
    title: "Secure Checkout",
    description: "Pay securely via M-Pesa, credit card, or cash on delivery. We accept all major payment methods for your convenience.",
  },
  {
    icon: Truck,
    step: "4",
    title: "Fast Delivery",
    description: "Receive your fresh groceries at your doorstep. Same-day delivery available in Nairobi and next-day delivery in Kiambu.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-12 md:py-16 bg-muted/30" id="how-it-works">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Order fresh groceries online in 4 simple steps. Fast, easy, and convenient grocery shopping in Kenya.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-background rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
            >
              {/* Step number badge */}
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                {step.step}
              </div>
              
              {/* Icon */}
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>

              {/* Connector line (hidden on last item and on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
