var User = require("../models/user");
var Assessment = require("../models/assessment");
var Submission = require("../models/submission");

module.exports = function (router) {
    var userRoute = router.route('/users/:id/user');
    var ret = {
    	"message":"OK",
    	"data":{}
    }
    var ObjectId = require('mongoose').Types.ObjectId;
    function isValidObjectId(id) {
        if (ObjectId.isValid(id)) {
            if ((String)(new ObjectId(id)) === id) {
                return true;
            }
        }
        return false;
    }
    function isValidRole(role) {
        return role == "student" || role == "mentor" || role == "admin";
    }

    // POST  || same as register, admin
    userRoute.post(async (req, res) => {
        var params = {
            "name":req.param("name"),
            "password":req.param("password"),
            "role":req.param("role"),
            // "assessments":req.param("assessments"),
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
        if (!isValidRole(params.role)) {
            ret.message = "ERROR";
            ret.data = "Invalid user role: " + params.role;
            res.json(404, ret);
            return router;  
        }


        // permission check
        await User.findById(id).then(async user => {
            if(user == null){
                // invalid user id
                res.status(404).send({
                    "message":"ERROR",
                    "data":"Invalid User Id"
                });
                return router;
            } 
            if (user.role == "student" || user.role == "mentor") {
                // permission deny
                res.status(403).send({
                    "message":"Forbidden",
                    "data":"Permission Deny"
                });
                return router;
            }
            if (user.role == "admin") {
                var new_user = new User(params);
                await new_user.save().then(new_user=>{
                    let show_user = {  // we shouldn't show user's password
                        "id": new_user._id,
                        "name": new_user.name,
                        "role": new_user.role,
                    }
                    res.status(201).send({
                        "message":"OK",
                        "data":show_user
                    });
                    return router;
                });
            }
        }).catch(error=>{
            console.log(error);
            ret.message = "ERROR";
            ret.data = "Invalid User Id";
            res.json(404, ret);
            return router;
        });
        
    });

	// PUT ||admin,  edit user, if prev is student, delete prev submission; if prev is mentor(role change(mentor -> stud/admin): delete assessments(we assume assessment must have a mentor)) + student.assessments + submissions
	userRoute.put(async function (req, res) {
        //  handle query
        var id = req.params.id;
        var target_user_id = req.query.id;
        if (typeof target_user_id === "undefined"){
            ret.message = "ERROR";
            ret.data = "Undefined target target_user_id";
            res.json(404, ret);
            return router;
        }
        if (!isValidObjectId(target_user_id)) {
            ret.message = "ERROR";
            ret.data = "Illegal target_user_id,(Id should be a single String of 12 bytes or a string of 24 hex characters)";
            res.json(404, ret);
            return router;
        }


        var params = {
            "name":req.query.name,
            "password":req.query.password,
            "role":req.query.role,
        };

        //validation
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
        if (!isValidRole(params.role)) {
            ret.message = "ERROR";
            ret.data = "Invalid user role: " + params.role;
            res.json(404, ret);
            return router;  
        }
        
        
        // permission check
        await User.findById(id).then(async user => {
            if(user == null){
                // invalid user id
                res.status(404).send({
                    "message":"ERROR",
                    "data":"Invalid User Id"
                });
                return router;
            } 
            if (user.role == "student" || user.role == "mentor") {
                // permission deny
                res.status(403).send({
                    "message":"Forbidden",
                    "data":"Permission Deny"
                });
                return router;
            }
            if (user.role == "admin") {

                
                await User.findById(target_user_id).then(async user => {
                    if (user == null) {
                        ret.message = "ERROR";
                        ret.data = "Invalid target User Id";
                        res.json(404, ret);
                        return router;
                    }
                    await User.findByIdAndUpdate(target_user_id, params, {"new":true}).then(()=>{
                        res.status(201).send({
                            "message":"OK",
                            "data": "finish PUT"
                        });
                    }).catch(err=>{console.log(err);});
                })

            }
        }).catch(error=>{
            console.log(error);
            ret.message = "ERROR";
            ret.data = "Invalid User Id";
            res.json(404, ret);
            return router;
        });


           
        return router;
	});


	// DELETE || admin, delete user, if student, delete prev submission; | if mentor, delete assessments+student.assessments + submissions
	userRoute.delete( async (req, res) => {
        var id = req.params.id;
        var target_user_id = req.query.id;
        if (typeof target_user_id === "undefined"){
            ret.message = "ERROR";
            ret.data = "Undefined target user id";
            // 404: Bad Request
            res.json(404, ret);
            return router;
        }

       
        // permission check
        await User.findById(id).then(async user => {
            if(user == null){
                // invalid user id
                res.status(404).send({
                    "message":"ERROR",
                    "data":"Invalid Account Id"
                });
                return router;
            } 
            if (user.role == "student" || user.role == "mentor") {
                // permission deny
                res.status(403).send({
                    "message":"Forbidden",
                    "data":"Permission Deny"
                });
                return router;
            }
            if (user.role == "admin") {
                await User.findById(target_user_id).then(async user => {
                    if (user == null) {
                        ret.message = "ERROR";
                        ret.data = "Invalid target user, id:" + target_user_id;
                        res.json(404, ret);
                        return router;
                    }

                    await User.findByIdAndRemove(target_user_id).then(()=>{
                        res.status(201).send({
                            "message":"OK",
                            "data": "finish delete"
                        });
                    }).catch(err=>{console.log(err);});
                })



            }
        }).catch(error=>{
            console.log(error);
            ret.message = "ERROR";
            ret.data = "Invalid Account Id";
            res.json(404, ret);
            return router;
        });


	});


    return router;
}

