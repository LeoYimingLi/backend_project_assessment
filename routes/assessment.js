var User = require("../models/user");
var Assessment = require("../models/assessment");
var Submission = require("../models/submission");


module.exports = function (router) {
    var assessmentRoute = router.route("/users/:id/assessment");
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
    function isValidDate(date_string) {
        if (date_string === "") {  // allowed to be null
            return true;
        }
        date = new Date(date_string);
        return date instanceof Date && !isNaN(date.getTime());
    }
    
    //GET, show submissions
    assessmentRoute.get(async (req, res) => {
        var id = req.params.id; // we assume id won't be wrong here
        
        // role match: mentor/admin/ad
        await User.findById(id).then(async user => {
            if(user == null){
                // invalid user id
                res.status(404).send({
                    "message":"ERROR",
                    "data":"Invalid Account Id"
                });
                return router;
            } 
            if (user.role == "student") {
                await Submission.find({student: id}).then(submissions => {
                    res.end(JSON.stringify(submissions, null, 4));
                    return router;
                })
                return router;
                
            }
            if (user.role == "mentor" || user.role == "admin") {
                await Submission.find().then(submissions => {
                    res.end(JSON.stringify(submissions, null, 4));  // value, replacer, space/indence
                    return router;
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
 
    // POST, add assessment by mentor/admin
    assessmentRoute.post(async (req, res) => {
        var id = req.params.id; 
        var params = {
            "title":req.param("title"),
            "description":req.param("description"),
            "mentor":req.param("mentor"),
            "dateCreated": req.param("dateCreated"),
            "deadline":req.param("deadline"),
        }

        // validation: assessment cannot be created (or updated) without a title or mentor or deadline.
        if (typeof params.title === "undefined"){
            ret.message = "ERROR";
            ret.data = "Undefined assessment title";
            // 404: Bad Request
            res.json(404, ret);
            return router;
        }
        if (typeof params.mentor === "undefined"){
            ret.message = "ERROR";
            ret.data = "Undefined mentor";
            res.json(404, ret);
            return router;
        }
        if (!isValidObjectId(params.mentor)) {
            ret.message = "ERROR";
            ret.data = "Illegal mentor id,(Id should be a single String of 12 bytes or a string of 24 hex characters)";
            res.json(404, ret);
            return router;
        }
        if (typeof params.deadline === "undefined"){
            ret.message = "ERROR";
            ret.data = "Undefined user deadline";
            res.json(404, ret);
            return router;
        }
        if (!isValidDate(params.deadline)) {
            ret.message = "ERROR";
            ret.data = "Invalid deadline date format";
            res.json(404, ret);
            return router;
        }
        

        // permission check:mentor/admin
        await User.findById(id).then(async user => {
            if(user == null){
                // invalid user id
                res.status(404).send({
                    "message":"ERROR",
                    "data":"Invalid Account Id"
                });
                return router;
            } 
            if (user.role != "mentor" && user.role != "admin") {
                // permission deny
                res.status(403).send({
                    "message":"Forbidden",
                    "data":"Permission Deny"
                });
                return router;
            }
            
            
            await User.findById(params.mentor).then(async user => {
                if(user == null){
                    // invalid user id
                    res.status(404).send({
                        "message":"ERROR",
                        "data":"Invalid Mentor user Id, not exists"
                    });
                    return router;
                } 
                if (user.role != "mentor") {  // mentor needs to exist
                    res.status(404).send({
                        "message":"ERROR",
                        "data":"target id is not mentor"
                    });
                    return router;
                } 
                var new_assessment = new Assessment(params);
                await new_assessment.save().then(new_user=>{
                    res.status(201).send({
                        "message":"OK",
                        "data":new_assessment
                    });
                    return router;
                });
                }).catch(error=>{
                    console.log(error);
                    ret.message = "ERROR";
                    ret.data = "Invalid mentor User Id";
                    res.json(404, ret);
                    return router;
                });
            
        }).catch(error=>{
            console.log(error);
            ret.message = "ERROR";
            ret.data = "Invalid Account Id";
            res.json(404, ret);
            return router;
        });

        
    });


    // PUT, edit assessment by admin, 
    // delete previous assessment from submission&students, considering mentor change;
	assessmentRoute.put(async function (req, res) {
        //  handle query
        var id = req.params.id; // user_id
        var assessment_id = req.query.id;
        if (typeof assessment_id === "undefined"){
            ret.message = "ERROR";
            ret.data = "Undefined target assessment_id";
            res.json(404, ret);
            return router;
        }
        if (!isValidObjectId(assessment_id)) {
            ret.message = "ERROR";
            ret.data = "Illegal assessment id,(Id should be a single String of 12 bytes or a string of 24 hex characters)";
            res.json(404, ret);
            return router;
        }
        
        var params = {
            "title":req.query.title,
            "description":req.query.description,
            "mentor":req.query.mentor,
            "dateCreated": req.query.dateCreated,
            "deadline":req.query.deadline,
        }

        // validation: assessment cannot be created (or updated) without a title or mentor or deadline.
        if (typeof params.title === "undefined"){
            ret.message = "ERROR";
            ret.data = "Undefined assessment title";
            // 404: Bad Request
            res.json(404, ret);
            return router;
        }
        if (typeof params.mentor === "undefined"){
            ret.message = "ERROR";
            ret.data = "Undefined mentor";
            res.json(404, ret);
            return router;
        }
        if (!isValidObjectId(params.mentor)) {
            ret.message = "ERROR";
            ret.data = "Illegal mentor id,(Id should be a single String of 12 bytes or a string of 24 hex characters)";
            res.json(404, ret);
            return router;
        }
        if (typeof params.deadline === "undefined"){
            ret.message = "ERROR";
            ret.data = "Undefined user deadline";
            res.json(404, ret);
            return router;
        }
        if (!isValidDate(params.deadline)) {
            ret.message = "ERROR";
            ret.data = "Invalid deadline date format";
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
            if (user.role != "admin") {
                // permission deny
                res.status(403).send({
                    "message":"Forbidden",
                    "data":"Permission Deny"
                });
                return router;
            }
            

            // first determine whether it exists or not by findById, then findByIdAndUpdate
            await Assessment.findById(assessment_id).then(async assessment => {
                if(assessment == null){
                    // invalid user id
                    res.status(404).send({
                        "message":"ERROR",
                        "data":"Invalid target assessment_id"
                    });
                    return router;
                }
                await Assessment.findByIdAndUpdate(assessment_id, params, {"new":true}).then(()=>{
                    res.status(201).send({
                        "message":"OK",
                        "data": "Assessment Updated"
                    });
                }).catch(err=>{console.log(err);});
                
            }).catch(error=>{
                console.log(error);
                ret.message = "ERROR";
                ret.data = "Invalid target assessment_id";
                res.json(404, ret);
                return router;
            });

        }).catch(error=>{
            console.log(error);
            ret.message = "ERROR";
            ret.data = "Invalid target assessment Id";
            res.json(404, ret);
            return router;
        });
        
           
        return router;
	});

	// DELETE, delete assessment by admin, delete previous assessment from submission, delete from students;
	assessmentRoute.delete( async (req, res) => {
        var id = req.params.id;
        var assessment_id = req.query.id;
        if (typeof assessment_id === "undefined"){
            ret.message = "ERROR";
            ret.data = "Undefined target assessment_id";
            res.json(404, ret);
            return router;
        }
        if (!isValidObjectId(assessment_id)) {
            ret.message = "ERROR";
            ret.data = "Illegal assessment id,(Id should be a single String of 12 bytes or a string of 24 hex characters)";
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

                await Assessment.findById(assessment_id).then(async assessment => {
                    if (assessment == null) {
                        ret.message = "ERROR";
                        ret.data = "Invalid assessment id";
                        res.json(404, ret);
                        return router;
                    }
                    await Assessment.findByIdAndRemove(assessment_id).then(()=>{
                        res.status(201).send({
                            "message":"OK",
                            "data": "Assessment Deleted"
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



    });









    return router;
}

