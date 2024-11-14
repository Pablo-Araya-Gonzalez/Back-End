// index.js
import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes'; // Importación del enrutador

const app = express();
const PORT = 3001;

// Middleware para procesar JSON
app.use(bodyParser.json());

// Usar las rutas desde el archivo routes.js
app.use('/', routes);

// Ruta principal para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.send('¡Hola, Express está funcionando!');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
