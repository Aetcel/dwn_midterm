const dbQueries = {
  getAllUsers: "SELECT * FROM users",
  getUserById: "SELECT * FROM users WHERE id = ?",
  createUser: "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
};

module.exports.usersDbQueries = dbQueries;
