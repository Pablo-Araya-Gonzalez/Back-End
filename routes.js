// routes.js
import express from 'express';
import pool from './db.js'; // Importación correcta de `db.js` con extensión .js

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post('/usuarios', async (req, res) => {
    const { nombre, email } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO usuarios (nombre, email) VALUES ($1, $2) RETURNING *',
            [nombre, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
});

export default router;