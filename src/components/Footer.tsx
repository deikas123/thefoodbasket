
import { Link } from "react-router-dom";
import { CreditCard } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary/50 dark:bg-secondary/10 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="text-2xl font-semibold text-primary flex items-center gap-2 mb-4">
              <span className="text-3xl">🧺</span>
              <span>The Food Basket</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Bringing fresh, organic produce and quality groceries directly to your doorstep.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-muted-foreground hover:text-primary transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-muted-foreground hover:text-primary transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-muted-foreground hover:text-primary transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span className="text-muted-foreground">
                  123 Business Park, <br />
                  Kikuyu, FC 12345
                </span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span className="text-muted-foreground">+254 798 435685</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span className="text-muted-foreground">info@thefoodbasket.com</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="text-muted-foreground">
                  OPEN 24 HRS
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Payment Methods Section */}
        <div className="border-t pt-8 mb-8">
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-lg font-semibold text-center">We Accept</h3>
            <div className="flex flex-wrap justify-center items-center gap-6">
              {/* Visa */}
              <div className="flex items-center justify-center w-16 h-10 bg-white rounded border border-gray-200 shadow-sm">
                <svg className="w-12 h-6" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.5 11.5L14.5 20.5H11.5L9.5 13.5C9.4 13.1 9.2 12.8 8.9 12.6C8.1 12.2 7.2 11.9 6.3 11.7L6.4 11.5H11.1C11.7 11.5 12.2 11.9 12.3 12.5L13.7 18.5L16.7 11.5H18.5ZM20.5 20.5H18.8L20.5 11.5H22.2L20.5 20.5ZM29.5 13.5C29.5 12.9 29.9 12.5 30.5 12.5C31.5 12.4 32.5 12.6 33.4 13L34 11.8C33 11.4 31.9 11.2 30.8 11.2C29 11.2 27.7 12.1 27.7 13.4C27.7 14.4 28.6 14.9 29.3 15.2C30 15.5 30.3 15.7 30.3 16C30.3 16.4 29.8 16.6 29.3 16.6C28.3 16.6 27.3 16.3 26.4 15.8L25.8 17C26.8 17.5 27.9 17.8 29 17.8C31 17.8 32.3 16.9 32.3 15.5C32.3 13.7 29.5 13.6 29.5 13.5ZM41.5 11.5L40.1 15.5L38.9 11.5H37.1L39.5 20.5H41.2L44.5 11.5H41.5Z" fill="#1434CB"/>
                </svg>
              </div>
              
              {/* Mastercard */}
              <div className="flex items-center justify-center w-16 h-10 bg-white rounded border border-gray-200 shadow-sm">
                <svg className="w-10 h-6" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="15" cy="12" r="7" fill="#EB001B"/>
                  <circle cx="25" cy="12" r="7" fill="#F79E1B"/>
                  <path d="M20 5.5C21.5 6.8 22.5 8.8 22.5 11C22.5 13.2 21.5 15.2 20 16.5C18.5 15.2 17.5 13.2 17.5 11C17.5 8.8 18.5 6.8 20 5.5Z" fill="#FF5F00"/>
                </svg>
              </div>
              
              {/* PayPal */}
              <div className="flex items-center justify-center w-16 h-10 bg-white rounded border border-gray-200 shadow-sm">
                <svg className="w-10 h-6" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5H15C18 5 20 7 20 10C20 13 18 15 15 15H12L11 19H8L8 5ZM11 12H14C15.5 12 16.5 11 16.5 9.5C16.5 8 15.5 7 14 7H11V12Z" fill="#003087"/>
                  <path d="M18 8H25C28 8 30 10 30 13C30 16 28 18 25 18H22L21 22H18L18 8ZM21 15H24C25.5 15 26.5 14 26.5 12.5C26.5 11 25.5 10 24 10H21V15Z" fill="#009CDE"/>
                </svg>
              </div>
              
              {/* M-Pesa */}
              <div className="flex items-center justify-center w-16 h-10 bg-white rounded border border-gray-200 shadow-sm">
                <div className="text-green-600 font-bold text-xs">M-PESA</div>
              </div>
              
              {/* Generic Credit Card */}
              <div className="flex items-center justify-center w-16 h-10 bg-white rounded border border-gray-200 shadow-sm">
                <CreditCard className="w-6 h-6 text-gray-600" />
              </div>
              
              {/* Mobile Money */}
              <div className="flex items-center justify-center w-16 h-10 bg-white rounded border border-gray-200 shadow-sm">
                <div className="text-xs font-semibold text-gray-600">Mobile Money</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Secure payments processed with industry-standard encryption
            </p>
          </div>
        </div>
        
        <div className="border-t pt-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} The Food Basket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
