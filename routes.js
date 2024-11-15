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

    try {
        // Comprobar si el usuario ya respondió a esta encuesta
        const existeRespuesta = await pool.query(
            `SELECT * FROM respuestas WHERE usuario_id = $1 AND encuesta_id = $2`,
            [usuario_id, encuesta_id]
        );

        if (existeRespuesta.rows.length > 0) {
            return res.status(400).json({ error: 'El usuario ya ha respondido a esta encuesta.' });
        }

        // Calcular el puntaje final basado en las respuestas
        const puntaje_final = Object.values(respuestas).filter(r => r === "sí" || r === "cumple" || r === "verdadero").length;

        // Insertar la respuesta en la base de datos
        const result = await pool.query(
            `INSERT INTO respuestas (usuario_id, encuesta_id, puntaje_final, respuestas)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [usuario_id, encuesta_id, puntaje_final, respuestas]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Database Error:", error.message); // Muestra el mensaje de error detallado
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

// Ruta para generar el reporte completo de un usuario
router.get('/usuarios/:id/reporte', async (req, res) => {
    const { id } = req.params;

    try {
        // Consulta para obtener la información del usuario
        const usuarioResult = await pool.query(`SELECT nombre, email FROM usuarios WHERE id = $1`, [id]);
        
        if (usuarioResult.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const usuario = usuarioResult.rows[0];

        // Consulta para obtener las respuestas del usuario junto con el puntaje
        const respuestasResult = await pool.query(
            `SELECT puntaje_final, respuestas FROM respuestas WHERE usuario_id = $1`, 
            [id]
        );

        if (respuestasResult.rows.length === 0) {
            return res.status(404).json({ error: 'No se encontraron respuestas para este usuario.' });
        }

        const respuestas = respuestasResult.rows[0].respuestas;
        const puntajeFinal = respuestasResult.rows[0].puntaje_final;

        // Lista completa de preguntas fijas con opciones correctas
        const preguntas = [
            { id: "p1", texto: "Pregunta 1", correcta: "sí" },
            { id: "p2", texto: "Pregunta 2", correcta: "sí" },
            { id: "p3", texto: "Pregunta 3", correcta: "sí" },
            { id: "p4", texto: "Pregunta 4", correcta: "sí" },
            { id: "p5", texto: "Pregunta 5", correcta: "sí" },
            { id: "p6", texto: "Pregunta 6", correcta: "sí" },
            { id: "p7", texto: "Pregunta 7", correcta: "sí" },
            { id: "p8", texto: "Pregunta 8", correcta: "sí" },
            { id: "p9", texto: "Pregunta 9", correcta: "sí" },
            { id: "p10", texto: "Pregunta 10", correcta: "sí" }
            // Añade todas las preguntas necesarias con sus respuestas correctas
        ];

        // Crear el reporte combinando preguntas, respuestas y opciones correctas
        const reporte = preguntas.map(pregunta => {
            const respuestaUsuario = respuestas[pregunta.id];
            return {
                pregunta: pregunta.texto,
                respuesta_usuario: respuestaUsuario,
                respuesta_correcta: pregunta.correcta,
                es_correcta: ["sí", "cumple", "verdadero"].includes(respuestaUsuario) && respuestaUsuario === pregunta.correcta
            };
        });

        // Generar la respuesta final del reporte
        res.status(200).json({
            usuario: {
                nombre: usuario.nombre,
                email: usuario.email
            },
            puntaje_final: puntajeFinal,
            respuestas: reporte
        });

    } catch (error) {
        console.error("Database Error:", error.message);
        res.status(500).json({ error: 'Error al generar el reporte' });
    }
});



export default router;