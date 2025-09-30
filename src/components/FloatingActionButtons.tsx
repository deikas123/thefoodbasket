import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Phone, Mail, ArrowUp, X } from "lucide-react";
import { useIsMobile } from "@/types";
import { cn } from "@/lib/utils";
import CustomerChatWidget from "@/components/chat/CustomerChatWidget";

const FloatingActionButtons = () => {
  const isMobile = useIsMobile();
  const [showChatWidget, setShowChatWidget] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className={cn(
        "fixed z-50 flex flex-col gap-3",
        isMobile ? "bottom-20 right-4" : "bottom-6 right-6"
      )}>
        {/* Expanded action buttons */}
        {isExpanded && (
          <div className="flex flex-col gap-2 animate-fade-in">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-200 bg-background"
              onClick={() => window.location.href = 'mailto:support@foodbasket.com'}
            >
              <Mail className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-200 bg-background"
              onClick={() => window.location.href = 'tel:+1234567890'}
            >
              <Phone className="h-5 w-5" />
            </Button>

            <Button
              onClick={scrollToTop}
              variant="outline"
              size="lg"
              className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-all duration-200 bg-background"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Main help button */}
        <div className="relative">
          <Button
            onClick={() => {
              if (isExpanded) {
                setIsExpanded(false);
              } else {
                setShowChatWidget(true);
              }
            }}
            onDoubleClick={(e) => {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }}
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isExpanded ? (
              <X className="h-6 w-6" />
            ) : (
              <MessageSquare className="h-6 w-6" />
            )}
          </Button>
          {!isExpanded && (
            <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs">
              Help
            </Badge>
          )}
        </div>
      </div>

      {/* Chat Widget */}
      {showChatWidget && <CustomerChatWidget />}
    </>
  );
};

export default FloatingActionButtons;