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
    // id комнаты
    const { id } = socket;
    // регистрация пользователя в чате
    socket.on('join', async user => {
        // имя пользователя в чате
        const { name } = user;

        // находим пользователя по нику в чате
        const user = User.findOne({ username: name });

        // если такой юзер есть в чате
        if (user) {
            // отправляем ему его сообщения
            io.sockets.socket(user.id).emit('chat message', user.message);
        } else {
            if (name) {
                // выполнить присоединение к комнате по id
                socket.join(id);
                // отправляем приветствие пользователю
                socket.emit('join', {
                    message: `${name} присоединился к обсуждению.`,
                    status: 'OK'
                });
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
        const { name, msg, time } = data;
        const user = new User(name, id);
        user.message.push({ message: msg, time });
        
        // отправляем сообщение всем клиентам в комнате, включая отправителя
        io.sockets.in(id).emit('chat message', data);
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