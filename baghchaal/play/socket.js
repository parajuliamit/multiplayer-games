let socket;

const statusDiv = document.getElementById("status");
const currentStatus = document.getElementById("currentStatus");

const waitingOtherDiv = document.getElementById("waiting");
const roomIdText = document.getElementById("roomIdText");

const loadingDiv = document.getElementById("connecting");
const loadingMessage = document.getElementById("loadingMessage");

const gameInfoDiv = document.getElementById("container");
const gameDiv = document.getElementById("game_title");

const turn = document.getElementById("turn");
const goatImage = document.getElementById("goatImage");
const tigerImage = document.getElementById("tigerImage");

const goatsAvailableDiv = document.getElementById("available");
const goatsAliveDiv = document.getElementById("alive");
const goatsKilledDiv = document.getElementById("killed");
const trappedDiv = document.getElementById("trapped");

// const messageInput = document.getElementById("messageInput");

const win = document.getElementById("win");
const loss = document.getElementById("loss");
// const playAgainMessage = document.getElementById("play_again_message");
// const playAgainButton = document.getElementById("play_again");

const quickMessage = document.querySelectorAll(".reaction p");

for (let i = 0; i < quickMessage.length; i++) {
  quickMessage[i].addEventListener("click", function () {
    sendQuickMessage(quickMessage[i].innerText);
  });
}

// let isPlayAgainRequested = false;
// let youRequestedPlayAgain = false;

function exitGame() {
  if (!confirm("Are you sure you want to leave the game?")) {
    return;
  }
  window.location.href = "/baghchaal/";
}

function startGame(room, role) {
  socket = io("https://api.baghchaal.com");

  socket.on("connect", () => {
    statusDiv.style.color = "green";
    currentStatus.innerText = "Connected";
    if (room === "create") {
      createGame(role);
    } else if (room === "random") {
      joinRandomGame(role);
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
    showLoading("Looking for an opponent...");
  });

  socket.on("player_joined", (roomInfo) => {
    hideEverything();
    gameInfoDiv.style.display = "none";
    gameDiv.style.display = "flex";
    const myTurn = roomInfo.currentTurn.player === socket.id;
    resetGame(
      roomInfo.board,
      roomInfo.currentTurn.piece,
      myTurn,
      roomInfo.goatRemaining
    );
    updateMoveData(roomInfo, myTurn);
    // if (youRequestedPlayAgain || isPlayAgainRequested) {
    //   youRequestedPlayAgain = false;
    //   isPlayAgainRequested = false;
    // } else {
    //   win.innerText = 0;
    //   loss.innerText = 0;
    // }
  });

  socket.on("room_join_error", (error) => {
    window.location.href = `/baghchaal?error=${error}`;
  });

  socket.on("player_left", () => {
    window.location.href = `/baghchaal?error=Opponent left the game`;
  });

  socket.on("move_made", (roomInfo) => {
    const myTurn = roomInfo.currentTurn.player === socket.id;
    updateMoveData(roomInfo, myTurn);
    moveMade(
      roomInfo.board,
      roomInfo.move,
      roomInfo.currentTurn.piece,
      myTurn,
      roomInfo.goatRemaining,
      roomInfo.winner
    );
    if (roomInfo.winner) {
      const playAgainButton = document.getElementById("playAgainButton");
      playAgainButton.style.display = "block";
      playAgainButton.addEventListener("click", () => {
        window.location.href = "/baghchaal/";
      });
    }
  });

  // socket.on("play_again_request", () => {
  //   if (youRequestedPlayAgain) {
  //     socket.emit("play_again_accept");
  //   } else {
  //     playAgainMessage.style.display = "flex";
  //     playAgainMessage.innerText = "Opponent requested to play again.";
  //     isPlayAgainRequested = true;
  //   }
  // });

  socket.on("disconnect", () => {
    statusDiv.style.color = "red";
    currentStatus.innerText = "Disconnected";
    gameInfoDiv.style.display = "flex";
    gameDiv.style.display = "none";
    hideEverything();
    showLoading("Reconnecting...");
    setTimeout(() => {
      if (socket.disconnected) {
        window.location.href = "/baghchaal?error=Trouble connecting to server";
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
  loadingDiv.style.display = "flex";
  loadingMessage.innerText = message;
}

function hideEverything() {
  loadingDiv.style.display = "none";
  loadingMessage.innerText = "";
  waitingOtherDiv.style.display = "none";
  roomIdText.innerText = "";
}

function createGame(role) {
  socket.emit("create_room", role);
  showLoading("Creating room...");
}

function joinRandomGame(role) {
  socket.emit("random_match", role);
  showLoading("Looking for an opponent...");
}

function joinRoom(roomId) {
  socket.emit("join_room", roomId);
  showLoading("Joining room...");
}

function updateMoveData(roomInfo, myTurn) {
  goatsAvailableDiv.innerText = roomInfo.goatRemaining;
  goatsKilledDiv.innerText = roomInfo.goatCaptured;
  goatsAliveDiv.innerText = roomInfo.goatAlive;
  trappedDiv.innerText = roomInfo.tigerTrapped;
  setTurn(myTurn, roomInfo.currentTurn.piece);
}

function setTurn(isYourTurn, piece) {
  if (isYourTurn) {
    turn.innerText = "Your Turn";
  } else {
    turn.innerText = "Opponent's Turn";
  }
  if (piece === "goat") {
    goatImage.style.display = "block";
    tigerImage.style.display = "none";
  } else {
    goatImage.style.display = "none";
    tigerImage.style.display = "block";
  }
}

// function playAgain() {
//   playAgainButton.style.display = "none";
//   if (isPlayAgainRequested) {
//     playAgainMessage.style.display = "none";
//     socket.emit("play_again_accept");
//   } else {
//     youRequestedPlayAgain = true;
//     playAgainMessage.style.display = "flex";
//     playAgainMessage.innerText = "Waiting for opponent to accept...";
//     socket.emit("play_again_request");
//   }
// }

// Make a move
function makeMove(data) {
  socket.emit("make_move", data);
}

// Message Related Code

// messageInput.addEventListener("keypress", (event) => {
//   if (event.key === "Enter") {
//     sendMessage();
//   }
// });

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
