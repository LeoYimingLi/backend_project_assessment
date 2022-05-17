var User = require("../models/user");
var Assessment = require("../models/assessment");
var Submission = require("../models/submission");
const submission = require("../models/submission");

module.exports = function (router) {
    var submissionRoute = router.route("/users/:id/submission");
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
 
    // POST, add submission by student/admin
    submissionRoute.post(async (req, res) => {
        var id = req.params.id;
        var params = {
            "student":req.param("student"),
            "assessment": req.param("assessment"),
            "content":req.param("content"),
            "dateCreated": req.param("dateCreated"),
            "mark": req.param("mark"),
            "remark": req.param("remark")
        }

        // validation: submission cannot be created (or updated) without a student_id or assessment_id.
        if (typeof params.student === "undefined"){
            ret.message = "ERROR";
            ret.data = "Undefined submission student";
            // 404: Bad Request
            res.json(404, ret);
            return router;
        }
        if (!isValidObjectId(params.student)) {
            ret.message = "ERROR";
            ret.data = "Illegal student_id,(Id should be a single String of 12 bytes or a string of 24 hex characters)";
            res.json(404, ret);
            return router;
        }
        await User.findById(params.student).then(student => {
            if (student == null) {
                res.status(404).send({
                    "message":"ERROR",
                    "data":"student not exists with id: " + params.student
                });
                return router;
            }
            if (student.role != "student") {
                res.status(404).send({
                    "message":"ERROR",
                    "data":"student id is not student but " + student.role
                });
                return router;
            }
        })
        if (typeof params.assessment === "undefined"){
            ret.message = "ERROR";
            ret.data = "Undefined submission from which assessment";
            res.json(404, ret);
            return router;
        }
        if (!isValidObjectId(params.assessment)) {
            ret.message = "ERROR";
            ret.data = "Illegal assessment_id,(Id should be a single String of 12 bytes or a string of 24 hex characters)";
            res.json(404, ret);
            return router;
        }
        await Assessment.findById(params.assessment).then(assessment => {
            if (assessment == null) {
                res.status(404).send({
                    "message":"ERROR",
                    "data":"assessment not exists with id: " + params.assessment
                });
                return router;
            }
        })

        
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
            if (user.role == "mentor") {
                // permission deny
                res.status(403).send({
                    "message":"Forbidden",
                    "data":"Permission Deny"
                });
                return router;
            }
            var new_submission = new Submission(params);
            await new_submission.save().then(new_submission=>{
                res.status(201).send({
                    "message":"OK",
                    "data":new_submission
                });
                return router;
            });

        }).catch(error=>{
            console.log(error);
            ret.message = "ERROR";
            ret.data = "Invalid User Id";
            res.json(404, ret);
            return router;
        });



        
    });


    // PUT, edit submission by admin, may update student.assessment(if submission.student changed); 
    // add grade by mentor(only change grade)
	submissionRoute.put(async function (req, res) {
        //  handle query
        var id = req.params.id;
        var submission_id = req.query.id;
        if (typeof submission_id === "undefined"){
            ret.message = "ERROR";
            ret.data = "Undefined target submission_id";
            res.json(404, ret);
            return router;
        }
        if (!isValidObjectId(submission_id)) {
            ret.message = "ERROR";
            ret.data = "Illegal submission_id,(Id should be a single String of 12 bytes or a string of 24 hex characters)";
            res.json(404, ret);
            return router;
        }

        var params = {
            "student":req.query.student,
            "assessment": req.query.assessment,
            "content":req.query.content,
            "dateCreated": req.query.dateCreated,
            "mark": req.query.mark,
            "remark": req.query.remark
        };

        // validation: submission cannot be created (or updated) without a student_id or assessment_id.
        if (typeof params.student === "undefined"){
            ret.message = "ERROR";
            ret.data = "Undefined submission student";
            // 404: Bad Request
            res.json(404, ret);
            return router;
        }
        if (!isValidObjectId(params.student)) {
            ret.message = "ERROR";
            ret.data = "Illegal student_id,(Id should be a single String of 12 bytes or a string of 24 hex characters)";
            res.json(404, ret);
            return router;
        }
        await User.findById(params.student).then(student => {
            if (student == null) {
                res.status(404).send({
                    "message":"ERROR",
                    "data":"student not exists with id: " + params.student
                });
                return router;
            }
            if (student.role != "student") {
                res.status(404).send({
                    "message":"ERROR",
                    "data":"student id is not student but " + student.role
                });
                return router;
            }
        })
        if (typeof params.assessment === "undefined"){
            ret.message = "ERROR";
            ret.data = "Undefined submission from which assessment";
            res.json(404, ret);
            return router;
        }
        if (!isValidObjectId(params.assessment)) {
            ret.message = "ERROR";
            ret.data = "Illegal assessment_id,(Id should be a single String of 12 bytes or a string of 24 hex characters)";
            res.json(404, ret);
            return router;
        }
        await Assessment.findById(params.assessment).then(assessment => {
            if (assessment == null) {
                res.status(404).send({
                    "message":"ERROR",
                    "data":"assessment not exists with id: " + params.assessment
                });
                return router;
            }
        })





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
            if (user.role == "student") {
                // permission deny
                res.status(403).send({
                    "message":"Forbidden",
                    "data":"Permission Deny"
                });
                return router;
            }

            await Submission.findById(submission_id).then(async submission => {
                if (submission == null) {
                    res.status(404).send({
                        "message":"ERROR",
                        "data":"Invalid submission_id"
                    });
                    return router;
                }
                if (user.role == "mentor") {  // mentor only update grades
                    params = {"mark": params.mark, "remark": params.remark};
                }
                await Submission.findByIdAndUpdate(submission_id, params, {"new":true}).then(()=>{
                    res.status(201).send({
                        "message":"OK",
                        "data": "finish PUT"
                    });
                }).catch(err=>{console.log(err);});

            })

            
        }).catch(error=>{
            console.log(error);
            ret.message = "ERROR";
            ret.data = "Invalid User Id";
            res.json(404, ret);
            return router;
        });

           
        return router;
	});

	// DELETE, delete submission by admin, update student.assessment
	submissionRoute.delete( async (req, res) => {
        var id = req.params.id
        var submission_id = req.query.id;
        if (typeof submission_id === "undefined"){
            ret.message = "ERROR";
            ret.data = "Undefined target submission_id";
            res.json(404, ret);
            return router;
        }
        if (!isValidObjectId(submission_id)) {
            ret.message = "ERROR";
            ret.data = "Illegal submission_id,(Id should be a single String of 12 bytes or a string of 24 hex characters)";
            res.json(404, ret);
            return router;
        }
       
        // check user role
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
                await Submission.findById(submission_id).then(async submission => {
                    if (submission == null) {
                        res.status(404).send({
                            "message":"ERROR",
                            "data":"Invalid submission_id"
                        });
                        return router;
                    }
                    await Submission.findByIdAndRemove(submission_id).then(()=>{
                        res.status(201).send({
                            "message":"OK",
                            "data": "Submission Deleted"
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

        // // previous method to code
        // // delete user
        // var promise = new Promise( (resolve, reject) => {
        //     User.findByIdAndRemove(id, (err, user) => {
        //         if (err){
        //             reject(err);
        //         }else{
        //             // but user can be null
        //             resolve(user);  
        //         }  
        //     });
        // });
        // promise.then( user => {
        //     if (user) {
        //         ret.message = "OK";
        //         ret.data = "User deleted";
        //         res.json(200, ret);
        //     } else {
        //         ret.message = "ERROR";
        //         ret.data = "User Id Not Found";
        //         res.json(404, ret);
        //     }
        // }).catch( err => {
        //     console.log(err);
        //     ret.message = "ERROR";
        //     ret.data = "User Id Not Found(Invalid User Id)";
        //     res.json(404, ret);
        // });

    });

    return router;
}

