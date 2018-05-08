import * as http from 'http';
import * as express from 'express';
import * as WebSocket from 'ws';
import {SDBServer, SDBDoc} from 'sdb-ts';
import * as path from 'path';
import {CodeDoc} from '../node_modules/docui/types/docTypes';

const PORT:number = 8000;

const app = express();
app.use(express.static(path.resolve(__dirname, '..', 'node_modules', 'docui')));

const server = http.createServer(app);
const wss = new WebSocket.Server({server});
const sdbServer = new SDBServer({wss});

interface CounterDoc {
    counter:number
}
const counterDoc:SDBDoc<CodeDoc> = sdbServer.get<CodeDoc>('example', 'counter');

counterDoc.createIfEmpty({
    code: ''
});

server.listen(PORT);
console.log(`Listening on port ${PORT}`);