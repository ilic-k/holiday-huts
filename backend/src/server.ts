import express from 'express'
import cors from 'cors';
import { connectDB } from './config/db';
import path from 'path';
import authRoutes from './routers/auth.router';
import userRouter from './routers/user.router';
import adminRouter from './routers/admin.router';
import cottageRouter from './routers/cottage.router';
import reservationRouter from './routers/reservation,router';

const app = express()

connectDB();

app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);
app.use('/api/cottages', cottageRouter);
app.use('/api/reservations', reservationRouter);
app.use('/api/admin', adminRouter);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error', error: err?.message });
});

app.get('/', (req,res)=> {res.send("Server is running")})
app.listen(4000, ()=>console.log('Express running on port 4000'))
