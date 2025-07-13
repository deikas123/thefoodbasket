import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Phone, Mail } from "lucide-react";
import CustomerChatWidget from "./CustomerChatWidget";

const FloatingChatButtons = () => {
  const [showChatWidget, setShowChatWidget] = useState(false);

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
        {/* Email Button */}
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-200 bg-white hover:bg-gray-50"
          onClick={() => window.location.href = 'mailto:support@foodbasket.com'}
        >
          <Mail className="h-5 w-5" />
        </Button>

        {/* Phone Button */}
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-200 bg-white hover:bg-gray-50"
          onClick={() => window.location.href = 'tel:+1234567890'}
        >
          <Phone className="h-5 w-5" />
        </Button>

        {/* Chat Button */}
        <div className="relative">
          <Button
            onClick={() => setShowChatWidget(true)}
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
          {/* Notification Badge */}
          <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs bg-red-500 text-white">
            Live
          </Badge>
        </div>
      </div>

      {/* Chat Widget */}
      {showChatWidget && <CustomerChatWidget />}
    </>
  );
};

export default FloatingChatButtons;