import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Wanjiku",
    location: "Westlands, Nairobi",
    rating: 5,
    text: "The Food Basket has transformed how I shop for groceries. Fresh vegetables delivered same day, and the prices are better than supermarkets. Highly recommend!",
    avatar: "SW",
  },
  {
    name: "James Omondi",
    location: "Kilimani, Nairobi",
    rating: 5,
    text: "As a busy professional, I love the convenience. The M-Pesa payment is seamless, and my orders always arrive on time. Best grocery delivery in Nairobi!",
    avatar: "JO",
  },
  {
    name: "Mary Njeri",
    location: "Kiambu Town",
    rating: 5,
    text: "Finally, quality grocery delivery that serves Kiambu! The organic produce is amazing, and the customer service is excellent. My family loves the fresh fruits.",
    avatar: "MN",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-12 md:py-16 bg-background" id="testimonials">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join thousands of happy customers across Nairobi and Kiambu who trust The Food Basket for their grocery needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-muted/30 rounded-2xl p-6 relative border border-border"
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              {/* Testimonial text */}
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                "{testimonial.text}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap justify-center items-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">4.8/5 Average Rating</span>
          </div>
          <div className="h-4 w-px bg-border hidden sm:block"></div>
          <div className="text-sm font-medium">5,000+ Orders Delivered</div>
          <div className="h-4 w-px bg-border hidden sm:block"></div>
          <div className="text-sm font-medium">98% Customer Satisfaction</div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
