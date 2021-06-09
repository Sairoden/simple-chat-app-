const socket = io();

const messageForm = document.getElementById("message-form");
const messageFormInput = document.querySelector("input");
const messageFormButton = document.querySelector("button");
const sendLocationButton = document.getElementById("send-location");
const messages = document.getElementById("messages");

// Templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationMessageTemplate = document.getElementById(
  "location-message-template"
).innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.emit();

socket.on("message", message => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", message => {
  console.log(message);
  const html = Mustache.render(locationMessageTemplate, {
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
});

messageForm.addEventListener("submit", e => {
  e.preventDefault();
  // disable

  messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, error => {
    messageFormButton.removeAttribute("disabled");
    messageFormInput.value = "";
    messageFormInput.focus();

    // enable
    if (error) return console.log(error);

    console.log("Message delivered!");
  });
});

sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation)
    return alert("Geolocation is not supported by your browser 😢");

  sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(success, () =>
    alert("Unable to retrieve your location")
  );
});

const success = position => {
  console.log(position);
  socket.emit(
    "sendLocation",
    {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    },
    () => {
      sendLocationButton.removeAttribute("disabled");
      console.log("location shared!");
    }
  );
};

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
