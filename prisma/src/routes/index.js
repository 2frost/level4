import express from "express"
import likesRouter from './routes/likes.router.js';
import UsersRouter from './routes/users.router.js';
import PostsRouter from './routes/posts.router.js';
import CommentsRouter from './routes/comments.router.js';

const router = express.Router()

router.use("/", [likesRouter, UsersRouter,PostsRouter, CommentsRouter])

export default router;


