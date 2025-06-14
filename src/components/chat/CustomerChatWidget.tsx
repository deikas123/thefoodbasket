
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createChat, sendMessage, getChatMessages, getUserChats } from "@/services/chatService";
import { toast } from "@/components/ui/use-toast";

const CustomerChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newChatMessage, setNewChatMessage] = useState("");
  const queryClient = useQueryClient();

  // Fetch user's chats
  const { data: chats } = useQuery({
    queryKey: ["user-chats"],
    queryFn: getUserChats,
    enabled: isOpen
  });

  // Fetch messages for selected chat
  const { data: messages } = useQuery({
    queryKey: ["chat-messages", selectedChatId],
    queryFn: () => selectedChatId ? getChatMessages(selectedChatId) : Promise.resolve([]),
    enabled: !!selectedChatId
  });

  // Create new chat mutation
  const createChatMutation = useMutation({
    mutationFn: createChat,
    onSuccess: (chatId) => {
      setSelectedChatId(chatId);
      setNewChatMessage("");
      queryClient.invalidateQueries({ queryKey: ["user-chats"] });
      toast({
        title: "Success",
        description: "Chat started successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start chat",
        variant: "destructive",
      });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ chatId, message }: { chatId: string; message: string }) =>
      sendMessage(chatId, message, 'customer'),
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedChatId] });
      queryClient.invalidateQueries({ queryKey: ["user-chats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  });

  const handleStartNewChat = () => {
    if (!newChatMessage.trim()) return;
    createChatMutation.mutate(newChatMessage.trim());
  };

  const handleSendMessage = () => {
    if (!selectedChatId || !newMessage.trim()) return;
    sendMessageMutation.mutate({ chatId: selectedChatId, message: newMessage.trim() });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-50 text-red-700 border-red-200';
      case 'assigned': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[600px] p-0">
        <div className="flex h-full">
          {/* Chat List */}
          <div className="w-1/3 border-r">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>Customer Support</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <div className="space-y-2 mb-4">
                <Input
                  placeholder="Type your message to start a new chat..."
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleStartNewChat()}
                />
                <Button
                  onClick={handleStartNewChat}
                  disabled={!newChatMessage.trim() || createChatMutation.isPending}
                  className="w-full"
                >
                  Start New Chat
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {chats?.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedChatId === chat.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedChatId(chat.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">Support Chat</span>
                      <Badge variant="outline" className={getStatusColor(chat.status)}>
                        {chat.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatTime(chat.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col">
            {selectedChatId ? (
              <>
                <div className="p-4 border-b">
                  <h3 className="font-medium">Chat Messages</h3>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages?.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_type === 'customer' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-3 py-2 ${
                            message.sender_type === 'customer'
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
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a chat or start a new one to begin messaging
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerChatWidget;
