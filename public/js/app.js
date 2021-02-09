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
    addChatTyping(data);
  });

  socket.on('stop-typing', (data) => {
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

const btnLogin = document.getElementById('btn-login');
btnLogin.addEventListener('click', function(e) {
    const chatContainer = document.getElementById('chat');
    const usernameInput = document.getElementById('usernameInput');
    const colorInput = document.getElementById('colorInput');
    if(usernameInput && usernameInput.value && colorInput && colorInput.value){
      nameAdded = true;
      chatContainer.style.visibility = 'visible';
      socket.emit('add-user', {username: usernameInput.value, color: colorInput.value});
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
}