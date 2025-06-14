import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { auth } from 'express-oauth2-jwt-bearer';
import {  userRoute } from './routes/userRoute.js';
import { residencyRoute } from './routes/residencyRoute.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.listen(PORT,()=> {
    console.log(`Server is running on port ${PORT}`);
})

app.use('/api/user', userRoute)
app.use('/api/residency', residencyRoute)