import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContactStrip = () => {
  const phoneNumber = "+254798435685";
  const whatsappMessage = encodeURIComponent("Hi! I'd like to order groceries from The Food Basket.");
  const whatsappLink = `https://wa.me/${phoneNumber.replace('+', '')}?text=${whatsappMessage}`;

  return (
    <section className="py-10 md:py-12 bg-primary text-primary-foreground" id="contact">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Get In Touch
          </h2>
          <p className="text-primary-foreground/80 max-w-lg mx-auto">
            Have questions? Need help with your order? Our friendly team is here to assist you.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Phone */}
          <a 
            href={`tel:${phoneNumber}`}
            className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Call Us</p>
              <p className="text-sm text-primary-foreground/80">+254 798 435 685</p>
            </div>
          </a>

          {/* WhatsApp */}
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/30 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">WhatsApp</p>
              <p className="text-sm text-primary-foreground/80">Chat with us</p>
            </div>
          </a>

          {/* Email */}
          <a 
            href="mailto:info@thefoodbasket.com"
            className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Email Us</p>
              <p className="text-sm text-primary-foreground/80">info@thefoodbasket.com</p>
            </div>
          </a>

          {/* Location */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Service Areas</p>
              <p className="text-sm text-primary-foreground/80">Nairobi & Kiambu</p>
            </div>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="text-center">
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button 
              size="lg" 
              className="bg-green-500 hover:bg-green-600 text-white rounded-full px-8 shadow-lg"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Order via WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactStrip;
