import express from 'express'
import cors from 'cors';
import { connectDB } from './config/db';
import path from 'path';
import authRoutes from './routers/auth.router';
import userRouter from './routers/user.router';

const app = express()

connectDB();

app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);

app.get('/', (req,res)=> {res.send("Server is running")})
app.listen(4000, ()=>console.log('Express running on port 4000'))
