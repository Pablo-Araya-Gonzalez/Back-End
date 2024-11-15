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
        console.error("Database Error:", error); // Agrega este mensaje para ver el error en consola
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
});

// Ruta para registrar la respuesta de un usuario a la encuesta
router.post('/respuestas', async (req, res) => {
    const { usuario_id, encuesta_id, respuestas } = req.body;
    console.log("Datos recibidos:", req.body); // Para verificar los datos que llegan

    try {
        // Comprobar si el usuario ya respondió a esta encuesta
        const existeRespuesta = await pool.query(
            `SELECT * FROM respuestas WHERE usuario_id = $1 AND encuesta_id = $2`,
            [usuario_id, encuesta_id]
        );

        // Si ya existe una respuesta, devolvemos un error de inmediato
        if (existeRespuesta.rows.length > 0) {
            console.log("Respuesta duplicada encontrada. No se insertará un nuevo registro.");
            return res.status(400).json({ error: 'El usuario ya ha respondido a esta encuesta.' });
        }

        // Si no hay duplicados, procedemos a calcular el puntaje e insertar los datos
        const puntaje_final = Object.values(respuestas).filter(r => r === "sí" || r === "cumple" || r === "verdadero").length;
        console.log("Puntaje calculado:", puntaje_final); // Para verificar el cálculo del puntaje

        const result = await pool.query(
            `INSERT INTO respuestas (usuario_id, encuesta_id, puntaje_final, respuestas)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [usuario_id, encuesta_id, puntaje_final, respuestas]
        );

        console.log("Respuesta insertada correctamente.");
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Database Error:", error.message); // Muestra detalles del error
        res.status(500).json({ error: 'Error al registrar la respuesta' });
    }
});





// Ruta para obtener el historial de respuestas de un usuario
// Ruta GET para obtener un usuario específico
router.get('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`SELECT * FROM usuarios WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Database Error:", error.message);
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
});

// Ruta para actualizar la información de un usuario
router.put('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, email } = req.body;

    if (!nombre || !email) {
        return res.status(400).json({ error: 'El nombre y el correo electrónico son obligatorios.' });
    }

    try {
        const result = await pool.query(
            `UPDATE usuarios SET nombre = $1, email = $2 WHERE id = $3 RETURNING *`,
            [nombre, email, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Database Error:", error.message);
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
});

// Ruta para eliminar un usuario y sus respuestas
router.delete('/usuarios/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Primero eliminamos las respuestas del usuario
        await pool.query(`DELETE FROM respuestas WHERE usuario_id = $1`, [id]);

        // Luego eliminamos el usuario
        const result = await pool.query(`DELETE FROM usuarios WHERE id = $1 RETURNING *`, [id]);

        // Si el usuario no existe, devolvemos un error 404
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.status(200).json({ message: 'Usuario y sus respuestas eliminados correctamente.' });
    } catch (error) {
        console.error("Database Error:", error.message);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
});

// Ruta para eliminar una respuesta específica
router.delete('/respuestas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Intentamos eliminar la respuesta específica
        const result = await pool.query(`DELETE FROM respuestas WHERE id = $1 RETURNING *`, [id]);

        // Si la respuesta no existe, devolvemos un error 404
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Respuesta no encontrada.' });
        }

        res.status(200).json({ message: 'Respuesta eliminada correctamente.' });
    } catch (error) {
        console.error("Database Error:", error.message);
        res.status(500).json({ error: 'Error al eliminar la respuesta' });
    }
});


export default router;