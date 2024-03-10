import { sign } from "hono/jwt";
import { getPrismaClient } from "..//db/client";
import { Hono } from "hono";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();


userRouter.post("/api/v1/signup", async (c) => {
    const prisma = getPrismaClient(c.env.DATABASE_URL);
    const body = await c.req.json();

    try {
        //check if user already exists
        const userExists = await prisma.user.findUnique({
            where : {
                email : body.email
            }
        });

        if(userExists){
            return c.json({ message : "User already exists" });
        }

        const user = await prisma.user.create({
            data : {
                email : body.email,
                password : body.password
            }
        });

        const token = await sign({ id : user.id }, c.env.JWT_SECRET);

        return c.json({
            message: "Signup",
            token
        });
    } catch (error) {
        c.status(500);
        return c.json({ message : "Internal server error" });
    }
});


userRouter.post("/api/v1/login", async(c) => {
    const prisma = getPrismaClient(c.env.DATABASE_URL);
    const body = await c.req.json();
 
    try {
        const user = await prisma.user.findUnique({
            where : {
                email : body.email
            }
        });

        if(!user){
            return c.json({ message : "Invalid email or password" });
        }

        const jwt = await sign({ id : user.id }, c.env.JWT_SECRET);

        return c.json({
            message : "Login",
            token : jwt
        });
    } catch (error) {
        c.status(500);
        return c.json({ message : "Internal server error" });
    }

});
