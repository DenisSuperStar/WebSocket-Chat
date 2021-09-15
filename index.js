const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');
const http = require('http');
const { createServer } = http;
const server = createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const { PORT } = require('./config.js');

io.on('connection', socket => {
    console.log('a user connected');
    socket.on('login', user => {
        console.log('a user connected!');
        const { id } = socket;
        const { name } = user;
        socket.join(id);
        io.to(id).emit('joining', { message: `${name} присоединился к обсуждению.` });
    });

    socket.on('chat message', msg => {
        socket.broadcast.emit('chat message', msg);
    });

    socket.on('disconnect', user  => {
        console.log('a user disconnecting!');
        const { name } = user;
        socket.leave(id);
        io.to.emit('leaving', { message: `${name} покинул чат.` });
    });
});

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Обсуждения'
    });
});

app.use((req, res, next) => {
    res.status(404).send('Запрашиваемая страница не была найдена!');
});

app.use((err, req, res, next) => {
    res.status(500).send('Упс! Что-то сломалось...');
});

server.listen(PORT, () => {
    console.log(`Сервер прослушивает сообщения на порту ${PORT}`);
});