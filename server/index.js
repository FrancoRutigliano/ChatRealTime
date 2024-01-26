import express from 'express';
import logger from 'morgan';

import { Server } from 'socket.io';
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
const port = process.env.port ?? 3000

const app = express()
const server = createServer(app)
const io = new Server(server)

io.on('connection', (socket) => {
    console.log('User has conected')

    socket.on('disconnect', () => {
        console.log('An user has disconnected')
    })
    // la conexion en concreto, cuando reciba el evento de 'chat message', hace algo ->>
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg)
    })
})

app.use(logger('dev'))

app.get('/', (req, res) => {
    // current working directory
    res.sendFile(process.cwd() + '/client/index.html')
})


server.listen(port, () => {
    console.log(`Servidor corriendo en puerto http://localhost:${port}`)
})
