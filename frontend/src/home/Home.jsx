import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import MessageContainer from "./components/MessageContainer";

const Home = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const handelUserSelect = (user) => {
    setSelectedUser(user);
    setIsSidebarVisible(false);
  };

  const handelShowSidebar = () => {
    setIsSidebarVisible(true);
    setSelectedUser(null);
  };

  return (
    <main className="fade-up glass-card flex h-[92vh] w-full max-w-6xl overflow-hidden rounded-3xl">
      <aside
        className={`h-full w-full border-r border-slate-300/60 bg-slate-50/70 md:block md:w-[360px] ${
          isSidebarVisible ? "block" : "hidden"
        }`}
      >
        <Sidebar onSelectUser={handelUserSelect} />
      </aside>

      <section className={`h-full flex-1 bg-white/60 ${selectedUser ? "block" : "hidden md:block"}`}>
        <MessageContainer onBackUser={handelShowSidebar} />
      </section>
    </main>
  );
};

export default Home;
