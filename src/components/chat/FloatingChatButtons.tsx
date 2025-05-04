
import { lazy, Suspense } from "react";

// Lazy loading for chat components
const AIChatBot = lazy(() => import("@/components/AIChatBot"));
const LiveChat = lazy(() => import("@/components/LiveChat"));

export const FloatingChatButtons = () => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col space-y-4 items-end z-30">
      <Suspense fallback={<div />}>
        <AIChatBot />
      </Suspense>
      <Suspense fallback={<div />}>
        <LiveChat />
      </Suspense>
    </div>
  );
};
