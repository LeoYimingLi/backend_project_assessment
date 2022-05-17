var User = require("../models/user");
var Assessment = require("../models/assessment");
var Submission = require("../models/submission");

module.exports = function (router) {
    var loginRoute = router.route("/login");
    var ret = {
    	"message":"OK",
    	"data":{}
    }
 
    // POST
    loginRoute.post(async (req, res) => {
        var params = {
            "name":req.param("name"),
            "password":req.param("password"),
        }

        // validation: Users cannot login  without a name or password.
        if (typeof params.name === "undefined"){
            ret.message = "ERROR";
            ret.data = "Undefined user name";
            // 404: Bad Request
            res.json(404, ret);
            return router;
        }
        if (typeof params.password === "undefined"){
            ret.message = "ERROR";
            ret.data = "Undefined user password";
            res.json(404, ret);
            return router;
        }

        await User.find({name: params.name}).then(user => {
            user = user[0];  // assume name won't duplicate
            if (user.password != params.password) {
                ret.message = "ERROR";
                ret.data = "password not match and fail to login";
                res.json(404, ret)
                return router;
            } else {
                ret.message = "OK";
                ret.data = "password match and login";
                res.json(200, ret);
                return router;
            }
        })        
        
    });

    return router;
}

