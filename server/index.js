const keys = require('./keys');

// Express set up
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Postgre Client set up
const { pool, Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

pgClient.on('error', () => console.log('Lost PG connection'));

// In SQL world we need to initiate at least one table in the db
pgClient.on('connect', (client) => {
  client.query('CREATE TABLE IF NOT EXISTS values (number INT)').catch((err) => console.error(err));
});

// Redis client set up

const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redistHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate(); // we need to duplicate the redis client, one for db, on for messaging / subs

// Express route handlers

app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * from values');
  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => res.send(values));
});

app.post('/values', async (req, res) => {
  const index = req.body.index;
  if (parseInt(index) > 40) {
    res.status(422).send('Index too high');
  }
  redisClient.hset('values', index, 'Nothing yet');
  redisPublisher.publish('insert', index);
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
  res.send({ working: true });
});

app.listen(5000, (err) => console.log('listening on port 5000'));
