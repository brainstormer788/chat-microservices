import { createContext , useContext ,useEffect ,useState } from "react";
import api from "../lib/api";

export const AuthContext = createContext();

export  const useAuth =()=>{
    return useContext(AuthContext)
}

const fallbackAvatar = (name = "User") =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0e7490&color=fff`;

const getStoredAuthUser = () => {
    try {
        const raw = localStorage.getItem("chatapp");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const normalizeAuthUser = (user) => {
    if (!user) return null;

    const normalized = { ...user };
    if (!normalized.username && normalized.name) {
        normalized.username = normalized.name;
    }
    if (!normalized.fullname && normalized.name) {
        normalized.fullname = normalized.name;
    }
    if (!normalized.profilepic && normalized.profilePic) {
        normalized.profilepic = normalized.profilePic;
    }
    if (!normalized.profilepic) {
        normalized.profilepic = fallbackAvatar(normalized.name || normalized.username || normalized.fullname || "User");
    }
    if (typeof normalized.profilepic === "string" && normalized.profilepic.includes("avatar.iran.liara.run")) {
        normalized.profilepic = fallbackAvatar(normalized.name || normalized.username || normalized.fullname || "User");
    }
    return normalized;
};

const persistAuthUser = (user) => {
    if (user) {
        localStorage.setItem("chatapp", JSON.stringify(user));
    } else {
        localStorage.removeItem("chatapp");
    }
};

export const AuthContextProvider =({children})=>{
    const [authUser , setAuthUserState] = useState(normalizeAuthUser(getStoredAuthUser()) || null);
    const [authLoading, setAuthLoading] = useState(true);

    const setAuthUser = (user) => {
        const normalized = normalizeAuthUser(user);
        setAuthUserState(normalized);
        persistAuthUser(normalized);
    };

    useEffect(() => {
        let active = true;

        const hydrateAuth = async () => {
            try {
                const response = await api.get("/api/auth/me");
                if (!active) return;
                setAuthUser(response?.data?.user || null);
            } catch {
                if (!active) return;
                setAuthUser(null);
            } finally {
                if (active) {
                    setAuthLoading(false);
                }
            }
        };

        hydrateAuth();

        return () => {
            active = false;
        };
    }, []);

    return <AuthContext.Provider value={{authUser ,setAuthUser, authLoading}}>
        {children}
    </AuthContext.Provider>
}
