var User = require("../models/user");
var Assessment = require("../models/assessment");
var Submission = require("../models/submission");

module.exports = function (router) {
    var registerRoute = router.route("/register");
    var ret = {
    	"message":"OK",
    	"data":{}
    }
 
    // POST
    registerRoute.post(async (req, res) => {
        var params = {
            "name":req.param("name"),
            "password":req.param("password"),
            "role":req.param("role"),
        }

        // validation: Users cannot be created (or updated) without a name or password or role.
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
        if (typeof params.role === "undefined"){
            ret.message = "ERROR";
            ret.data = "Undefined user role";
            res.json(404, ret);
            return router;
        }
        if (params.role != "student" && params.role != "mentor" && params.role != "admin") {
            ret.message = "ERROR";
            ret.data = "incorrect user role:" + params.role;
            res.json(404, ret);
            return router;
        }

        var new_user = new User(params);
        await new_user.save().then(new_user=>{
            let show_user = {  // we shouldn't show user's password
                "id": new_user._id,
                "name": new_user.name,
                "role": new_user.role,
            }
            res.status(201).send({
                "message":"OK",
                "data": show_user  
            });
            return router;
        });
    });

    return router;
}

