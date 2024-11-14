// db.js
import { Pool } from 'pg';

const pool = new Pool({
    user: 'tu_usuario',           // Cambia esto por tu usuario de PostgreSQL
    host: 'localhost',            // Cambia esto si tu base de datos no está en localhost
    database: 'tu_base_de_datos', // Cambia esto por el nombre de tu base de datos
    password: 'tu_contraseña',    // Cambia esto por tu contraseña de PostgreSQL
    port: 5432                    // Puerto predeterminado de PostgreSQL
});

export default pool;

