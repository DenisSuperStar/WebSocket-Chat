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
const Room = require('./models/room.js');

io.on('connection', socket => {
    const { id } = socket;
    let room;

    socket.on('join', user => {
        /*console.log(user);*/
        const { name } = user;

        if (name) {
            room = new Room(id, name);

            socket.join(id);
            socket.emit('join', {
                message: `${name} присоединился к обсуждению.`,
                status: 'OK'
            });
        } else {
            socket.emit('join', {
                status: 'FAILED'
            });
        }
    });

    socket.on('chat message', async data => {
        /*console.log(data);*/
        const { msg, time } = data;
        room.message.push({ text: msg, time });
        socket.broadcast.emit('chat message', data);
        socket.emit('chat message', data);

        await room.save();
    });

    socket.on('disconnect', () => {});
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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