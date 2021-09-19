const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');
const http = require('http');
const { createServer } = http;
const server = createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const User = require('./models/user.js');
const mongoose = require('mongoose');
const { PORT, DATABASE_HOST, DATABASE_NAME, DATABASE_CONF } = require('./config.js');
let client;

/*mongoose.connect(`mongodb://${DATABASE_HOST}/${DATABASE_NAME}`, DATABASE_CONF, err => {
    if (err) throw err;

    server.listen(PORT, () => {
        console.log(`Сервер прослушивает сообщения на порту ${PORT}`);
    });
});*/

// установка соединения с бд
mongoose.connect(`mongodb://${DATABASE_HOST}/${DATABASE_NAME}`, DATABASE_CONF, err => {
    if (err) throw err;
});

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
            // отправляем user его сообщения при возвращении в чат
            io.sockets.socket(id).emit('come back chat', {
                name: username,
                messages: message
            });
        } else {
            if ((name) && (room)) {
                client = new User({ username: name, id: room });
                socket.emit('join', {
                    message: `${name} присоединился к обсуждению ${room}.`,
                    status: 'OK'
                });
                // присоединяем user к его комнате
                socket.join(room); 
            } else {
                socket.emit('join', {
                    status: 'FAILED'
                });
            }
        }
    });


    // отправка сообщения в чат
    socket.on('chat message', async data => {
        const { room, msg, time } = data;
        // добавляем сообщение пользователя в массив
        client.message.push({ msg, time });
        // сохраняем user
        await client.save(err => {
            if (err) {
                mongoose.disconnect();
            }
        });
        
        // отправляем сообщение всем клиентам в комнате, включая отправителя
        io.sockets.in(room).emit('chat message', data);
    });

    // отключение соединения с socket
    socket.on('disconnect', () => {
        // отключения соединения с бд
        mongoose.disconnect();
    });
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

// запускаем сервер на 3000 порту
server.listen(PORT, () => {
    console.log(`Сервер прослушивает сообщения на порту ${PORT}`);
});