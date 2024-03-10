import { Hono } from "hono";
import { userRouter } from "./routes/user";
import { blogRouter } from "./routes/blog";

const app = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

app.route("/api/v1", userRouter);
app.route("/api/v1", blogRouter);

// app.use('/api/v1/blog/*', async (c, next) => {
//     try {
//         const authHeader = c.req.header("Authorization") || "";
//         const token = authHeader?.split(" ")[1];
//         const payload = await verify(token,"secret");

//         if(payload) {
//             c.set("userId", payload.id);
//             await next();
//         }

//         return c.json({ message : "Invalid token" });

//     } catch (error) {
//         c.status(401);
//         return c.json({ message : "Unauthorized" });
//     }
// });

export default app;