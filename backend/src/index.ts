import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/ping', (req: Request, res: Response) => {
    res.status(200).json({ message: 'pong' });
});

// Identify endpoint placeholder
app.post('/identify', async (req: Request, res: Response) => {
    try {
        const { email, phoneNumber } = req.body;
        // TODO: implement logic
        res.status(200).json({ message: 'Not implemented yet' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
