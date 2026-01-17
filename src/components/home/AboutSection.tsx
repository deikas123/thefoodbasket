import { Users, Leaf, Truck, ShieldCheck } from "lucide-react";

const AboutSection = () => {
  return (
    <section className="py-12 md:py-16 bg-background" id="about">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            About The Food Basket
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kenya's trusted online grocery delivery service, bringing fresh, organic produce straight from local farms to your doorstep in Nairobi and Kiambu County.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"
              alt="Fresh organic vegetables and fruits at The Food Basket market in Nairobi, Kenya"
              className="w-full h-64 md:h-80 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white font-semibold text-lg">
                Serving Nairobi & Kiambu Since 2024
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Who We Are
              </h3>
              <p className="text-muted-foreground">
                The Food Basket is a Kenyan-owned grocery delivery platform connecting families, hostels, offices, and businesses with fresh, quality groceries. We partner directly with local farmers to ensure you get the freshest produce at competitive prices.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Our Mission
              </h3>
              <p className="text-muted-foreground">
                To make healthy, organic food accessible to every Kenyan household. We believe quality groceries should be affordable, convenient, and delivered with care.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">5,000+</p>
                  <p className="text-sm text-muted-foreground">Happy Customers</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Same Day</p>
                  <p className="text-sm text-muted-foreground">Delivery Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
