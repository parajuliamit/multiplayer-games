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
app.use(express.static("public"));

const rooms = {};
const players = {};

io.on("connection", (socket) => {
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
    // const roomId = Math.random().toString(36).substring(7);
    leaveRoom(socket.id);
    socket.join(roomId);
    rooms[roomId] = {
      players: [socket.id],
      moves: [],
    };
    players[socket.id] = roomId;
    socket.emit("room_created", roomId);
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
    if (!rooms[roomId]) {
      socket.emit("room_join_error", `Room with ID ${roomId} does not exist`);
      return;
    }
    if (rooms[roomId].players.length >= 2) {
      socket.emit("room_join_error", `Room with ID ${roomId} is full`);
      return;
    }
    leaveRoom(socket.id);
    socket.join(roomId);
    rooms[roomId].players.push(socket.id);
    rooms[roomId].moves = [];
    let turn;
    if (rooms[roomId].firstTurn === undefined) {
      turn = Math.random() < 0.5 ? 0 : 1;
    } else {
      turn = 1 - rooms[roomId].firstTurn;
    }
    rooms[roomId].currentTurn = turn;
    rooms[roomId].firstTurn = turn;
    io.to(roomId).emit("player_joined", {
      roomId,
      currentTurn: rooms[roomId].players[turn],
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
    room.moves[index] = room.currentTurn;
    const winner = checkWhinner(room.moves);
    room.currentTurn = 1 - room.currentTurn;
    io.to(roomId).emit("move_made", {
      currentTurn: room.players[room.currentTurn],
      moves: room.moves.map((move) =>
        move === undefined ? undefined : move === room.firstTurn ? "X" : "O"
      ),
      winner:
        winner === 0
          ? room.players[0]
          : winner === 1
          ? room.players[1]
          : winner,
    });
  });

  socket.on("leave_room", () => {
    leaveRoom(socket.id);
  });

  // Disconnect handling
  socket.on("disconnect", () => {
    leaveRoom(socket.id);
  });
});

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

function checkWhinner(moves) {
  if (moves.length > 3) {
    for (let condition of winningCondition) {
      if (
        moves[condition[0]] !== undefined &&
        moves[condition[0]] === moves[condition[1]] &&
        moves[condition[1]] === moves[condition[2]]
      ) {
        return moves[condition[0]];
      }
    }
  }
  let filled = 0;
  for (let move of moves) {
    if (move !== undefined) {
      filled++;
    }
  }
  if (filled === 9) {
    return "draw";
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
