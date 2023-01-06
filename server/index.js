const express = require('express');
const http = require('http');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const Room = require("./modals/Room");
var server = http.createServer(app);
var io = require('socket.io')(server);
const getWord = require('./api/getWords');

// middleware
app.use(express.json());

// connect to our database
const DB = 'mongodb+srv://abhi:scribble@cluster0.ohouvae.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(DB).then(() => {
    console.log("connection successfully");
})
    .catch((e) => {
        console.log(e);
    })

io.on('connection', (socket) => {
    console.log("i am connected");
    // create game callback
    socket.on('create-game', async ({ nickname, roomname, occupancy, maxRounds }) => {
        try {
            const existingRoom = await Room.findOne({ roomname });
            if (existingRoom) {
                socket.emit('notCorrectGame', 'Room with that name is already exists!');
                return;
            }
            let room = new Room();
            const word = getWord();
            room.word = word;
            room.roomname = roomname;
            room.occupancy = occupancy;
            room.maxRounds = maxRounds;

            let player = {
                socketID: socket.id,
                nickname,
                isPartyLeader: true
            }
            room.players.push(player);
            room = await room.save();
            socket.join(room);
            io.to(roomname).emit('updateRoom', room);
        } catch (error) {
            console.log(error);
        }
    })
    // join game callback
    socket.on('join-game', async ({ nickname, roomname }) => {
        try {
            let room = await Room.findOne({ roomname });
            if (!room) {
                socket.emit('notCorrectGame', 'Please enter a valid room name');
                return;
            }

            if (room.isJoin) {
                let player = {
                    socketID: socket.id,
                    nickname,
                }
                room.players.push(player);
                socket.join(roomname);
                if (room.players.length === room.occupancy) {
                    room.isJoin = false;
                }
                room.turn = room.players.push[room.turnIndex];
                room = await room.save();
                console.log("dsfv", room);
                io.to(roomname).emit('updateRoom', room);
            } else {
                socket.emit('notCorrectGame', 'The game is in progress, please try again later');
            }
        } catch (error) {
            console.log("error", error);
        }
    })

    // message
    socket.on('msg', async (data) => {
        try {
            if (data.msg === data.word) {
                let room = await Room.find({ roomname: data.roomname });
                let userPlayer = room[0].players.filter((player) => {
                    player.nickname == data.username;
                })
                if (data.timeTaken !== 0) {
                    userPlayer[0].points += Math.random((200 / data.timeTaken) * 10);
                }
                room = await room[0].save();
                io.to(data.roomname).emit('msg', {
                    username: data.username,
                    msg: 'Guessed it!',
                    guessedUserCtr: data.guessedUserCtr + 1
                });
                socket.emit('closeInput', '');
            } else {
                io.to(data.roomname).emit('msg', {
                    username: data.username,
                    msg: data.msg,
                    guessedUserCtr: data.guessedUserCtr
                });
            }
        } catch (error) {
            console.log(error);
        }
    });

    // change turn
    socket.on('change-turn', async (roomname) => {
        try {
            let room = await Room.findOne({ roomname });
            let idx = room.turnIndex;
            if (idx + 1 === room.players.length) {
                room.currentRound += 1;
            }
            if (room.currentRound <= room.maxRounds) {
                const word = getWord();
                room.word = word;
                room.turnIndex = (idx + 1) % room.players.length;
                room.turn = room.players[room.turnIndex];
                room = await room.save();
                io.to(roomname).emit('change-turn', room);
            } else {
                io.to(roomname).emit('show-leaderboard', room.players);
            }
        } catch (error) {

        }
    });

    // update score
    socket.on('updateScore', async (roomname) => {
        try {
            const room = await Room.findOne({ roomname });
            io.to(roomname).emit('updateScore', room);
        } catch (error) {
            console.log(error);
        }
    });

    // white board sockets
    socket.on('paint', ({ details, roomname }) => {
        io.to(roomname).emit('points', { details: details });
    });
    // color change
    socket.on('color-change', ({ color, roomname }) => {
        io.to(roomname).emit('color-change', color);
    });
    // stroke socker
    socket.on('stroke-width', ({ value, roomname }) => {
        io.to(roomname).emit('stroke-width', value);
    });

    // clear screen
    socket.on('clear-screen', (roomname) => {
        io.to(roomname).emit('clear-screen', '');
    });

    socket.on('disconnect', async () => {
        try {
            let room = Room.find({ 'players.socketID': socket.id });
            console.log("cvdsfv", room.players);
            for (let i = 0; i < room.players.length; i++) {
                if (room.players[i].socketID === socket.id) {
                    room.players.splice(i, 1);
                    break;
                }
            }
            room = await room.save();
            if (room.players.length === 1) {
                socket.broadcast.to(room.roomname).emit('show-leaderboard', room.players);
            } else {
                socket.broadcast.to(room.roomname).emit('user-disconnected', room.players);
            }
        } catch (error) {
            console.log(error);
        }
    });

})

server.listen(port, "0.0.0.0", () => {
    console.log("server started running on port ", port)
})    