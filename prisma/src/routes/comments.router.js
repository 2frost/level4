
import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

//** 댓글생성  **//
router.post(
  '/posts/:postId/comments',
  authMiddleware,
  async (req, res, next) => {
    const { postId } = req.params;
    const { userId } = req.user;
    const { content } = req.body;

    const post = await prisma.posts.findFirst({
      where: {
        postId: +postId,
      },
    });
    if (!post)
      return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });

    const comment = await prisma.comments.create({
      data: {
        UserId: +userId, 
        PostId: +postId, 
        content: content,
      },
    });

    return res.status(201).json({ message: '댓글을 작성하였습니다.' });
  },
);


//** 댓글목록조회 **//
router.get('/posts/:postId/comments', async (req, res, next) => {
  const { postId } = req.params;

  const post = await prisma.posts.findFirst({
    where: {
      postId: +postId,
    },
  });
  if (!post)
    return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });

  const comments = await prisma.comments.findMany({
    where: {
      PostId: +postId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return res.status(200).json({ data: comments });
});



//** 댓글수정 **// 댓글수정 수정하기 **** 
router.put('/:postId/comments/:commentId', authMiddleware, async (req, res, next) => {
  try {
   
    const { userId } = req.user;
    const { postId, commentId } = req.params;
    const { comment } = req.body;

    if (!comment)
    return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
  if (!postId || !commentId)
    return res
      .status(400)
      .json({ message: '데이터 형식이 올바르지 않습니다.' });

      const post = await prisma.posts.findUnique({
        where: { postId: Number(postId) },
      });
      if (!post)
        return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });

    await prisma.comments.update({
      where: { commentId: +commentId, PostId: +postId, UserId: +userId },
      data: { comment },
      where: { commentId: +commentId },
    });

    return res.status(200).json({ message: '댓글을 수정하였습니다.' });
  } catch (error) {
    handleError(res, error);
  }
});


// ** 댓글삭제 **//

router.delete(
  '/:postId/comments/:commentId',
  authMiddleware,
  async (req, res) => {
    try {
      const { userId } = req.user;
      const { postId, commentId } = req.params;

      const post = await prisma.posts.findUnique({
        where: { postId: +postId },
      });
      if (!post)
        return res.status(400).json({ message: '게시글이 존재하지 않습니다.' });
  
      const comment = await prisma.comments.findUnique({
        where: { commentId: +commentId },
      });
      if (!comment)
        return res.status(404).json({ message: '댓글이 존재하지 않습니다.' });

      await prisma.comments.delete({
        where: { commentId: +commentId, PostId: +postId, UserId: +userId },
      });

      return res.status(200).json({ message: '댓글을 삭제하였습니다.' });
    } catch (error) {
      handleError(res, error);
    }
  });
     
export default router;
