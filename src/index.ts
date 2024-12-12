import { PrismaClient } from "@prisma/client";
import express from "express";
import bcrypt, { hash } from "bcrypt";
import {z} from "zod";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
//@ts-ignore
import cors from "cors";
import { userMiddleware } from "./middleware";

dotenv.config()
const app = express();
app.use(cors());
const prisma = new PrismaClient();

app.use(express.json());

app.post("/api/v1/signup" , async(req , res) => {

    const requiredBody = z.object({
        username: z.string().min(3 , "Username must be atleast 3 characters long.").max(20 , "Username cannot exceed 20 characters."),
        email: z.string().email({ message: "Invalid email address" }),
        password: z.string().min(7 , "Password must be atleast 7 characters long")
    });

    const parsedData = requiredBody.safeParse(req.body);

    if(!parsedData.success){
        res.status(400).json({
            message: "Incorrect format.",
            error: parsedData.error
        })
        return
    };

    const {username , email , password} = parsedData.data;
    const hashedPassword = await bcrypt.hash(password , 10);

    const foundUser = await prisma.user.findFirst({
        where: {
            email 
        }
    })

    if(foundUser){
        res.json({
            message: "User already exists."
        })
        return;
    } else{
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword as unknown as string
            }
        });
    
        const token = jwt.sign({
            id: newUser.id
            //@ts-ignore
        }, process.env.JWT_USER_PASSWORD);
    
        res.status(200).json({
            token,
            message: "User signed up."

        })
    }

    
})

app.post("/api/v1/signin" , async(req , res) => {
    const {email , password} = req.body;

    const foundUser = await prisma.user.findFirst({
        where: {
            email 
        }
    })

    if(!foundUser){
        res.status(403).json({
            message: "Invalid Credentials."
        })
        return;
    }
    

    //@ts-ignore
    const isPasswordValid = await bcrypt.compare(password , foundUser?.password);

    if(isPasswordValid){
        const token = jwt.sign({
            id: foundUser.id
            //@ts-ignore
        }, process.env.JWT_USER_PASSWORD);
        
        res.json({
            token,
            message: "User signed in successfully."
        })

    }else{
        res.status(403).json({
            foundUser,
            message: "Invalid Credentials."
        })
    }
})

app.post("/api/v1/like" , userMiddleware , async(req , res) => {

    try{
    const {videoId} = req.body;
    //@ts-ignore
    const userId = req.userId;

    const likeFound = await prisma.liked.findUnique({
        where: {
            videoId_userId: {
                videoId , userId
            }
        }
    })

    if(likeFound) {
        await prisma.liked.delete({
            where: {
                videoId_userId: {
                    videoId , userId
                }
            }
        })
        res.status(200).json({
            message: "Unliked the video."
        })
    } else {
        await prisma.liked.create({
            data: {
                videoId , userId
            }
        })
        res.status(200).json({
            message: "Video liked"
        })
    }
} catch(e){
    console.log(e);
    
    res.status(500).json({
        message: "Server error.",
    })
}
});

app.get("/api/v1/like", userMiddleware, async (req, res) => {
    try {
      //@ts-ignore
      const userId = req.userId;
  
      const videoList = await prisma.liked.findMany({
        where: {
          userId: userId
        },
        select: {
          videoId: true
        }
      });
  
      if (videoList.length === 0) {
        res.json({
          message: "You have not liked any video.",
          videoList: [] // Return an empty array
        });
      } else {
        res.json({
          videoList
        });
      }
    } catch (e) {
      console.log("Error in /api/v1/like:", e); // More descriptive error logging
      res.status(500).json({
        message: "Server error"
      });
    }
  });
  


app.listen(3002);
