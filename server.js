import mongoose from 'mongoose';
import app from './src/middleware/app.js';
import env from 'dotenv';
env.config();

const DBURL = "mongodb://root:1234@127.0.0.1:27017/mongo?authSource=admin";
const PORT = 3000;
const HOST = "127.0.0.1";

mongoose.connect(DBURL)
    .then(() => {
        console.log('MongoDB : ', DBURL);
        app.listen(PORT,HOST, () => console.log("SERVER : ",HOST,":",PORT));
    })
    .catch(err => console.error('MongoDB 연결상태 : 연결실패', err));
