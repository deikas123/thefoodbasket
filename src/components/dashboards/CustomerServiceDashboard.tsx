
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, User, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface ChatMessage {
  id: string;
  message: string;
  sender_type: 'customer' | 'agent';
  sender_id: string;
  created_at: string;
}

interface CustomerChat {
  id: string;
  customer_id: string;
  customer_service_id?: string;
  status: 'open' | 'assigned' | 'resolved';
  created_at: string;
  customer_name?: string;
  last_message?: string;
  unread_count?: number;
}

const CustomerServiceDashboard = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();

  // Fetch all customer chats
  const { data: chats, isLoading: chatsLoading } = useQuery({
    queryKey: ["customer-chats"],
    queryFn: async () => {
      const { data: chatsData, error: chatsError } = await supabase
        .from('customer_chats')
        .select(`
          *,
          profiles!customer_chats_customer_id_fkey(first_name, last_name)
        `)
        .order('updated_at', { ascending: false });

      if (chatsError) {
        console.error("Error fetching chats:", chatsError);
        return [];
      }

      return chatsData?.map(chat => ({
        ...chat,
        customer_name: `${chat.profiles?.first_name || ''} ${chat.profiles?.last_name || ''}`.trim() || 'Unknown Customer'
      })) || [];
    }
  });

  // Fetch messages for selected chat
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["chat-messages", selectedChat],
    queryFn: async () => {
      if (!selectedChat) return [];
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', selectedChat)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!selectedChat
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ chatId, message }: { chatId: string; message: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          message,
          sender_type: 'agent'
        });

      if (error) throw error;

      // Update chat timestamp
      await supabase
        .from('customer_chats')
        .update({ 
          updated_at: new Date().toISOString(),
          customer_service_id: user.id,
          status: 'assigned'
        })
        .eq('id', chatId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedChat] });
      queryClient.invalidateQueries({ queryKey: ["customer-chats"] });
      setNewMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  });

  // Assign chat to self
  const assignChatMutation = useMutation({
    mutationFn: async (chatId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('customer_chats')
        .update({ 
          customer_service_id: user.id,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-chats"] });
      toast({
        title: "Success",
        description: "Chat assigned to you",
      });
    }
  });

  const handleSendMessage = () => {
    if (!selectedChat || !newMessage.trim()) return;
    sendMessageMutation.mutate({ chatId: selectedChat, message: newMessage.trim() });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-50 text-red-700 border-red-200';
      case 'assigned': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Customer Service Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Chats</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chats?.filter(chat => chat.status === 'open').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned to Me</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chats?.filter(chat => chat.status === 'assigned').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chats?.filter(chat => 
                chat.status === 'resolved' && 
                new Date(chat.updated_at).toDateString() === new Date().toDateString()
              ).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3m</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Customer Chats</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {chatsLoading ? (
                <div className="p-4">Loading chats...</div>
              ) : (
                <div className="space-y-2 p-4">
                  {chats?.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedChat === chat.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedChat(chat.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{chat.customer_name}</h4>
                        <Badge variant="outline" className={getStatusBadgeVariant(chat.status)}>
                          {chat.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatTime(chat.created_at)}
                      </p>
                      {chat.status === 'open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            assignChatMutation.mutate(chat.id);
                          }}
                        >
                          Assign to Me
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedChat ? 'Chat Messages' : 'Select a chat to view messages'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedChat ? (
              <div className="flex flex-col h-[500px]">
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div>Loading messages...</div>
                  ) : (
                    <div className="space-y-4">
                      {messages?.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_type === 'agent' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-3 py-2 ${
                              message.sender_type === 'agent'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[500px] text-gray-500">
                Select a chat from the left to start messaging
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerServiceDashboard;
