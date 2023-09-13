import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

//** likes 게시글 조회 api **// 
router.get('/like', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;

    const posts = await prisma.posts.findMany({
       //findall 의차이는 뭘까요? 
        // sequelize.fn ??? 시험에 나온거 써보고싶다.. 모르곘네.
        // map쓰고, fillter, sort 될것 같긴한데..? 감이 잘 안오네요..
      
        where: {
        Likes: {
            UserId: +userId
        },
      },
      select: {
        postId: true,
        UserId: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        User: {
          select: {
            nickname: true,
          },
        },
        _count: {
          select: {
            Likes: true,
          },
        },
      },
      orderBy: [
        {
    //* likes 게시글조회 count 1차조회 2/3차 created&updated **//
    Likes: {
        _count: 'desc',
      },
    },
    {
      createdAt: 'desc',
    },
    {
        updatedAt: 'desc',
      },
  ],
});

return res.status(200).json({ data: posts });
} catch (error) {
  console.error(error);
  return res.status(400).json({ 
      errorMessage: '좋아요 게시글 조회에 실패하였습니다.' });
}
});


//**  게시글 좋아요 업데이트(등록 및 취소) API **//
router.put('/:postId/like', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;

    const post = await prisma.posts.findUnique({
      where: {
        postId: +postId
      },
    });
    if (!post) {
      return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
    }
    let isLike = await prisma.likes.findFirst({
      where: {
        PostId: +postId,
        UserId: +userId,
      },
    });

    if (!isLike) {
      await prisma.likes.create({
        data: {
          PostId: +postId,
          UserId: +userId,
        },
      });

      return res.status(200).json({ message: '게시글의 좋아요를 등록하였습니다.' });
    } else {
         // 좋아요 게시글 취소하기
      await prisma.likes.destroy({
        where: { likeId: +isLike.likeId },
      });

      return res
        .status(200).json({ 
            errorMessage: '게시글의 좋아요를 취소하였습니다.' });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: '게시글 좋아요에 실패하였습니다.' });
  }
});

export default router;