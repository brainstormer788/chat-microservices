import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocketContext=()=>{
    return useContext(SocketContext);
}

export const SocketContextProvider=({children})=>{
    const [socket , setSocket]= useState(null);
    const [onlineUser,setOnlineUser]=useState([]);
    const {authUser, authLoading} = useAuth();
    const socketBaseUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    useEffect(()=>{
        if(authLoading){
            return;
        }

        if(authUser){
            const socket = io(socketBaseUrl,{
                transports:["websocket"],
                withCredentials: true
            })
            socket.on("onlineUsers",(users)=>{
                setOnlineUser(users)
            });
            setSocket(socket);
            return()=>{
                socket.close();
                setSocket(null);
            };
        }else{
            if(socket){
                socket.close();
                setSocket(null); 
            }
            setOnlineUser([]);
        }
    },[authLoading, authUser, socketBaseUrl]);
    return(
    <SocketContext.Provider value={{socket , onlineUser}}>
        {children}
    </SocketContext.Provider>
    )
}
