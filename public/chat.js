const socket = io();

$(() => {
    
    const formChatBox = $("#formChatBox");
    const chatForm = $("#chatForm");
    const userName = $("#userName");
    const roomName = $('#roomName');
    const messageBox = $("#messageBox");
    const messageForm = $("#messageForm");
    const submitMessage = $("#submitMessage");
    const newMessage = $("#newMessage");
    const greeting = $('#greeting');

    const greetingTemp = message => {
        return `
            <div class="col-12 greeting">
                <div class="alert greeting__text">${message}</div>
            </div>
        `;
    }

    const messageTemp = (name, time, msg) => {
        return `
            <div class="new-message__info">
                <div class="new-message__user-info-box">
                    <div class="container new-message__user-info">
                        <div class="row new-message__data">
                            <div class="col-9 new-message__username-val-box">
                                <div class="alert new-message__username-val">${name}</div>
                            </div>
                            <div class="col-3 new-message__submit-time-box">
                                <div class="alert new-message__submit-time">${time}</div>
                            </div>
                            <div class="col-12 new-message__added-message-box">
                                <div class="alert new-message__added-message">${msg}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div> 
        `;
    }

    chatForm.on('submit', e => {
        e.preventDefault();
        socket.emit('join', { name: userName.val(), room: roomName.val() });
    });

    socket.on('join', data => {
        const { message, status } = data;

        if (status === 'OK') {
            formChatBox.addClass("d-none");
            messageBox.removeClass("d-none");
            greeting.prepend(greetingTemp(message));
        }
    });

    messageForm.on('submit', e => {
        e.preventDefault();
        const date = new Date();
        date.setMilliseconds(3 * 60 * 60 * 1000);
        const currentTime = date.getUTCHours() + ":" + date.getUTCMinutes();

        if (submitMessage.val()) {
            socket.emit('chat message', {
                name: userName.val(),
                room: roomName.val(),
                msg: submitMessage.val(),
                time: currentTime
            });

            submitMessage.val();
        }
    });

    socket.on('chat message', data => {
        const { name, time, msg } = data;

        newMessage.append(messageTemp(name, time, msg));
    });

    socket.on('come back chat', data => {
        const { username, messages } = data;

        for (message of messages) {
            newMessage.append(messageTemp(username, message.time, message.msg));
        }
    });
});
