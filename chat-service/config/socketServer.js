const {Server}=require("socket.io")
const jwt = require("jsonwebtoken");
let io;

const parseCookies = (cookieHeader = "") =>
    cookieHeader
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .reduce((cookies, part) => {
            const separatorIndex = part.indexOf("=");
            if (separatorIndex === -1) {
                return cookies;
            }

            const key = part.slice(0, separatorIndex).trim();
            const value = part.slice(separatorIndex + 1).trim();
            if (key) {
                cookies[key] = decodeURIComponent(value);
            }

            return cookies;
        }, {});

const getAllowedOrigins = () =>
    (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

const getSocketToken = (socket) => {
    const cookieName = process.env.AUTH_COOKIE_NAME || "auth_token";
    const cookies = parseCookies(socket.handshake.headers.cookie || "");

    if (cookies[cookieName]) {
        return cookies[cookieName];
    }

    const authHeader = socket.handshake.headers.authorization || "";
    if (authHeader.startsWith("Bearer ")) {
        return authHeader.slice(7);
    }

    return null;
};

const initSocket=(server)=>{
    io=new Server(server,{
        cors:{
            origin(origin, callback) {
                if (!origin || getAllowedOrigins().includes(origin)) {
                    return callback(null, true);
                }

                return callback(new Error("Origin not allowed by CORS"));
            },
            credentials: true
        }
    })

    io.use((socket, next) => {
        const token = getSocketToken(socket);

        if (!token) {
            return next(new Error("Authentication required"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.data.user = decoded;
            return next();
        } catch (error) {
            return next(new Error("Invalid token"));
        }
    });

    return io
}
const getIO=()=>{
    if (!io) {
        throw new Error("Socket not initialized");
    }

  return io;
}
module.exports={initSocket,getIO};
