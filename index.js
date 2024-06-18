const express = require('express');
const dotenv = require('dotenv');
const { Client } = require('pg');
const cors = require('cors');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '192.168.1.29';

//SE PASO EL LIMITE DE VERCEL 
//POSTGRES_URL="postgres://default:G7h1iqJxucWT@ep-shy-haze-a4s6y7a4.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require"

//TEMPORALMENTE USAMOS ELEPHANT SQL HASTA Q SE REESTABLESCA 
//pagina: https://api.elephantsql.com/console/c293d692-6a00-4e63-8423-a6bf7bbaf65f/browser?#
//logue con gmal de sombra.aoc
//postgres://hsvhbyev:wUpHftRaUIqS7rxBW-ky6odqe4pA74AZ@isabelle.db.elephantsql.com/hsvhbyev


//NO OLVIDAR DE CRER LA TABLA PRIMERO EN LA BASE DE DATOS.
/*
CREATE TABLE identificadores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255)
);

  Tabla enviador:

sql

CREATE TABLE enviador (
  id SERIAL PRIMARY KEY,
  importe DECIMAL(10, 2),
  nombre VARCHAR(255)
); */

//PARA ELIMINAR LA TABLA. DROP TABLE IF EXISTS identificadores;
const connectionString = process.env.POSTGRES_URL; // Configura tu cadena de conexión

const client = new Client({
  connectionString: connectionString,
});

client.connect();

app.use(cors());
// Middleware para analizar el cuerpo de la solicitud
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + "/public/"));

// Ruta de ejemplo
app.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM identificadores');
    const identificadores = result.rows;
    res.render('home', { identificadores });
  } catch (err) {
    console.error('Error al obtener los identificadores', err);
    res.status(500).send('Error interno del servidor');
  }
});


// Ruta de ejemplo
app.get('/test', async (req, res) => {  
    res.render('test'); 
});

// Ruta para eliminar un elemento
app.post('/eliminar/:id', async (req, res) => {
    const id = req.params.id;
    console.log("ID recibido para eliminar:", id); // Agregar esta línea para depuración
    try {
      await client.query('DELETE FROM identificadores WHERE id = $1', [id]);
      res.redirect('/');
    } catch (err) {
      console.error('Error al eliminar el identificador', err);
      res.status(500).send('Error interno del servidor');
    }
  });
  
  
  

// Ruta para agregar un nuevo elemento
app.post('/agregar', async (req, res) => {
  const nuevoIdentificador = req.body.nuevoIdentificador;
  try {
    await client.query('INSERT INTO identificadores (nombre) VALUES ($1)', [nuevoIdentificador]);
    res.redirect('/');
  } catch (err) {
    console.error('Error al agregar el identificador', err);
    res.status(500).send('Error interno del servidor');
  }
});


// Ruta para verificar si un elemento existe
app.get('/api/existe/:nombre', async (req, res) => {
    const nombre = req.params.nombre;
    try {
      const result = await client.query('SELECT * FROM identificadores WHERE nombre = $1', [nombre]);
      if (result.rows.length > 0) {
        // El elemento existe
        res.json({ existe: true });
      } else {
        // El elemento no existe
        res.json({ existe: false });
      }
    } catch (err) {
      console.error('Error al verificar si el elemento existe', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  

// ENVIADOR ruta para insertar iimpòrte y nombre para videos jk
app.post('/enviador', async (req, res) => {
  const importe = req.body.importe;
  const nombre = req.body.nombre;
  try {
    // Realizar la inserción en la base de datos
    const result = await client.query('INSERT INTO enviador (importe, nombre) VALUES ($1, $2) RETURNING *', [importe, nombre]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error al insertar en la tabla enviador', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para ELIMINAR todos los elementos de la tabla "enviador"
app.delete('/eliminarenviador', async (req, res) => {
  try {
    // Ejecutar la consulta para eliminar todos los elementos de la tabla "enviador"
    await client.query('DELETE FROM enviador');
    res.json({ success: true, message: 'Todos los elementos de la tabla enviador han sido eliminados' });
  } catch (err) {
    console.error('Error al eliminar los elementos de la tabla enviador', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para CONSULTAR "enviador"
app.get('/enviador/consulta', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM enviador ORDER BY importe ASC LIMIT 1');
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'No se encontraron elementos en la tabla enviador' });
    }
  } catch (err) {
    console.error('Error al obtener el primer elemento de la tabla enviador:', err.message);
    res.status(500).json({ error: 'Error interno del servidor', message: err.message });
  }
});




 



// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
