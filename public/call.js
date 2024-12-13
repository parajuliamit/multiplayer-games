// Start Call
// add call feature div

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

const callDiv = document.getElementById("call_feature");

const acceptCallButton = document.getElementById("acceptCallButton");
const cancelCallButton = document.getElementById("cancelCallButton");
const startCallButton = document.getElementById("startCallButton");
const callInfo = document.getElementById("callInfo");

const config = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

let localStream;
let peerConnection;

let callData;

// Accept call
acceptCallButton.onclick = async () => {
  await askUserPermission();
  if (!peerConnection) createPeerConnection();
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(callData)
  );
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  callDiv.style.display = "flex";
  socket.emit("answer", peerConnection.localDescription);
  acceptCallButton.style.display = "none";
  callInfo.innerText = "Call connected";
};

// Cancel call
cancelCallButton.onclick = () => {
  socket.emit("cancel-call");
};

// Get media stream
async function askUserPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStream = stream;
    localVideo.srcObject = stream;
  } catch (error) {
    console.error("Error accessing media devices:", error);
  }
}
// Create PeerConnection
socket.on("offer", async (data) => {
  acceptCallButton.style.display = "block";
  cancelCallButton.style.display = "block";
  startCallButton.style.display = "none";
  callData = data;
  callInfo.innerText = "Incoming call";
});

socket.on("answer", async (data) => {
  if (!peerConnection) createPeerConnection();
  await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
  callInfo.innerText = "Call connected";
});

socket.on("ice-candidate", (data) => {
  if (peerConnection) {
    peerConnection.addIceCandidate(new RTCIceCandidate(data));
  }
});

function createPeerConnection() {
  console.log("Inside Create Peer Connection");
  peerConnection = new RTCPeerConnection(config);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate);
    }
  };

  peerConnection.ontrack = (event) => {
    console.log(event.streams);
    if (!remoteVideo.srcObject) {
      remoteVideo.srcObject = event.streams[0];
      console.log("Remote video srcObject set:", remoteVideo.srcObject);
    }
  };

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });
}

remoteVideo.onloadedmetadata = () => {
  console.log("Metadata loaded, starting playback");
  remoteVideo.play().catch((error) => {
    console.error("Error starting remote video playback:", error);
  });
};

// Initiate call
async function startCall() {
  await askUserPermission();
  callDiv.style.display = "flex";
  startCallButton.style.display = "none";
  cancelCallButton.style.display = "block";
  callInfo.innerText = "Calling...";
  console.log("Call Started");
  if (!peerConnection) createPeerConnection();
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("offer", peerConnection.localDescription);
}

socket.on("call-cancelled", () => {
  console.log("Call cancelled");
  callDiv.style.display = "none";
  acceptCallButton.style.display = "none";
  cancelCallButton.style.display = "none";
  startCallButton.style.display = "block";
  localStream?.getTracks().forEach((track) => track.stop());
  localVideo.srcObject = null;
  remoteVideo.srcObject = null;
  callInfo.innerText = "";
  callData = null;
  peerConnection?.close();
  peerConnection = null;
});
