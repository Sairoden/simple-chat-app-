const socket = io();

socket.on("message", message => {
  console.log(message);
});

const messageForm = document.getElementById("message-form");

messageForm.addEventListener("submit", e => {
  e.preventDefault();

  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message);
});

const sendLocation = document.getElementById("send-location");

sendLocation.addEventListener("click", () => {
  if (!navigator.geolocation)
    return alert("Geolocation is not supported by your browser 😢");

  navigator.geolocation.getCurrentPosition(success, () =>
    alert("Unable to retrieve your location")
  );
});

const success = position => {
  console.log(position);
  socket.emit("sendLocation", {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  });
};
