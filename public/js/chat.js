const socket = io();
const messageForm = document.querySelector("#message-form");
const messageInput = document.querySelector(".message-input");
const buttonSubmit = messageForm.querySelector("button");
const buttonLocation = document.querySelector("#send-location");
const messages = document.querySelector("#messages");
const messagesTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
const chatSidebar = document.querySelector(".chat__sidebar");

const data = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
  const newMessage = messages.lastElementChild;
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;
  const visibleHeight = messages.offsetHeight;
  const containerHeight = messages.scrollHeight;
  const scrollOffset = messages.scrollTop + visibleHeight;
  if (containerHeight - newMessageHeight <= scrollOffset) {
  messages.scrollTop = messages.scrollHeight;
  }
};

socket.on("locationmessage", ({ Username, url, createdAt }) => {
  console.log();

  const html = Mustache.render(locationTemplate, {
    Username,
    url,
    createdAt: moment(createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});
socket.on("message", ({ Username, createdAt, text }) => {
  // console.log(message);
  const html = Mustache.render(messagesTemplate, {
    Username,
    message: text,
    createdAt: moment(createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});
socket.on("roomData", (data) => {
  // console.log(data);
  const html = Mustache.render(sidebarTemplate, data);
  chatSidebar.innerHTML = html;
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  buttonSubmit.setAttribute("disabled", "disabled");

  const message = messageInput.value;

  socket.emit("sendMessage", message, (error) => {
    buttonSubmit.removeAttribute("disabled");
    messageInput.value = "";
    messageInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log("Message Delivered");
  });
});

buttonLocation.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Your browser does not support geolocation");
  }

  buttonLocation.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(
    ({ coords: { latitude, longitude } }) => {
      // console.log(position);
      socket.emit(
        "sendLocation",
        {
          latitude,
          longitude,
        },
        (message) => {
          buttonLocation.removeAttribute("disabled");
          console.log(message);
        }
      );
    }
  );
});

socket.emit("join", data, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
