import express from 'express';
import logger from 'morgan';

const port = process.env.port ?? 3000

const app = express()
app.use(logger('dev'))

app.get('/', (req, res) => {
    res.send('<h1>Esto es el chat</h1>')
})


app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`)
})
