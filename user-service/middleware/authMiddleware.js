const jwt=require("jsonwebtoken")
const { getTokenFromRequest } = require("../utils/request");

module.exports=(req,res,next)=>{
    const token=getTokenFromRequest(req)
    if(!token){
        return res.status(401).json({
        message:"Authentication required"
        })
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();

    }catch(err){

        res.status(401).json({
        message:"Invalid token"
        })

  }
}
