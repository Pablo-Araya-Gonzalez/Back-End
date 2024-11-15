import express from 'express';
import cors from 'cors'; // Importa el middleware CORS
import bodyParser from 'body-parser';
import routes from './routes.js';

const app = express();
const PORT = 3001;

// Habilitar CORS para permitir solicitudes desde el frontend
app.use(cors({
  origin: 'http://localhost:3000', // Reemplaza con la URL del frontend si cambia
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
}));

app.use(bodyParser.json());
app.use('/', routes);

app.get('/', (req, res) => {
  res.send('¡Hola, Express está funcionando!');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
