let socket;

const statusDiv = document.getElementById("status");
const currentStatus = document.getElementById("currentStatus");

const waitingOtherDiv = document.getElementById("waiting");
const roomIdText = document.getElementById("roomIdText");

const loadingDiv = document.getElementById("connecting");
const loadingMessage = document.getElementById("loadingMessage");

const gameInfoDiv = document.getElementById("container");
const gameDiv = document.getElementById("game_chat");

const messageInput = document.getElementById("messageInput");

const win = document.getElementById("win");
const loss = document.getElementById("loss");
const playAgainMessage = document.getElementById("play_again_message");
const playAgainButton = document.getElementById("play_again");

const quickMessage = document.querySelectorAll(".reaction p");

for (let i = 0; i < quickMessage.length; i++) {
  quickMessage[i].addEventListener("click", function () {
    sendQuickMessage(quickMessage[i].innerText);
  });
}

let isPlayAgainRequested = false;
let youRequestedPlayAgain = false;

function exitGame() {
  if (!confirm("Are you sure you want to leave the game?")) {
    return;
  }
  window.location.href = "/tictactoe/";
}

function startGame(room) {
  socket = io("https://api.baghchaal.com");

  socket.on("connect", () => {
    statusDiv.style.color = "green";
    currentStatus.innerText = "Connected";
    if (!room) {
      createGame();
    } else if (room === "random") {
      joinRandomGame();
    } else {
      joinRoom(room);
    }
  });

  socket.on("room_created", (roomId) => {
    hideEverything();
    waitingOtherDiv.style.display = "flex";
    roomIdText.innerText = roomId;
  });

  socket.on("waiting_match", () => {
    showLoading("Looking for a opponent...");
  });

  socket.on("player_joined", ({ currentTurn }) => {
    hideEverything();
    gameInfoDiv.style.display = "none";
    gameDiv.style.display = "flex";
    reset(currentTurn === socket.id);
    if (youRequestedPlayAgain || isPlayAgainRequested) {
      youRequestedPlayAgain = false;
      isPlayAgainRequested = false;
    } else {
      win.innerText = 0;
      loss.innerText = 0;
    }
  });

  socket.on("room_join_error", (error) => {
    window.location.href = `/tictactoe?error=${error}`;
  });

  socket.on("player_left", (roomId) => {
    hideEverything();
    waitingOtherDiv.style.display = "flex";
    roomIdText.innerText = roomId;
    gameInfoDiv.style.display = "flex";
    gameDiv.style.display = "none";
  });

  socket.on("move_made", (result) => {
    let winner = null;
    if (result.winner) {
      if (result.winner === socket.id) {
        winner = "You Won :)";
        win.innerText = parseInt(win.innerText) + 1;
      } else {
        winner = "Opponent Won :(";
        loss.innerText = parseInt(loss.innerText) + 1;
      }
      playAgainButton.style.display = "block";
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

  socket.on("play_again_request", () => {
    if (youRequestedPlayAgain) {
      socket.emit("play_again_accept");
    } else {
      playAgainMessage.style.display = "flex";
      playAgainMessage.innerText = "Opponent requested to play again.";
      isPlayAgainRequested = true;
    }
  });

  socket.on("disconnect", () => {
    statusDiv.style.color = "red";
    currentStatus.innerText = "Disconnected";
    gameInfoDiv.style.display = "flex";
    gameDiv.style.display = "none";
    hideEverything();
    showLoading("Reconnecting...");
    setTimeout(() => {
      if (socket.disconnected) {
        window.location.href = "/tictactoe?error=Trouble connecting to server";
      }
    }, 5000);
  });

  socket.on("receive_message", function (data) {
    if (data.sender !== socket.id) {
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.textContent = data.message;

      document.body.appendChild(bubble);

      setTimeout(() => {
        bubble.remove();
      }, 3000);
      addMessage(data.message, false);
    }
  });
}

function showLoading(message) {
  hideEverything();
  loadingDiv.style.display = "block";
  loadingMessage.innerText = message;
}

function hideEverything() {
  playAgainMessage.style.display = "none";
  loadingDiv.style.display = "none";
  loadingMessage.innerText = "";
  waitingOtherDiv.style.display = "none";
  roomIdText.innerText = "";
}

function createGame() {
  socket.emit("create_room");
  showLoading("Creating room...");
}

function joinRandomGame() {
  socket.emit("random_match");
  showLoading("Looking for a opponent...");
}

function joinRoom(roomId) {
  socket.emit("join_room", roomId);
  showLoading("Joining room...");
}

function playAgain() {
  playAgainButton.style.display = "none";
  if (isPlayAgainRequested) {
    playAgainMessage.style.display = "none";
    socket.emit("play_again_accept");
  } else {
    youRequestedPlayAgain = true;
    playAgainMessage.style.display = "flex";
    playAgainMessage.innerText = "Waiting for opponent to accept...";
    socket.emit("play_again_request");
  }
}

// Make a move
function makeMove(index) {
  socket.emit("make_move", index);
}

// Message Related Code

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

function sendQuickMessage(message) {
  socket.emit("send_message", {
    message,
  });
  addMessage(message, true);
}

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
    sender.textContent = "Opponent";
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
