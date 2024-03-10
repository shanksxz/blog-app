import { Hono } from "hono";
import { getPrismaClient } from "../db/client";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
        userId: string;
    }
}>();

blogRouter.use('/api/v1/blog/*', async (c, next) => {
    try {
        const authHeader = c.req.header("Authorization") || "";
        const token = authHeader?.split(" ")[1];
        const payload = await verify(token, c.env.JWT_SECRET);

        if (payload) {
            c.set("userId", payload.id);
            await next();
        }

        return c.json({ message: "Invalid token" });

    } catch (error) {
        c.status(401);
        return c.json({ message: "Unauthorized" });
    }
});

blogRouter.post("/", async (c) => {
    const prisma = getPrismaClient(c.env.DATABASE_URL);
    const body = await c.req.json();

    try {
        const blog = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: c.get("userId")
            }
        });

        return c.json(blog);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
});


blogRouter.put("/", async (c) => {
    const prisma = getPrismaClient(c.env.DATABASE_URL);
    const body = await c.req.json();

    try {
        const blog = await prisma.post.update({
            where: {
                id : body.id
            },
            data: {
                title: body.title,
                content: body.content
            }
        });

        return c.json(blog);
    } catch (error) {
        c.status(500);
        return c.json({ message: "Internal server error" });
    }
});


