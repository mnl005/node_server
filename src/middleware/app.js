import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import userRoutes from '../route/user.js';
import authRoute from '../middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = new Koa();

// Body 파서 미들웨어
app.use(bodyParser());

// 전역 에러 처리 미들웨어
app.use(async (ctx, next) => {
    try {
        await next(); // 다음 미들웨어 실행
    } catch (error) {
        console.error("에러메시지 :", error.message); // 서버 콘솔에 에러 로그 출력

        // 클라이언트에 일관된 에러 응답
        ctx.status = error.status || 500;
        ctx.body = {
            message: error.message || '서버 상태 불량'
        };
    }
});



// 로깅 미들웨어
app.use(async (ctx, next) => {
    console.log("------------------------------------------------------");

    console.log(`METHOD : ${ctx.method}`);
    console.log(`URL : ${ctx.url}`);
    console.log(`Request: ${JSON.stringify(ctx.request.body)}`);

    await next();

    console.log(`Status: ${ctx.status}`);
    console.log(`Response: ${JSON.stringify(ctx.body)}`);
});


// 정적 파일 제공 미들웨어 (절대 경로 사용)
app.use(serve(path.join(__dirname, '..')));

// 사용자 라우트 미들웨어
app.use(userRoutes.routes());
app.use(userRoutes.allowedMethods());
app.use(authRoute.routes());
app.use(authRoute.allowedMethods());

// 정적 파일 경로
console.log("------------------------------------------------------------")
console.log("정적 파일 경로 : " ,path.join(__dirname, '..'));

export default app;
