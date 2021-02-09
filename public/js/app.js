'use strict';

window.onload = () => {
    // page loaded
    let nameAdded = false;
    const socket = io();

    socket.on('connected', () => {
        nameAdded = false;
        var ul = document.getElementById('messages');
        ul.innerHTML = '';
    });

    socket.on('new-message', (data) => {
        addChatMessage(data);
    });

    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', (data) => {
        console.log(`User ${data.username} ${data.message}.`);
        addChatTyping(data);
    });

    socket.on('stop-typing', (data) => {
        console.log('The user has stopped typing');
        removeChatTyping(data);
    });
    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user-joined', (data) => {
        alert(`${data.username} joined with color: ${data.color}. Total: ${data.numUsers}`);
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user-left', (data) => {
        alert(`${data.username} left. Total: ${data.numUsers}`);
    });

    // DOM EVENTS
    const inputMsg = document.getElementById('msg');
    inputMsg.addEventListener('focus', function(e) {
        socket.emit('typing');
    });
    inputMsg.addEventListener('blur', function(e) {
        socket.emit('stop-typing');
    });

    const btnLogin = document.getElementById('btn-login');
    btnLogin.addEventListener('click', function(e) {
        const chatContainer = document.getElementById('chat');
        const usernameInput = document.getElementById('usernameInput');
        const colorInput = document.getElementById('colorInput');
        if (usernameInput && usernameInput.value && colorInput && colorInput.value) {
            nameAdded = true;
            chatContainer.style.visibility = 'visible';
            socket.emit('add-user', {
                username: usernameInput.value,
                color: colorInput.value
            });
        }
    });

    const btnSendMsg = document.getElementById('btn-send');
    btnSendMsg.addEventListener('click', function(e) {
        const msgInput = document.getElementById('msg');
        let message = msgInput.value;
        // if there is a non-empty message and a socket connection
        if (message && nameAdded) {
            msgInput.value = '';
            addChatMessage({
                username: document.getElementById('usernameInput').value,
                color: document.getElementById('colorInput').value,
                message
            });
            // tell server to execute 'new message' and send along one parameter
            socket.emit('new-message', message);
        }
    });

    function addChatMessage(data) {
        var ul = document.getElementById('messages');
        var li = document.createElement('li');
        li.style.color = data.color;
        li.appendChild(document.createTextNode(data.message));
        ul.appendChild(li);
    }

    function addChatTyping(data) {
        var ul = document.getElementById('messages');
        var li = document.createElement('li');
        li.setAttribute('class', 'typing');
        li.setAttribute('user', data.username);
        li.appendChild(document.createTextNode(data.username + ' ' + data.message));
        ul.appendChild(li);
    }

    function removeChatTyping(data) {
        var ul = document.getElementById('messages');
        var typings = document.getElementsByClassName('typing');
        for (let t in typings) {
            if (typings[t].attributes['user'].value === data.username) {
                ul.removeChild(typings[t]);
            }
        }
    }
}