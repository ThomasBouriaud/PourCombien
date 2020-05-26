let sockets = function (server) {
    const User = require('./user.js');
    let users = [];
    let io = require('socket.io').listen(server);

    io.sockets.on('connection', function (socket) {
        console.log("someone arrived !");

        /** USER ARRIVED **/
        socket.on('join', function ({pseudo}) {
            console.log(`join {pseudo:${pseudo}}`);

            users
                .forEach(u => {
                    // add the new user to the other users
                    io.to(u.socketId).emit('add_people', {
                        pseudo: pseudo,
                        socketId: socket.id
                    });

                    // add the other users to the new user
                    socket.emit('add_people', {
                        pseudo: u.pseudo,
                        socketId: u.socketId
                    });
                });

            users.push(new User(pseudo, socket.id));
        });

        /** USER LEFT **/
        socket.on('disconnect', function () {
            console.log('disconnect');
            let current_user = users.filter(u => u.socketId === socket.id);
            if (current_user.length === 0) {
                console.log("unknown user");
                return;
            }

            users = users.filter(u => u.socketId !== socket.id);

            users
                .forEach(u => io.to(u.socketId).emit('remove_people', {
                    pseudo: current_user[0].pseudo,
                    socketId: socket.id
                }));
        });

        /** GAME REQUEST **/
        socket.on('game_request', function ({pseudo, socketId, range}) {
            console.log(`game_request {${pseudo}, ${socketId}, ${range}}`);
            let current_user = users.filter(u => u.socketId === socket.id);
            if(current_user.length === 0) {
                console.log("unknown user");
                return;
            }

            console.log(current_user[0].to_string());

            io.to(socketId).emit('game_request', {
                pseudo: current_user[0].pseudo,
                socketId: socket.id,
                range: range
            });
        });

        socket.on('game_accepted', function ({pseudo, socketId, range}) {
            console.log(`game_accepted {pseudo:${pseudo}, socketId: ${socketId}, range: ${range}}`);

            let current_user = users.filter(u => u.socketId === socket.id);
            let opponent = users.filter(u => u.socketId === socketId && u.pseudo === pseudo);

            if(current_user.length === 0 || opponent.length === 0) {
                console.log("unknown user");
                return;
            }

            current_user[0].opponent = opponent[0];
            opponent[0].opponent = current_user[0];

            current_user[0].ready = false;
            opponent[0].ready = false;

            io.to(current_user[0].socketId).emit('play', {pseudo: opponent[0].pseudo, socketId: opponent[0].socketId, range: range});
            io.to(opponent[0].socketId).emit('play', {pseudo: current_user[0].pseudo, socketId: current_user[0].socketId, range: range});
        });

        socket.on('ready', function ({number}) {
            console.log(`ready {number:${number}}`);
            let current_user = users.filter(u => u.socketId === socket.id);
            if(current_user.length === 0) {
                console.log("unknown user");
                return;
            }

            current_user[0].ready = true;
            current_user[0].number = number;

            let opponent = current_user[0].opponent;

            if(current_user[0].ready && opponent.ready) {
                io.to(current_user[0].socketId).emit('print', {number: opponent.number});
                io.to(opponent.socketId).emit('print', {number: current_user[0].number});

                current_user[0].ready = false;
                opponent.ready = false;

                current_user[0].opponent = null;
                opponent.opponent = null;
            }
        });

        socket.on('game_rejected', function ({pseudo, socketId}) {
            console.log(`game_rejected {pseudo: ${pseudo}, socketId: ${socketId}}`);
            let opponent = users.filter(u => u.socketId === socketId && u.pseudo === pseudo);
            if(opponent.length === 0) {
                console.log("unknown user");
                return;
            }

            io.to(socketId).emit('game_rejected');
        });
    });
}

module.exports = sockets;

// https://socket.io/docs/emit-cheatsheet/