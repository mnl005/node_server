import Router from 'koa-router';
import {authMiddleware} from '../middleware/auth.js';
import UserService from '../service/user.js';

const router = new Router();


// 테스트
router.post('/test', async (ctx) => {
    ctx.status = 200;
    ctx.body = {
        message: "테스트 성공",
        data: ctx.request.body,
        timestamp: new Date().toISOString(),
        clientIp: ctx.ip,
        userAgent: ctx.headers['user-agent'],
        contentType: ctx.headers['content-type']
    };
});

// 테스트
router.post('/user/me',authMiddleware, async (ctx,next) => {
    try{
         const user = await UserService.createUser(ctx.state.user);

        ctx.status = 200;
        ctx.body = {
            message: ctx.state.user.name + " 님의 정보를 불러왔습니다",
            user: user

        };
        await next();
    }catch(error){
        error.status = 400;
        error.message = "데이터베이스 상태이상";
        throw error;
    }

});


export default router;
