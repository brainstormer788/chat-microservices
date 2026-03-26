import {create} from "zustand";

const userConversation = create((set)=>({
    selectedConversation: null,
    setSelectedConversation:(selectedConversation)=>set({selectedConversation}),
    messages:[],
    setMessage:(messagesOrUpdater)=>set((state)=>({
        messages:
            typeof messagesOrUpdater === "function"
                ? messagesOrUpdater(state.messages)
                : messagesOrUpdater
    }))
}));

export default userConversation
