$(() => {
    const socket = io();
    const formChatBox = $('#formChatBox');
    const chatForm = $('#chatForm');
    const userName = $('#userName');
    const messageBox = $('#messageBox');
    const messageForm = $('#messageForm');
    const submitMessage = $('#submitMessage');
    const newMessage = $('#newMessage');

    chatForm.on('submit', e => {
        e.preventDefault();
        socket.emit('login', { name: userName.val() });
    });

    messageForm.on('submit', e => {
        e.preventDefault();
        const date = new Date();
        date.setMilliseconds(3 * 60 * 60 * 1000);
        const currentTime = date.getUTCHours() + ":" + date.getUTCMinutes();

        if (submitMessage.val()) {
            socket.emit('chat message', { name: userName.val(), msg: submitMessage.val(), time: currentTime });
            messageInput.val();
        }
    });

    socket.on('login', () => {
        formChatBox.addClass('d-none');
        messageBox.removeClass('d-none');
    });

    socket.on('chat message', data => {
        newMessage.append(
            `
                <div class="new-message__info">
                    <div class="new-message__user-info-box">
                        <div class="container new-message__user-info">
                            <div class="row new-message__data">
                                <div class="col-9 new-message__username-val-box">
                                    <div class="alert new-message__username-val">${data.name}</div>
                                </div>
                                <div class="col-3 new-message__submit-time-box">
                                    <div class="alert new-message__submit-time">${data.time}</div>
                                </div>
                                <div class="col-12 new-message__added-message-box">
                                    <div class="alert new-message__added-message">${data.msg}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        );
    });

    socket.on('disconnect', () => {
        formChatBox.removeClass('d-none');
        messageBox.addClass('d-none');
    });
});