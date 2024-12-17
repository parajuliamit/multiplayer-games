const socket = io();
// const socket = io("https://baghchaal.com");

const create_div = document.getElementById("create");
const wait_div = document.getElementById("waiting");
const create_error = document.getElementById("create_error");
const join_button = document.getElementById("join_button");
const join_error = document.getElementById("join_error");
const loading_div = document.getElementById("connecting");

const info_div = document.getElementById("container");
const game_chat_div = document.getElementById("game_chat");
const messageInput = document.getElementById("messageInput");

const win = document.getElementById("win");
const loss = document.getElementById("loss");

function exitGame() {
  if (!confirm("Are you sure you want to leave the game?")) {
    return;
  }
  socket.emit("leave_room");
  create_div.style.display = "flex";
  wait_div.style.display = "none";
  info_div.style.display = "flex";
  game_chat_div.style.display = "none";
  loading_div.style.display = "none";
  play_again_message.style.display = "none";
}

function playAgain() {
  info_div.style.display = "flex";
  loading_div.style.display = "flex";
  if (play_again_message.style.display === "flex") {
    play_again_message.style.display = "none";
    socket.emit("play_again_accept");
  } else {
    socket.emit("play_again_request");
    create_div.style.display = "none";
    game_chat_div.style.display = "none";
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
    win.innerText = 0;
    loss.innerText = 0;
  }
}

// Join a room
function joinRoom(roomId) {
  if (socket.connected) {
    socket.emit("join_room", roomId);
    create_div.style.display = "none";
    loading_div.style.display = "flex";
    win.innerText = 0;
    loss.innerText = 0;
  }
}

// Make a move
function makeMove(index) {
  socket.emit("make_move", index);
}

// Send message functionality
messageInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

function sendMessage() {
  const message = document.getElementById("messageInput").value;
  // Check if message is empty
  if (!message.trim()) return;
  socket.emit("send_message", {
    message: message.trim(),
  });
  addMessage(message.trim(), true);
  // Clear the input field
  document.getElementById("messageInput").value = "";
}

// Listen for the 'receive_message' event from the server
socket.on("receive_message", function (data) {
  // Only add the message if it is from other user
  const self = data.sender === socket.id;
  if (!self) addMessage(data.message, data.sender === socket.id);
});

function addMessage(message, self) {
  const messagesDiv = document.getElementById("messages");
  const messageElement = document.createElement("div");
  const sender = document.createElement("span");
  sender.className = "sender";
  messageElement.textContent = message;

  if (self) {
    sender.textContent = "You";
    sender.style.textAlign = "right";
    messageElement.className = "message self";
  } else {
    sender.textContent = "Other";
    sender.style.textAlign = "left";
    messageElement.className = "message other";
  }

  // Append the message to the chat
  messagesDiv.appendChild(sender);
  messagesDiv.appendChild(messageElement);
  // scroll to bottom
  const chatDiv = document.getElementById("chat");
  chatDiv.scrollTop = chatDiv.scrollHeight;
}

// Listen for game events
socket.on("room_created", (roomId) => {
  loading_div.style.display = "none";
  wait_div.style.display = "flex";
  document.getElementById("roomIdText").innerText = roomId;
});

socket.on("waiting_opponent", (roomId) => {
  loading_div.style.display = "none";
  wait_div.style.display = "flex";
  document.getElementById("roomIdText").innerText = roomId;
});

socket.on("play_again_request", () => {
  play_again_message.style.display = "flex";
});

socket.on("room_create_error", (message) => {
  loading_div.style.display = "none";
  create_error.innerText = message;
  create_div.style.display = "flex";
});

socket.on("room_join_error", (message) => {
  loading_div.style.display = "none";
  join_error.innerText = message;
  create_div.style.display = "flex";
});

socket.on("player_joined", ({ roomId, currentTurn }) => {
  info_div.style.display = "none";
  game_chat_div.style.display = "flex";
  play_again.style.display = "none";
  reset(currentTurn === socket.id);
  currentRoomId = roomId;
});

socket.on("player_left", (roomId) => {
  loading_div.style.display = "none";
  wait_div.style.display = "flex";
  info_div.style.display = "flex";
  game_chat_div.style.display = "none";
  document.getElementById("roomIdText").innerText = roomId;
});

socket.on("move_made", (result) => {
  let winner = null;
  if (result.winner) {
    if (result.winner === "draw") {
      winner = "DRAW :/";
    } else if (result.winner === socket.id) {
      winner = "You Won :)";
      win.innerText = parseInt(win.innerText) + 1;
    } else {
      winner = "Opponent Won :(";
      loss.innerText = parseInt(loss.innerText) + 1;
    }
    play_again.style.display = "block";
  }
  updateMoveData(
    result.currentTurn === socket.id,
    result.moves,
    winner,
    result.nextRemove,
    result.lastMove,
    result.winningCondition
  );
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
  loading_div.style.display = "none";
  wait_div.style.display = "none";
  info_div.style.display = "flex";
  game_chat_div.style.display = "none";
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
