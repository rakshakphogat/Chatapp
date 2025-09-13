import { MessageCircle } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center">
          <div
            className="
            relative p-6 bg-primary/10 rounded-full
            before:absolute before:inset-0 before:bg-primary/20 before:rounded-full before:animate-ping
          "
          >
            <MessageCircle className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">Welcome to ChatApp!</h2>
          <p className="text-base-content/60">
            Select a conversation from the sidebar to start chatting
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center space-x-3">
          <div className="w-3 h-3 bg-primary/20 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-primary/20 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-primary/20 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
