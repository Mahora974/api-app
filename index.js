import dotenv from "dotenv";
import express, { json } from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { createPool } from 'mysql2/promise';

const app = express();
const envFile = process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env.dev';
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

dotenv.config({ path: envFile });
app.use(json());
app.use(cors());

const db = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.getConnection()
    .then(() => console.log('MySQL connecté'))
    .catch(err => console.error('Erreur de connexion à MySQL:', err));

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Accès refusé' });

    verify(token.split(' ')[1], JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token invalide' });
        req.user = user;
        next();
    });
};

app.get('/protected', authenticateToken, async (req, res) => {
    res.json({ message: 'Accès autorisé', user: req.user });
});

app.listen(PORT, () => {
    console.log(`API en écoute sur http://localhost:${PORT}`);
});
