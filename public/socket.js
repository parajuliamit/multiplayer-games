const socket = io("https://local.amitparajuli.com.np");

const create_button = document.getElementById("create_button");
const create_div = document.getElementById("create");
const wait_div = document.getElementById("waiting");
const create_error = document.getElementById("create_error");
const join_button = document.getElementById("join_button");
const join_error = document.getElementById("join_error");
const loading_div = document.getElementById("connecting");

function exitGame() {
  socket.emit("leave_room");
  create_div.style.display = "flex";
  wait_div.style.display = "none";
  info.style.display = "flex";
  game.style.display = "none";
  loading_div.style.display = "none";
}

create_button.addEventListener("click", () => {
  create_error.innerText = "";
  join_error.innerText = "";
  const gameId = document.getElementById("create_room").value;
  if (gameId?.length !== 4) {
    create_error.innerText = "Room ID must be of 4 characters";
  } else {
    createRoom(gameId);
  }
});

join_button.addEventListener("click", () => {
  create_error.innerText = "";
  join_error.innerText = "";
  const gameId = document.getElementById("join_room").value;
  if (gameId?.length !== 4) {
    join_error.innerText = "Room ID must be of 4 characters";
  } else {
    joinRoom(gameId);
  }
});

// Create a room
function createRoom(roomId) {
  socket.emit("create_room", roomId);
  loading_div.style.display = "flex";
  create_div.style.display = "none";
}

// Join a room
function joinRoom(roomId) {
  socket.emit("join_room", roomId);
  create_div.style.display = "none";
  loading_div.style.display = "flex";
}

// Make a move
function makeMove(index) {
  socket.emit("make_move", index);
}

// Listen for game events
socket.on("room_created", (roomId) => {
  console.log("Room created with ID:", roomId);
  loading_div.style.display = "none";
  wait_div.style.display = "flex";
  document.getElementById("roomIdText").innerText = roomId;
});

socket.on("room_create_error", (message) => {
  console.log("Room create error:", message);
  loading_div.style.display = "none";
  create_error.innerText = message;
  create_div.style.display = "flex";
});

socket.on("room_join_error", (message) => {
  console.log("Room join error:", message);
  loading_div.style.display = "none";
  join_error.innerText = message;
  create_div.style.display = "flex";
});

socket.on("player_joined", ({ roomId, currentTurn }) => {
  info.style.display = "none";
  game.style.display = "flex";
  reset(currentTurn === socket.id);
  console.log("Player joined room:", roomId);
});

socket.on("player_left", (roomId) => {
  console.log("Player left room:", roomId);
  loading_div.style.display = "none";
  wait_div.style.display = "flex";
  info.style.display = "flex";
  game.style.display = "none";
  document.getElementById("roomIdText").innerText = roomId;
});

socket.on("move_made", (result) => {
  console.log("Move: ", result);
  let winner = null;
  if (result.winner) {
    winner =
      result.winner === "draw"
        ? "DRAW :/"
        : result.winner === socket.id
        ? "You Won !!"
        : "Opponent Won :(";
  }
  updateMoveData(result.currentTurn === socket.id, result.moves, winner);
});
