import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { 
  MessageSquare, 
  Send, 
  X, 
  Minimize2, 
  User,
  Bot
} from "lucide-react";

interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_type: 'customer' | 'agent';
  message: string;
  created_at: string;
}

interface Chat {
  id: string;
  customer_id: string;
  customer_service_id?: string;
  status: 'open' | 'assigned' | 'closed';
  created_at: string;
  updated_at: string;
}

const CustomerChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user && isOpen) {
      loadOrCreateChat();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (currentChat) {
      loadMessages();
      subscribeToMessages();
    }
  }, [currentChat]);

  const loadOrCreateChat = async () => {
    if (!user) return;

    try {
      // Check for existing open chat
      const { data: existingChats, error: fetchError } = await supabase
        .from('customer_chats')
        .select('*')
        .eq('customer_id', user.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingChats && existingChats.length > 0) {
        setCurrentChat(existingChats[0]);
      } else {
        // Create new chat
        const { data: newChat, error: createError } = await supabase
          .from('customer_chats')
          .insert({
            customer_id: user.id,
            status: 'open'
          })
          .select()
          .single();

        if (createError) throw createError;
        setCurrentChat(newChat);
      }
    } catch (error) {
      console.error('Error loading/creating chat:', error);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadMessages = async () => {
    if (!currentChat) return;

    try {
      const { data: chatMessages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', currentChat.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(chatMessages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!currentChat) return;

    const channel = supabase
      .channel(`chat-${currentChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${currentChat.id}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
          
          // Show notification for agent messages
          if (newMessage.sender_type === 'agent') {
            toast({
              title: "New message from support",
              description: newMessage.message.substring(0, 100) + "...",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentChat || !user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: currentChat.id,
          sender_id: user.id,
          sender_type: 'customer',
          message: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Button - Hidden on mobile since bottom nav has chat */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 hidden md:block">
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Chat Window - Full screen on mobile, positioned on desktop */}
      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 z-50 bg-background md:bg-transparent">
          <Card className={`w-full h-full md:w-80 shadow-xl transition-all duration-200 rounded-none md:rounded-lg ${
            isMinimized ? 'md:h-14' : 'md:h-96'
          }`}>
            {/* Header */}
            <CardHeader className="pb-2 px-4 py-3 bg-primary text-primary-foreground md:rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <CardTitle className="text-sm">Customer Support</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {currentChat?.customer_service_id ? 'Agent Assigned' : 'Waiting...'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary/20 hidden md:flex"
                  >
                    <Minimize2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary/20"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {!isMinimized && (
              <CardContent className="p-0 flex flex-col h-[calc(100%-56px)] md:h-80">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Hello! How can we help you today?</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_type === 'customer' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div className={`flex space-x-2 max-w-[80%] md:max-w-[70%] ${
                            message.sender_type === 'customer' ? 'flex-row-reverse space-x-reverse' : ''
                          }`}>
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {message.sender_type === 'customer' ? (
                                  <User className="h-3 w-3" />
                                ) : (
                                  <Bot className="h-3 w-3" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className={`rounded-lg px-3 py-2 text-sm ${
                                message.sender_type === 'customer'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}>
                                {message.message}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatTime(message.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="flex space-x-2 max-w-[70%]">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              <Bot className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="border-t p-3 pb-safe">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || !newMessage.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
};

export default CustomerChatWidget;