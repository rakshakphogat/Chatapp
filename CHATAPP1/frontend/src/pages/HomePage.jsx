import { useEffect } from "react";
import { useAuthStore, useChatStore } from "../stores";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const {
    selectedUser,
    getUsers,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser) {
      console.log("🏠 HomePage: User authenticated, setting up chat");
      getUsers();
      subscribeToMessages();

      // Add debugging methods to window for testing unread counts
      window.testUnreadCount = (userId, count) => {
        console.log(
          `🧪 Testing unread count: Setting ${count} for user ${userId}`
        );
        const { setUnreadCountForTesting } = useChatStore.getState();
        setUnreadCountForTesting(userId, count);
      };

      window.checkUnreadState = () => {
        const { unreadMessages } = useChatStore.getState();
        console.log("🔍 Current unread state:", unreadMessages);
        return unreadMessages;
      };

      console.log(
        "🧪 Test methods added to window: testUnreadCount(userId, count) and checkUnreadState()"
      );
    }

    return () => unsubscribeFromMessages();
  }, [authUser, getUsers, subscribeToMessages, unsubscribeFromMessages]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
