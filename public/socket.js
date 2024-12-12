const socket = io("https://baghchaal.com");

const create_button = document.getElementById("create_button");
const create_div = document.getElementById("create");
const wait_div = document.getElementById("waiting");
const create_error = document.getElementById("create_error");
const join_button = document.getElementById("join_button");
const join_error = document.getElementById("join_error");
const loading_div = document.getElementById("connecting");

function exitGame() {
  if (!confirm("Are you sure you want to leave the game?")) {
    return;
  }
  socket.emit("leave_room");
  create_div.style.display = "flex";
  wait_div.style.display = "none";
  info.style.display = "flex";
  game.style.display = "none";
  loading_div.style.display = "none";
  play_again_message.style.display = "none";
}

function playAgain() {
  info.style.display = "flex";
  loading_div.style.display = "flex";
  if (play_again_message.style.display === "flex") {
    play_again_message.style.display = "none";
    socket.emit("play_again_accept");
  } else {
    socket.emit("play_again_request");
    create_div.style.display = "none";
    game.style.display = "none";
  }
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

let isSender = true; // Boolean to check if the sender is the current user

// Send message function
function send_message() {
  const message = document.getElementById("message").value;

  // Check if message is empty
  if (!message.trim()) return;

  const senderId = socket.id; // Use socket.id to identify the sender
  // set room id from here
  roomId = document.getElementById("roomIdText").innerText;

  // Emit the message to the server with the sender's socket.id and message
  socket.emit("send_message", {
    sender: senderId,
    message: message,
    roomId: roomId,
  });

  // Clear the input field
  document.getElementById("message").value = "";
}
// Listen for the 'receive_message' event from the server
socket.on("receive_message", function (data) {
  const messagesDiv = document.getElementById("messages");
  const messageElement = document.createElement("div");

  // Check if the sender is the current user
  if (data.sender === socket.id) {
    // If the message is from the current user, show "You"
    messageElement.textContent = `You: ${data.message}`;
    messageElement.style.alignSelf = "flex-end"; // Align to the right
  } else {
    // If the message is from another user, show their socket.id (or custom name)
    messageElement.textContent = `${data.sender}: ${data.message}`;
    messageElement.style.alignSelf = "flex-start"; // Align to the left
  }

  // Append the message to the chat
  messagesDiv.appendChild(messageElement);
});

// Listen for game events
socket.on("room_created", (roomId) => {
  console.log("Room created with ID:", roomId);
  loading_div.style.display = "none";
  wait_div.style.display = "flex";
  document.getElementById("roomIdText").innerText = roomId;
});

socket.on("waiting_opponent", (roomId) => {
  console.log("Waiting in room with ID:", roomId);
  loading_div.style.display = "none";
  wait_div.style.display = "flex";
  document.getElementById("roomIdText").innerText = roomId;
});

socket.on("play_again_request", () => {
  console.log("Play again requested");
  play_again_message.style.display = "flex";
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
  play_again.style.display = "none";
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
    play_again.style.display = "block";
  }
  updateMoveData(result.currentTurn === socket.id, result.moves, winner);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
  loading_div.style.display = "none";
  wait_div.style.display = "none";
  info.style.display = "flex";
  game.style.display = "none";
  play_again_message.style.display = "none";
  create_div.style.display = "flex";
  join_error.innerText = "Disconnected from server";
  socket.connect();
});
