// db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',          // Cambia por tu usuario de PostgreSQL
    host: 'localhost',           // Cambia si la base de datos no está en localhost
    database: 'proyecto_de_titulo_formulario', // Cambia por el nombre de tu base de datos
    password: 'admin',    // Cambia por la contraseña de tu base de datos
    port: 5432                   // Puerto predeterminado de PostgreSQL
});

export default pool;

