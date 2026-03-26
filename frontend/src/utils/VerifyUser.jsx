import React from "react";
import {Outlet , Navigate} from 'react-router-dom'
import { useAuth } from "../context/AuthContext";

export const VerifyUser = ()=>{
    const {authUser, authLoading} = useAuth();
    if (authLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="rounded-2xl bg-white/70 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                    Verifying session...
                </div>
            </div>
        );
    }
    return authUser ? <Outlet/> : <Navigate to={'/login'}/>
}
