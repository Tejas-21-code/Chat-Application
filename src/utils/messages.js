const generateMessage = (Username, text) => {
  return {
    Username,
    text,
    createdAt: new Date().getTime(),
  };
};

const generateLocationMessage = (Username, url) => {
  return {
    Username,
    url,
    createdAt: new Date().getTime(),
  };
};

module.exports = { generateMessage, generateLocationMessage };
