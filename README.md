# Algorizin Backend take-home Assessment
### Due: May 17th, 2022, 11.59AM

## Table of Contents
0. [Requirement](#requirement)
1. [Endpoints Design](#endpoints-design)
2. [Database Design](#database-design)
3. [API Response Design](#api-response-design)
4. [How To Run](#how-to-run)
5. [Tests](#tests)

## 0. Requirement

Detailed google docs: [Backend Engineering Project](https://docs.google.com/document/d/14UF_2Beq87QrZYUgyg3k42TA-oEMJjt0Y7rP0K3lC3I/edit)

## 1.Endpoints Design

The API will has the following end-points (they would be preceded by something like http://localhost:4000/api/). The implementation is using Node, Express and Mongoose.

| Endpoints| Actions | Intended Outcome                                    |
|----------|---------|-----------------------------------------------------|
| users/register    | POST    | Create a new user. Respond with details of new user |
| users/login    | POST    | login. Respond with outcome(success/fail) |
| users/:id/assessment| POST     | add assessment by mentor/admin, Respond with details of new assessment or permission deny by student |
|          | GET     | detailed view: Mentor/Admin can see all submissions, Student can see only their submission |
|          | PUT     | Replace entire assessment with supplied task by admin or permission deny |
|          | DELETE  | Delete specified task or 404 error                  |
| users/:id/submission| POST     | add submission by student/admin, Respond with details of new submission or permission deny by mentor |
|          | PUT     | Replace entire submission with supplied submission by admin or 404 error |
|          | DELETE  | Delete specified submission or 404 error                  |
| users/:id/user| POST     | add user by admin, Respond with details of new user or permission deny by other roles |
|          | PUT     | Replace entire user with supplied user by admin or 404 error |
|          | DELETE  | Delete specified user or 404 error                  |

<!-- | users/:id/grade| POST     | add grade by mentor/admin, Respond with details of new grade or permission deny by other roles |
|          | PUT     | Replace entire grade with supplied user by admin or 404 error |
|          | DELETE  | Delete specified grade or 404 error                  | -->


## 2.Database Design
0.based on MongoDB Atlas(https://www.mongodb.com/cloud/atlas) 


| Schema| Properties | Types | possible values |
|----------|---------|---------------| --               |
| User       | "name"       |     String |               |
|            | "password"    | String |                 |
|            | "role"       | String | "student", "mentor", "admin"|

| Schema| Properties | Types | possible values |
|----------|---------|---------------| --               |
| Assessment | "title"        | String |                   |
|    | "description" | String |            |
|    | "mentor" | String | (Id should be a single String of 12 bytes or a string of 24 hex characters) |
|    | "dateCreated" | Date |  |
|    | "deadline" | Date |  |

| Schema| Properties | Types | possible values |
|----------|---------|---------------| --               |
| Submission | "student"        | String |       (Id should be a single String of 12 bytes or a string of 24 hex characters)            |
|    | "assessment" | String |   (Id should be a single String of 12 bytes or a string of 24 hex characters)         |
|    | "content" | String |  |
|    | "dateCreatd" | Date |  |
|    | "mark" | String |  |
|    | "remark" | String |  |

 **grade(mark, remark)** is merged into the **submission** stucture for simplicity.


**Let's assume that each assessment can be assigned only to one mentor.**


## 3.API Response Design

1. Responses from the API will be a JSON object with two fields. The first field is named `message`(contains a human readable String). The second field is named `data` and contains the actual JSON response object. For example:

```javascript
{
    "message": "OK",
    "data": {
        "_id": "11099652e5993a350458b7b7",
        "email": "yiming22@illinois.edu",
        "name": "yiming22"
    }
}
```

2. The API will respond with appropriate HTTP status codes for both successful and error responses (200 (success), 201 (created), 404 (not found), 500 (server error)).


## 4. How T0 Run
1. Clone the repository:
`git clone `, then `cd `
2. Install dependencies:
`npm install`
3. Start the dev server:
`npm start` or 
`nodemon --exec node server.js` to automatically restart the server on save.


## 5. Tests
  - [Screenshots Records](https://docs.google.com/document/d/162Mk8AA7fjz5LS8ZwuXmcg2_ZTGjikOib6ImIWCG4qk/edit?usp=sharing) about using Postman

## 6.Reference
Course Web Programming Project3: https://gitlab.com/uiuc-web-programming/mp3/-/tree/master/  

My Implementation for cs498rk-mp3: https://github.com/LeoYimingLi/cs498rk/tree/master/MPs_machine_problem/mp3

## 7.other consideration for next steps:
1.login "name" in User should be unique, authentication;   
2.after editing assessment by admin, we should also delete previous assessment from submission and students, considering mentor change;  
3.after deleting assessment by admin, we should also delete previous assessment from submission and students;  
4.after editing user by admin;  if prev user is student, we should also delete prev student's submission; if prev is mentor(role change(mentor -> stud/admin): we should also delete their assessments(we assume assessment must have a mentor)) + student.assessments + submissions;  
5.after deleting user by admin, if that's student, we should delete prev submission; if mentor, delete assessments+student.assessments + submissions;  
6.if submission is edited by admin, may update student.assessment(if submission.student changed);   
7.delete submission by admin, update student.assessment;  
