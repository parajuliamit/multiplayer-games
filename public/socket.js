const socket = io();
// const socket = io("https://baghchaal.com");

const create_div = document.getElementById("create");
const wait_div = document.getElementById("waiting");
const create_error = document.getElementById("create_error");
const join_button = document.getElementById("join_button");
const join_error = document.getElementById("join_error");
const loading_div = document.getElementById("connecting");

const chat_div = document.getElementById("chat_feature");
const messageInput = document.getElementById("messageInput");

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
  chat_div.style.display = "none";
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

function createGame(event) {
  event?.preventDefault();
  create_error.innerText = "";
  join_error.innerText = "";
  const gameId = document.getElementById("create_room").value;
  if (gameId?.length !== 4) {
    create_error.innerText = "Room ID must be of 4 characters";
  } else {
    createRoom(gameId);
  }
}

function joinGame(event) {
  event?.preventDefault();
  create_error.innerText = "";
  join_error.innerText = "";
  const gameId = document.getElementById("join_room").value;
  if (gameId?.length !== 4) {
    join_error.innerText = "Room ID must be of 4 characters";
  } else {
    joinRoom(gameId);
  }
}

// Create a room
function createRoom(roomId) {
  if (socket.connected) {
    socket.emit("create_room", roomId);
    loading_div.style.display = "flex";
    create_div.style.display = "none";
  }
}

// Join a room
function joinRoom(roomId) {
  if (socket.connected) {
    socket.emit("join_room", roomId);
    create_div.style.display = "none";
    loading_div.style.display = "flex";
  }
}

// Make a move
function makeMove(index) {
  socket.emit("make_move", index);
}

let isSender = true; // Boolean to check if the sender is the current user

messageInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

// Send message function
function sendMessage() {
  const message = document.getElementById("messageInput").value;

  // Check if message is empty
  if (!message.trim()) return;

  // Emit the message to the server with the sender's socket.id and message
  socket.emit("send_message", {
    message: message,
  });

  // Clear the input field
  document.getElementById("messageInput").value = "";
}
// Listen for the 'receive_message' event from the server
socket.on("receive_message", function (data) {
  const messagesDiv = document.getElementById("messages");
  const messageElement = document.createElement("div");
  const sender = document.createElement("span");
  sender.style.fontSize = "0.8rem";
  // Check if the sender is the current user
  if (data.sender === socket.id) {
    // If the message is from the current user, show "You"
    sender.textContent = "You";
    sender.style.textAlign = "right";
    messageElement.textContent = data.message;
    messageElement.style.alignSelf = "flex-end"; // Align to the right
    messageElement.style.color = "white";
    messageElement.style.backgroundColor = "#007bff";
    messageElement.style.marginBottom = "5px";
    messageElement.style.padding = "5px";
    messageElement.style.borderRadius = "5px";
  } else {
    // If the message is from another user, show "Opponent"
    sender.textContent = "Opponent";
    sender.style.textAlign = "left";
    messageElement.textContent = data.message;
    messageElement.style.alignSelf = "flex-start"; // Align to the left
    messageElement.style.color = "black";
    messageElement.style.backgroundColor = "#7777";
    messageElement.style.marginBottom = "5px";
    messageElement.style.padding = "5px";
    messageElement.style.borderRadius = "5px";
  }

  // Append the message to the chat
  messagesDiv.appendChild(sender);
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
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
  chat_div.style.display = "flex";
  currentRoomId = roomId;
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
  chat_div.style.display = "none";
  info.style.display = "flex";
  game.style.display = "none";
  play_again_message.style.display = "none";
  create_div.style.display = "flex";
  join_error.innerText = "Disconnected from server";
  reconnect();
});

socket.on("connect", () => {
  console.log("Connected to server");
  join_error.innerText = "";
  loading_div.style.display = "none";
  create_div.style.display = "flex";
});

function reconnect() {
  setTimeout(() => {
    if (!socket.connected) {
      console.log("Reconnecting to server...");
      socket.connect();
      join_error.innerText = "Reconnecting to server...";
      if (!socket.connected) {
        reconnect();
      }
    }
  }, 2000);
}
