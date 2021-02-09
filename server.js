const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'public')))
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'))
});

http.listen(3000, () => {
    console.log('App listening on port 3000!');
});

io.on('connection', (socket) => {
    let addedUser = false;
    let numUsers = 0;

    console.log('A user is connected');
    socket.broadcast.emit('connected');

    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
        console.log('A user is disconnected');
        if (addedUser) {
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user-left', {
                username: socket.username,
                color: socket.color,
                numUsers: numUsers
            });
        }
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', () => {
        console.log('The user ' + socket.username + ' is typing ...');
        socket.broadcast.emit('typing', {
            username: socket.username,
            message: 'is typing...'
        });
    });

    // when the client emits 'stop-typing', we broadcast it to others
    socket.on('stop-typing', () => {
        console.log('The user ' + socket.username + ' stop typing ...');
        socket.broadcast.emit('stop-typing', {
            username: socket.username
        });
    });

    socket.on('new-message', (message) => {
        console.log('New message received: ' + message);
        socket.broadcast.emit('new-message', {
            username: socket.username,
            message,
            color: socket.color
        });
    });

    socket.on('add-user', (data) => {
        console.log('New User is joined: ' + data.username + ' with color: ' + data.color);
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = data.username;
        socket.color = data.color;
        ++numUsers;
        addedUser = true;

        console.log('Total Users connected: ' + numUsers);
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user-joined', {
            username: socket.username,
            color: socket.color,
            numUsers: numUsers
        });
    });
});