/*
 * Connect all of your endpoints together here.
 */
module.exports = function (app, router) {
    app.use("/api", require("./home.js")(router));
    
    app.use("/api/register", require("./register.js")(router));
    app.use("/api/login", require("./login.js")(router));
    
    app.use("/api/users/:id/assessment", require("./assessment.js")(router));
    app.use("/api/users/:id/submission", require("./submission.js")(router));
    app.use("/api/users/:id/user", require("./user.js")(router));
    
};
