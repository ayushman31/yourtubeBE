import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const userMiddleware = (req: Request , res: Response , next: NextFunction) => {
    const token = req.headers.token;

    if(!token){
        res.status(403).json({
            message: "Error in the middleware"
        })
        return;
    }

    const decodedData = jwt.verify(token as unknown as string , process.env.JWT_USER_PASSWORD as string);
    
    if(decodedData){
        //@ts-ignore
        req.userId = decodedData.id,
        next();
    } else{
        res.status(403).json({
            message: "You are not signed in."
        })
        return;
    }

}