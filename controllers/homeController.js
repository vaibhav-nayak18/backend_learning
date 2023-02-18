const home = (req, res) => {
  res.status(200).json({
    success: true,
    greetings: "hello from API",
  });
};

const dummy = (req, res) => {
  res.status(200).json({
    success: true,
    greetings: "dummy",
  });
};
export { home, dummy };
