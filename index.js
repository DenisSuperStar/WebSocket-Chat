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
const User = require('./models/user.js');

// устанавливаем соединение с socket
io.on('connection', socket => {
    // регистрация пользователя в чате
    socket.on('join', async user => {
        const { name, room } = user;

        // находим пользователя по Ник в чате
        const person = await User.findOne({ username: name });
        // если такой юзер есть в чате
        if (person) {
            const { username, id, message } = person;
            // присоединяем пользователя к комнате, где он был ранее
            socket.join(id);
            // отправляем ему его сообщения
            io.sockets.socket(id).emit('come back chat', {
                name: username,
                messages: message
            });
        } else {
            if ((name) && (room)) {
                socket.emit('join', {
                    message: `${name} присоединился к обсуждению ${room}.`,
                    status: 'OK'
                });
                // присоединяем пользователя к его комнате
                socket.join(room);
            } else {
                socket.emit('join', {
                    status: 'FAILED'
                });
            }
        }
    });


    // отправка сообщения в чат
    socket.on('chat message', data => {
        // сохранение данных о пользователе в чате
        const { name, room, msg, time } = data;
        const user = new User({ username: name, id: room});
        user.message.push({ msg, time });
        
        // отправляем сообщение всем клиентам в комнате, включая отправителя
        io.sockets.in(room).emit('chat message', data);
    });

    // отключение соединения с socket
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

// подключить базу данных mongo db
server.listen(PORT, () => {
    console.log(`Сервер прослушивает сообщения на порту ${PORT}`);
});