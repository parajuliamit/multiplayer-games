const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    withCredentials: false,
    optionsSuccessStatus: 200,
  },
});

// Serve static files
app.use(express.static(__dirname + "/public"));

const toDisconnect = [];
const rooms = {};
const players = {};
const waitingPlayers = [];

io.on("connection", (socket) => {
  if (toDisconnect.includes(socket.id)) {
    toDisconnect.splice(toDisconnect.indexOf(socket.id), 1);
  }
  if (players.length > 100) {
    socket.emit("room_join_error", "Server is full");
    socket.disconnect();
  }
  // chat logics here:
  socket.on("send_message", ({ message }) => {
    const roomId = players[socket.id];
    if (!roomId) {
      socket.emit("room_join_error", "You are not part of any room");
      return;
    }
    //Emit the message to the players in the room only
    io.to(roomId).emit("receive_message", {
      sender: socket.id,
      message: message,
    });
  });

  // -------------------------------------------Game Logic ----------------------------------------------

  // Create or join a game room
  socket.on("create_room", (roomId) => {
    if (roomId?.length !== 4) {
      socket.emit("room_create_error", "Room ID must be 4 characters long");
      return;
    }
    if (rooms[roomId]) {
      socket.emit("room_create_error", `Room with ID ${roomId} already exists`);
      return;
    }
    leaveRoom(socket.id);
    socket.join(roomId);
    rooms[roomId] = {
      players: [socket.id],
      moves: [],
    };
    players[socket.id] = roomId;
    socket.emit("room_created", roomId);
  });

  // Join a random game room
  socket.on("random_match", () => {
    leaveRoom(socket.id);
    if (waitingPlayers.length > 0) {
      if (waitingPlayers.includes(socket)) {
        return;
      }
      const match = waitingPlayers.shift();
      const roomId = Math.random().toString(36).substring(2, 6);
      socket.join(roomId);
      match.join(roomId);

      let turn = Math.random() < 0.5 ? 0 : 1;

      rooms[roomId] = {
        players: [socket.id, match.id],
        moves: [],
        history: [],
        currentTurn: turn,
        firstTurn: turn,
      };
      players[socket.id] = roomId;
      players[match.id] = roomId;

      io.to(roomId).emit("player_joined", {
        roomId,
        currentTurn: turn === 0 ? socket.id : match.id,
      });
    } else {
      waitingPlayers.push(socket);
      socket.emit("waiting_match");
    }
  });

  function leaveRoom(playerId) {
    const playerRoom = players[playerId];
    if (playerRoom) {
      socket.leave(playerRoom);
      rooms[playerRoom].players.splice(
        rooms[playerRoom].players.indexOf(socket.id),
        1
      );
      if (rooms[playerRoom].players.length === 0) {
        delete rooms[playerRoom];
      } else {
        socket.to(playerRoom).emit("player_left", playerRoom);
      }
      delete players[playerId];
    }
  }

  socket.on("join_room", (roomId) => {
    const room = rooms[roomId];
    if (!room) {
      socket.emit("room_join_error", `Room with ID ${roomId} does not exist`);
      return;
    }
    if (!room.players.includes(socket.id) && room.players.length >= 2) {
      socket.emit("room_join_error", `Room with ID ${roomId} is full`);
      return;
    }
    leaveRoom(socket.id);
    socket.join(roomId);
    room.players.push(socket.id);
    room.moves = [];
    room.history = [];
    let turn;
    if (room.firstTurn === undefined) {
      turn = Math.random() < 0.5 ? 0 : 1;
    } else {
      turn = 1 - room.firstTurn;
    }
    room.currentTurn = turn;
    room.firstTurn = turn;
    io.to(roomId).emit("player_joined", {
      roomId,
      currentTurn: room.players[turn],
    });
    players[socket.id] = roomId;
  });

  // Handle game moves
  socket.on("make_move", (index) => {
    if (!players[socket.id]) {
      socket.emit("room_join_error", "You are not part of any room");
      return;
    }
    const roomId = players[socket.id];
    const room = rooms[roomId];
    if (room.players[room.currentTurn] !== socket.id) {
      socket.emit("game_message", "It is not your turn");
      return;
    }
    if (room.moves[index] !== undefined) {
      socket.emit("game_message", "Invalid move");
      return;
    }
    room.history.push(index);
    if (room.history.length === 7) {
      const toRemove = room.history.shift();
      room.moves[toRemove] = undefined;
    }
    room.moves[index] = room.currentTurn;
    const [winner, winningCondition] =
      checkWinner(room.moves, room.history) || [];
    room.currentTurn = 1 - room.currentTurn;
    io.to(roomId).emit("move_made", {
      currentTurn: room.players[room.currentTurn],
      lastMove: index,
      moves: room.moves.map((move) =>
        move === undefined ? undefined : move === room.firstTurn ? "X" : "O"
      ),
      winner:
        winner === 0
          ? room.players[0]
          : winner === 1
          ? room.players[1]
          : winner,
      winningCondition,
      nextRemove: room.history.length === 6 && room.history[0],
    });
  });

  socket.on("leave_room", () => {
    if (waitingPlayers.includes(socket)) {
      waitingPlayers.splice(waitingPlayers.indexOf(socket), 1);
    }
    leaveRoom(socket.id);
  });

  socket.on("play_again_request", () => {
    const roomId = players[socket.id];
    if (!roomId) {
      socket.emit("room_join_error", "You are not part of any room");
      return;
    }
    const room = rooms[roomId];
    if (room.players.length < 2) {
      socket.emit("game_message", "Opponent left the room");
      return;
    }

    if (room.players[0] === socket.id) {
      socket.to(room.players[1]).emit("play_again_request");
    } else {
      socket.to(room.players[0]).emit("play_again_request");
    }
  });

  socket.on("play_again_accept", () => {
    const roomId = players[socket.id];
    if (!roomId) {
      socket.emit("room_join_error", "You are not part of any room");
      return;
    }
    const room = rooms[roomId];
    if (room.players.length < 2) {
      socket.emit("game_message", "Opponent left the room");
      return;
    }
    room.moves = [];
    room.history = [];
    room.currentTurn = 1 - room.firstTurn;
    room.firstTurn = room.currentTurn;
    io.to(roomId).emit("player_joined", {
      roomId,
      currentTurn: rooms[roomId].players[room.firstTurn],
    });
  });

  // Disconnect handling
  socket.on("disconnect", () => {
    if (waitingPlayers.includes(socket)) {
      waitingPlayers.splice(waitingPlayers.indexOf(socket), 1);
      return;
    }
    toDisconnect.push(socket.id);
    setTimeout(() => {
      if (toDisconnect.includes(socket.id)) {
        leaveRoom(socket.id);
      }
    }, 3000);
  });
});

function checkWinner(moves, history) {
  if (history.length === 9) {
    return ["draw"];
  }
  if (history.length > 3) {
    const winningCondition = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let condition of winningCondition) {
      if (
        moves[condition[0]] !== undefined &&
        moves[condition[0]] === moves[condition[1]] &&
        moves[condition[1]] === moves[condition[2]]
      ) {
        return [moves[condition[0]], condition];
      }
    }
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
