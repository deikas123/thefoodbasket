import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Bot, X, SendHorizonal, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const preDefinedResponses = [
  {
    keywords: ["hello", "hi", "hey", "greetings"],
    response: "Hello! Welcome to The Food Basket. How can I help you today?"
  },
  {
    keywords: ["delivery", "shipping", "ship"],
    response: "We offer free delivery for orders over $50. Standard delivery takes 1-3 business days, and express delivery is available for an additional fee."
  },
  {
    keywords: ["return", "refund", "money back"],
    response: "We have a 30-day return policy. If you're not satisfied with your purchase, you can return it for a full refund within 30 days."
  },
  {
    keywords: ["payment", "pay", "credit card", "debit card"],
    response: "We accept all major credit cards, debit cards, M-Pesa, and e-wallets. For verified customers, we also offer a Buy Now Pay Later option."
  },
  {
    keywords: ["product", "item", "goods"],
    response: "We offer a wide variety of high-quality food products. You can browse our products by category or use the search bar to find specific items."
  },
  {
    keywords: ["contact", "customer service", "support"],
    response: "You can contact our customer service team at support@thefoodbasket.com or call us at 1-800-123-4567. We're available Monday to Friday, 9am to 6pm."
  },
  {
    keywords: ["discount", "coupon", "promo", "offer"],
    response: "You can find our current promotions on the homepage. We also offer loyalty points for every purchase that can be redeemed for discounts."
  },
  {
    keywords: ["account", "login", "register", "sign up"],
    response: "You can create an account or sign in by clicking the user icon in the top right corner of the website."
  }
];

const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI assistant. How can I help you with The Food Basket today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isMinimized && !isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Simulate AI thinking
    setIsTyping(true);
    
    setTimeout(() => {
      // Generate AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(input),
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateResponse = (query: string): string => {
    const lowerCaseQuery = query.toLowerCase();
    
    // Check for matches in predefined responses
    for (const item of preDefinedResponses) {
      if (item.keywords.some(keyword => lowerCaseQuery.includes(keyword))) {
        return item.response;
      }
    }
    
    // Default response if no matches
    return "I'm not sure about that, but I'd be happy to connect you with our customer service team who can help you better with this query. Would you like me to do that?";
  };
  
  // Quick suggestions
  const suggestions = [
    "Delivery options",
    "Return policy",
    "Payment methods",
    "Current promotions"
  ];
  
  const handleSuggestionClick = (suggestion: string) => {
    // Add suggestion as user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: suggestion,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate AI thinking
    setIsTyping(true);
    
    setTimeout(() => {
      // Generate AI response for suggestion
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(suggestion),
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Chat Button */}
      <Button
        onClick={toggleChat}
        className={`rounded-full p-3 h-14 w-14 flex items-center justify-center ${
          isOpen ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
        }`}
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </Button>
      
      {/* Chat Window */}
      {isOpen && (
        <Card className={`absolute bottom-20 right-0 w-80 md:w-96 shadow-lg transition-all duration-300 ${
          isMinimized ? 'h-14' : 'h-[450px]'
        }`}>
          <CardHeader className={`p-4 flex flex-row items-center justify-between border-b ${
            isMinimized ? 'border-none' : ''
          }`}>
            <CardTitle className="text-base flex items-center">
              <Bot className="h-5 w-5 mr-2 text-primary" />
              AI Assistant
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={toggleMinimize}
            >
              {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </CardHeader>
          
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 h-[300px]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-3 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.isUser 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start mb-3">
                    <div className="rounded-lg px-4 py-2 bg-muted">
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Quick suggestions */}
              {messages.length <= 2 && (
                <div className="px-4 mb-2 flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded-full px-3 py-1 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              
              <CardFooter className="p-3 border-t">
                <form onSubmit={handleSubmit} className="w-full flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
                    <SendHorizonal className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default AIChatBot;
