// routes.js
import express from 'express';
import pool from './db'; // Archivo para la conexión a la base de datos

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

// Ruta para registrar la respuesta de un usuario a la encuesta
router.post('/respuestas', async (req, res) => {
    const { usuario_id, encuesta_id, respuestas } = req.body;

    // Calcular puntaje basado en respuestas
    const puntaje_final = Object.values(respuestas).filter(r => r === "sí" || r === "cumple" || r === "verdadero").length;

    try {
        const result = await pool.query(
            `INSERT INTO respuestas (usuario_id, encuesta_id, puntaje_final, respuestas)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [usuario_id, encuesta_id, puntaje_final, respuestas]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar la respuesta' });
    }
});

// Ruta para obtener el historial de respuestas de un usuario
router.get('/usuarios/:id/respuestas', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT * FROM respuestas WHERE usuario_id = $1`,
            [id]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el historial de respuestas' });
    }
});

export default router;
