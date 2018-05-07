import * as http from 'http';
import * as express from 'express';
import * as WebSocket from 'ws';
import {SDBServer, SDBDoc} from 'sdb-ts';
import * as path from 'path';

const PORT:number = 8000;

const app = express();
app.use(express.static(path.resolve(__dirname, '..', 'node_modules', 'docui')));

const server = http.createServer(app);
const wss = new WebSocket.Server({server});
const sdbServer = new SDBServer({wss});

interface CounterDoc {
    counter:number
}
const counterDoc:SDBDoc<CounterDoc> = sdbServer.get<CounterDoc>('example', 'counter');

counterDoc.createIfEmpty({
    counter: 0
});

server.listen(PORT);
console.log(`Listening on port ${PORT}`);