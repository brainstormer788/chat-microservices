import React, { useEffect, useRef, useState } from "react";
import userConversation from "../../Zustans/useConversation";
import { useAuth } from "../../context/AuthContext";
import { TiMessages } from "react-icons/ti";
import { IoArrowBackSharp, IoSend } from "react-icons/io5";
import api from "../../lib/api";
import { toast } from "react-toastify";
import { useSocketContext } from "../../context/SocketContext.jsx";
import notify from "../../assets/sound/notification.mp3";

const fallbackAvatar = (name = "User") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0e7490&color=fff`;

const MessageContainer = ({ onBackUser }) => {
  const { messages, selectedConversation, setMessage } = userConversation();
  const { socket } = useSocketContext();
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendData, setSnedData] = useState("");
  const lastMessageRef = useRef();
  const safeMessages = Array.isArray(messages) ? messages : [];
  const selectedAvatar =
    selectedConversation?.profilepic ||
    selectedConversation?.profilePic ||
    fallbackAvatar(selectedConversation?.name || "User");

  const playNotify = () => {
    const sound = new Audio(notify);
    sound.volume = 0.9;
    sound.play().catch(() => {});
  };

  useEffect(() => {
    socket?.on("receiveMessage", (newMessage) => {
      playNotify();
      setMessage((prev) => [...(Array.isArray(prev) ? prev : []), newMessage]);
    });

    return () => socket?.off("receiveMessage");
  }, [socket, setMessage]);

  useEffect(() => {
    setTimeout(() => {
      lastMessageRef?.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      try {
        const get = await api.get(`/api/messages/${selectedConversation?._id}`);
        const data = get.data;
        if (data.success === false) {
          setMessage([]);
          return;
        }
        setMessage(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error?.userMessage || error?.response?.data?.message || "Request failed");
      } finally {
        setLoading(false);
      }
    };

    if (selectedConversation?._id) getMessages();
  }, [selectedConversation?._id, setMessage]);

  const handelSubmit = async (e) => {
    e.preventDefault();
    if (!sendData.trim()) return;

    setSending(true);
    try {
      const res = await api.post(`/api/messages/send`, {
        receiverId: selectedConversation?._id,
        text: sendData,
      });
      const data = res.data;
      if (data.success === false) {
        return;
      }
      setSnedData("");
      setMessage((prev) => [...(Array.isArray(prev) ? prev : []), data]);
      socket?.emit("sendMessage", {
        receiverId: selectedConversation?._id,
        message: data,
      });
      playNotify();
    } catch (error) {
      toast.error(error?.userMessage || error?.response?.data?.message || "Request failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col p-4">
      {selectedConversation === null ? (
        <div className="flex h-full items-center justify-center">
          <div className="max-w-md rounded-3xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
            <p className="text-2xl font-bold text-slate-800">Welcome, {authUser.name}</p>
            <p className="mt-2 text-sm text-slate-600">Select a chat from the sidebar to start messaging.</p>
            <TiMessages className="mx-auto mt-4 text-6xl text-cyan-700" />
          </div>
        </div>
      ) : (
        <>
          <header className="mb-3 flex h-14 items-center justify-between rounded-2xl bg-cyan-800 px-3 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onBackUser(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 md:hidden"
              >
                <IoArrowBackSharp size={20} />
              </button>
              <img
                className="h-10 w-10 rounded-full border border-white/60 object-cover"
                src={selectedAvatar}
                alt="selected user"
                onError={(e) => {
                  e.currentTarget.src = fallbackAvatar(selectedConversation?.name || "User");
                }}
              />
              <span className="text-base font-bold md:text-lg">{selectedConversation?.name}</span>
            </div>
          </header>

          <div className="flex-1 space-y-1 overflow-y-auto rounded-2xl bg-slate-100/60 p-3">
            {loading && (
              <div className="flex h-full items-center justify-center">
                <div className="loading loading-spinner text-cyan-700"></div>
              </div>
            )}

            {!loading && safeMessages.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">Send a message to start the conversation.</p>
            )}

            {!loading &&
              safeMessages.length > 0 &&
              safeMessages.map((message) => {
                const mine = message.sender === authUser?._id || message.senderId === authUser?._id;
                return (
                  <div key={message?._id} ref={lastMessageRef} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                        mine ? "bg-cyan-700 text-white" : "bg-white text-slate-800"
                      }`}
                    >
                      <p>{message?.text || message?.message}</p>
                      <p className={`mt-1 text-[11px] ${mine ? "text-cyan-100" : "text-slate-500"}`}>
                        {new Date(message?.createdAt).toLocaleTimeString("en-IN", {
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>

          <form onSubmit={handelSubmit} className="mt-3">
            <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-sm">
              <input
                value={sendData}
                onChange={(e) => setSnedData(e.target.value)}
                required
                id="message"
                type="text"
                placeholder="Write a message"
                className="h-10 flex-1 rounded-xl bg-slate-100 px-4 text-sm outline-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-700 text-white transition hover:bg-cyan-800 disabled:opacity-60"
              >
                {sending ? <div className="loading loading-spinner" /> : <IoSend size={20} />}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default MessageContainer;
