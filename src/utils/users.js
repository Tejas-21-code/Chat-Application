const users = [];

const addUser = ({ id, Username, Room }) => {
  Username = Username.trim().toLowerCase();
  Room = Room.trim().toLowerCase();

  if (!Username || !Room) {
    return {
      error: "Username and Room is required",
    };
  }

  const existingUser = users.find((user) => {
    return user.Room === Room && user.Username === Username;
  });

  if (existingUser) {
    return {
      error: "Username is already taken",
    };
  }

  const user = {
    id,
    Username,
    Room,
  };
  users.push(user);
  return {
    user,
  };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  return users.splice(index, 1)[0];
};
const getUser = (id) => {
  const user = users.find((user) => user.id === id);

  if (!user) return undefined;

  return user;
};

const getUserInRoom = (Room) => {
  return users.filter((user) => {
    return user.Room === Room.trim().toLowerCase();
  });
};

module.exports = {
  getUser,
  getUserInRoom,
  addUser,
  removeUser,
};
