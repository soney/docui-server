import * as http from 'http';
import * as express from 'express';
import * as WebSocket from 'ws';
import {SDBServer} from 'sdb-ts';

const PORT:number = 8000;

const app = express();
app.use(express.static('static'));

const server = http.createServer(app);
const wss = new WebSocket.Server({server});
const sdbServer = new SDBServer({wss});
server.listen(PORT);
console.log(`Listening on port ${PORT}`);