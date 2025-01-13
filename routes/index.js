const users = require("./users");

const routes = (app) => {
    app.set("views", __dirname + "/views");
    app.use("/users", users);
}

module.exports = routes;
