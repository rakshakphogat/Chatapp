import { useEffect, useState } from "react";
import { useChatStore, useAuthStore } from "../stores";
import { Users } from "lucide-react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const Sidebar = () => {
  const {
    getUsers,
    getUsersWithOnlineStatus,
    getOnlineUsersCount,
    getUnreadCount,
    unreadMessages,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Debug: Log unread messages whenever they change
  useEffect(() => {
    console.log("📱 Sidebar: Unread messages state changed:", unreadMessages);
  }, [unreadMessages]);

  // Get users with real-time online status
  const usersWithOnlineStatus = getUsersWithOnlineStatus();
  const onlineCount = getOnlineUsersCount();

  // Exclude current user from online count
  const actualOnlineCount = usersWithOnlineStatus.filter(
    (user) => user.isOnline && user._id !== authUser?._id
  ).length;

  const filteredUsers = showOnlineOnly
    ? usersWithOnlineStatus.filter((user) => user.isOnline)
    : usersWithOnlineStatus;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({actualOnlineCount} online)
          </span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${
                selectedUser?._id === user._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.svg"}
                alt={user.fullName || user.name}
                className="size-12 object-cover rounded-full"
                onError={(e) => {
                  e.target.src = "/avatar.svg";
                }}
              />
              {user.isOnline && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
              {/* Unread indicator for mobile */}
              {getUnreadCount(user._id) > 0 && (
                <span className="lg:hidden absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] z-10">
                  {getUnreadCount(user._id) > 9
                    ? "9+"
                    : getUnreadCount(user._id)}
                </span>
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {user.isOnline ? "Online" : "Offline"}
              </div>
            </div>

            {/* Unread message count badge */}
            {getUnreadCount(user._id) > 0 && (
              <div className="hidden lg:block">
                <span className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                  {getUnreadCount(user._id) > 99
                    ? "99+"
                    : getUnreadCount(user._id)}
                </span>
              </div>
            )}
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">
            {showOnlineOnly ? "No online users" : "No users found"}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
