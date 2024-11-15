import jwt from 'jsonwebtoken';
import axios from "axios";
import Router from "koa-router";

const router = new Router();
router.prefix('/auth');

// 인증 허가
async function access( code) {
    // 1. 액세스 토큰 요청
    const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', null, {
        params: {
            grant_type: 'authorization_code',
            client_id: process.env.KAKAO_REST_API_KEY,
            redirect_uri: process.env.KAKAO_REDIRECT_URI,
            code,
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    const {access_token} = tokenResponse.data;

    // 2. 사용자 정보 요청
    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    const payload = {
        name: userResponse.data.properties.nickname,
        email: userResponse.data.kakao_account.email
    }

    const options = {expiresIn: '1h'};
    return jwt.sign(payload, process.env.JWT_SECERT_KEY, options);


}

// 인증 미들웨어
export async function authMiddleware(ctx, next){
    try {
        // 쿠키에서 토큰 가져오기
        const token = ctx.cookies.get('token');

        // 토큰 검증
        const user = jwt.verify(token, process.env.JWT_SECERT_KEY);

        // 검증된 사용자 정보를 ctx.state에 추가
        ctx.state.user = user;

        // 토큰 갱신
        const newToken = jwt.sign(
            { email: user.email, name: user.name }, // 필요시 다른 페이로드 추가 가능
            process.env.JWT_SECERT_KEY,
            { expiresIn: '1h' } // 갱신된 만료 시간
        );

        // 쿠키 갱신
        ctx.cookies.set('token', newToken, {
            httpOnly: false,
            domain: process.env.DOMAIN,
            path: '/',
            maxAge: 3600000
        });

        await next();
    } catch (error) {
        error.status = 400;
        error.message = "로그인 후 이용해주세요";
        throw error;
    }
}



// 카카오 OAuth 라우터
router.get('/kakao', async (ctx) => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.KAKAO_REST_API_KEY}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&prompt=login`;
    ctx.redirect(kakaoAuthUrl);
});


// 카카오 콜백
router.get('/kakao/callback', async (ctx) => {
    // 카카오 서버에서 코드받기
    const {code} = ctx.query;
    // 인증
    const token = await access(code);
    ctx.cookies.set('token', token, {
        httpOnly: false,
        domain: process.env.DOMAIN,
        path: '/',
        maxAge: 3600000
    });

    // 메인화면으로 리다이렉트
    ctx.redirect(process.env.HOST);
});


// 로그아웃
router.get('/logout', (ctx) => {
    ctx.cookies.set('token', '', {
        httpOnly: false,
        domain: process.env.DOMAIN,
        path: '/',
        maxAge: 3
    });
    // 메인화면으로 리다이렉트
    ctx.redirect(process.env.HOST);
});

export default router;