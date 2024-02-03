import express from 'express';
import logger from 'morgan';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';

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
    authToken: process.env.DB_TOKEN
})


// iniciamos y creamos una tabla
await db.execute(`
    CREATE TABLE IF NOT EXISTS messages ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        user TEXT
    )
`)

io.on('connection', async (socket) => {
    console.log('un usuario se ha conectado')

    socket.on('disconnect', () => {
        console.log('un usuario se ha desconectado')
    })


    socket.on('chat message', async (msg) => {
        let result
        const username = socket.handshake.auth.username ?? 'anonymous'
        console.log({ username })
        try {
            result = await db.execute({
                sql: `INSERT INTO messages (content, user) VALUES (:messages, :username)`, // se utiliza para evitar sql injection
                args: { messages: msg, username }
            })
        } catch (error) {
            console.log(error)
            return
        }
        io.emit('chat message', msg, result.lastInsertRowid.toString(), username)
    })
    // recuperar los mensajes sin conexion, basicamente cuando estemos offline
    if (!socket.recovered) {
        try {
            const results = await db.execute({
                sql: `SELECT id, content, user FROM messages WHERE id > ?`,
                args: [socket.handshake.auth.serverOffSet ?? 0]
            })

            results.rows.forEach(row => {
                socket.emit('chat message', row.content, row.id.toString())
            });
        } catch (error) {
            console.log(error)
        }
    }
})





app.use(logger('dev'))

app.get('/', (req, res) => {
    // current working directory
    res.sendFile(process.cwd() + '/client/index.html')
})


server.listen(port, () => {
    console.log(`Servidor corriendo en puerto http://localhost:${port}`)
})
