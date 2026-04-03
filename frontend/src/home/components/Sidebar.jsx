import React, { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import api from "../../lib/api";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { IoArrowBackSharp } from "react-icons/io5";
import { BiLogOut } from "react-icons/bi";
import userConversation from "../../Zustans/useConversation";
import { useSocketContext } from "../../context/SocketContext.jsx";

const fallbackAvatar = (name = "User") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0e7490&color=fff`;

const Sidebar = ({ onSelectUser }) => {
  const { authUser, setAuthUser } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [searchUser, setSearchuser] = useState([]);
  const [chatUser, setChatUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSetSelectedUserId] = useState(null);
  const [newMessageUsers, setNewMessageUsers] = useState({});
  const { setSelectedConversation } = userConversation();
  const { onlineUser, socket } = useSocketContext();

  const listData = searchUser?.length > 0 ? searchUser : chatUser;
  const safeListData = Array.isArray(listData) ? listData.filter(Boolean) : [];

  const onlineSet = useMemo(() => new Set(onlineUser || []), [onlineUser]);

  useEffect(() => {
    socket?.on("receiveMessage", (newMessage) => {
      setNewMessageUsers(newMessage);
    });
    return () => socket?.off("receiveMessage");
  }, [socket]);

  useEffect(() => {
    if (!authUser?._id) return;

    const chatUserHandler = async () => {
      setLoading(true);
      try {
        const usersRes = await api.get(`/api/users`);
        const data = Array.isArray(usersRes.data) ? usersRes.data : [];
        setChatUser(data.filter((u) => u?._id !== authUser?._id));
      } catch (error) {
        toast.error(error?.userMessage || error?.response?.data?.message || "Request failed");
      } finally {
        setLoading(false);
      }
    };
    chatUserHandler();
  }, [authUser?._id]);

  const handelSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setLoading(true);
    try {
      const usersRes = await api.get("/api/users", {
        params: { q: searchInput.trim() }
      });
      const data = (Array.isArray(usersRes.data) ? usersRes.data : []).filter(
        (user) => user?._id !== authUser?._id
      );
      if (data.length === 0) {
        toast.info("User not found");
        setSearchuser([]);
      } else {
        setSearchuser(data);
      }
    } catch (error) {
      toast.error(error?.userMessage || error?.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const handelUserClick = (user) => {
    onSelectUser(user);
    setSelectedConversation(user);
    setSetSelectedUserId(user._id);
    setNewMessageUsers({});
  };

  const handSearchback = () => {
    setSearchuser([]);
    setSearchInput("");
  };

  const handelLogOut = async () => {
    const confirmlogout = window.prompt("Type your name to logout");
    if (confirmlogout !== authUser?.name) {
      return toast.info("Logout cancelled");
    }

    setLoading(true);
    try {
      await api.post("/api/auth/logout");
      toast.info("Logged out");
      setAuthUser(null);
    } catch (error) {
      toast.error(error?.userMessage || error?.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col p-4">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={authUser?.profilepic}
            alt="profile"
            onError={(e) => {
              e.currentTarget.src = fallbackAvatar(authUser?.name || authUser?.username || authUser?.fullname || "User");
            }}
            className="h-11 w-11 rounded-full border-2 border-cyan-700 object-cover"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Signed in as</p>
            <p className="text-sm font-bold text-slate-800">{authUser?.name}</p>
          </div>
        </div>

        <button
          onClick={handelLogOut}
          disabled={loading}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-300 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed"
          title="Logout"
        >
          <BiLogOut size={20} />
        </button>
      </header>

      <form onSubmit={handelSearchSubmit} className="mb-3 flex items-center gap-2 rounded-2xl bg-white p-2 shadow-sm">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          type="text"
          className="h-10 flex-1 rounded-xl bg-slate-100 px-4 text-sm outline-none focus:ring-2 focus:ring-cyan-700/40"
          placeholder="Search by name"
        />
        <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-700 text-white transition hover:bg-cyan-800">
          <FaSearch />
        </button>
      </form>

      {searchUser?.length > 0 && (
        <button
          onClick={handSearchback}
          className="mb-3 inline-flex w-fit items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700"
        >
          <IoArrowBackSharp /> Back to recent chats
        </button>
      )}

      <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {searchUser?.length > 0 ? "Search results" : "Recent chats"}
      </p>

      <div className="flex-1 overflow-y-auto pr-1">
        {loading && <div className="loading loading-spinner text-cyan-700" />}

        {!loading && safeListData.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
            Search someone to start a conversation.
          </div>
        )}

        {!loading &&
          safeListData.map((user) => {
            const isSelected = selectedUserId === user?._id;
            const isUnread = newMessageUsers?.sender === user?._id || newMessageUsers?.senderId === user?._id;
            const isOnline = onlineSet.has(user?._id);

            return (
              <button
                type="button"
                key={user._id}
                onClick={() => handelUserClick(user)}
                className={`mb-2 flex w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition ${
                  isSelected
                    ? "border-cyan-600 bg-cyan-50"
                    : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="relative">
                  <img
                    src={user.profilepic || fallbackAvatar(user.name || "User")}
                    alt="user"
                    onError={(e) => {
                      e.currentTarget.src = fallbackAvatar(user.name || "User");
                    }}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      isOnline ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{user.name}</p>
                </div>

                {isUnread && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">+1</span>}
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default Sidebar;
