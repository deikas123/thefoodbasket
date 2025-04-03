import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, X, SendHorizontal, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

// This would be connected to a real chat system in production
const LiveChat = () => {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulate connecting to support
  const connectToSupport = () => {
    setIsConnecting(true);
    
    // Simulate connection delay
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      setMessages([
        {
          id: '1',
          sender: 'agent',
          text: 'Hello! Thank you for contacting The Food Basket support. How can I assist you today?',
          timestamp: new Date()
        }
      ]);
    }, 1500);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: newMessage,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setNewMessage("");
    
    // Simulate agent typing
    setIsTyping(true);
    
    // Simulate agent response after a delay
    setTimeout(() => {
      setIsTyping(false);
      
      const responses = [
        "Thank you for your question. Let me check that for you.",
        "I understand your concern. We can definitely help resolve this issue.",
        "That's a good question. Here's what you need to know...",
        "Let me look into this for you. It'll just take a moment.",
        "I appreciate your patience. We're working on addressing your request."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: randomResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentMessage]);
    }, 1500);
  };

  return (
    <>
      {/* Chat Toggle Button - No longer fixed positioned */}
      <Button
        onClick={() => setIsChatOpen(true)}
        className="rounded-full h-14 w-14 shadow-lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window - Still absolute positioned */}
      <div
        className={cn(
          "absolute bottom-0 right-0 w-80 md:w-96 transition-transform duration-300 ease-in-out transform",
          isChatOpen ? "translate-y-0" : "translate-y-[120%]"
        )}
      >
        <Card className="overflow-hidden shadow-lg">
          {/* Chat Header */}
          <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>FB</AvatarFallback>
                <AvatarImage src="/logo.png" alt="The Food Basket" />
              </Avatar>
              <div>
                <h3 className="font-medium text-sm">Customer Support</h3>
                <p className="text-xs opacity-80">
                  {isConnected ? "Connected" : "Connect with our team"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setIsChatOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="h-80">
            {!isConnected ? (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">Need help?</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Connect with our customer support team to get assistance with your orders or queries.
                </p>
                <Button onClick={connectToSupport} disabled={isConnecting}>
                  {isConnecting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Start Chat
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="h-64 p-4" ref={scrollRef}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "mb-3 max-w-[80%] rounded-lg p-3",
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 text-right mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex items-center mb-3 max-w-[80%]">
                      <div className="bg-muted rounded-md px-3 py-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                          <span
                            className="w-2 h-2 rounded-full bg-primary animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></span>
                          <span
                            className="w-2 h-2 rounded-full bg-primary animate-bounce"
                            style={{ animationDelay: "0.4s" }}
                          ></span>
                        </div>
                      </div>
                    </div>
                  )}
                </ScrollArea>
                <form
                  onSubmit={handleSendMessage}
                  className="border-t flex items-center p-2"
                >
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="text-sm resize-none min-h-0 h-10 py-2"
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    disabled={!newMessage.trim()}
                  >
                    <SendHorizontal className="h-5 w-5" />
                  </Button>
                </form>
              </>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

export default LiveChat;
