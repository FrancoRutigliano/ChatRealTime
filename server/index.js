import express from 'express';
import logger from 'morgan';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';
//import { DB_TOKEN } from './.env'

import { Server } from 'socket.io';
import { createServer } from 'node:http';

dotenv.config()

const port = process.env.PORT ?? 3000

const app = express()
const server = createServer(app)
const io = new Server(server, {
    connectionStateRecovery: {}
})

// conexion a base de datos
const db = createClient({
    url: "libsql://valid-old-lace-francorutigliano.turso.io",
    authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIyMDI0LTAxLTI2VDE4OjUyOjMxLjg0MjAyMzQ0NloiLCJpZCI6IjQ1NDE5YTJhLWJjNjYtMTFlZS1hYmZmLWUyZTgyZWFhY2IwNSJ9.yiPFpCT-eYzYpswj5CTe7_sCyLxUDqxOICZM45-8K9vNdCygvEoWtWJHKN-jxyF8ehAn9C2yHMNntlW1ahXCBA"
})

// iniciamos y creamos una tabla
await db.execute(`
    CREATE TABLE IF NOT EXISTS messages ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        user TEXT
    )
`)

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
