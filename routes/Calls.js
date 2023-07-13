const express = require('express');
const Users = require('../models/Users');
const Questions = require('../models/Questions');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {createTokens, validateToken} = require('../middleware/check-auth');
const {verifyAdmin} = require('../middleware/verify-admin');
var request = require('request');

// Enter the access token as required (NOTE: I do not have access token because it needs company email to generate an access token for SPHERE ENGINE API)
var accessToken = '<access_token>';
var endpoint = '<endpoint>';

const router = express.Router();

router.post('/register',(req,res) => {
    Users.findOne({email : req.body.email}).then(user => 
        {
            if(user == null){
                const {firstName, lastName, email, password, isAdmin} = req.body;
                const registerUser = Users({
                    firstName,
                    lastName,
                    email,
                    password,
                    isAdmin,
                    createdAt: new Date()
                });

                const accessToken = createTokens(registerUser);
        
                bcrypt.genSalt(10, (err,salt) => {
                    bcrypt.hash(registerUser.password, salt, (hashErr, hash) => {
                        if(err || hashErr){
                        res.json({message: 'Error occured hashing', success: false});
                        return;
                        }
                        registerUser.password = hash;
                        registerUser.save().then(() => {
                            res.json({"email": registerUser.email, "accesstoken" : accessToken});
                        }).catch(er => res.json({message:er.message, success: false}));
                    })
                })
            }
            else{
                res.json({exists: true, message: 'Email already Registered'});
            }
        } 
    );
})

router.post('/login', (req,res) => {
    Users.findOne({email: req.body.email}).then(user => {
        if(!user) {
            res.json({message: 'Email does not exist', success: false});
        }
        else {
            bcrypt.compare(req.body.password, user.password).then(success => {
                if(!success) {
                    res.json({message: 'Invalid password', success: false});
                }
                else {
                    const accessToken = createTokens(user);
                    res.json({"email": user.email, "accesstoken" : accessToken});
                }
            })
        }
    })
})

router.get("/profile", validateToken, (req, res) => {
    res.json("validated");
});

router.post('/add-question', async(req,res) => {
    const currentUser = req.body.email;
    let question = new Questions({
        questionName: req.body.questionName,
    })

    const isAdmin = await verifyAdmin(currentUser);
    if(isAdmin){
        question.save().then(result => {
            res.status(200).json({"message": "Question added successfully", success: true});
        })
    }
    else{
        res.json({"message": "you are not admin"});
    }

})

router.post('/edit-question', async(req, res) => {
    const currentQuestion = req.body.id;
    const newQuestion = req.body.questionName;

    const isAdmin = await verifyAdmin(req.body.email);

    if(isAdmin == true){
        Questions.updateOne({ _id: currentQuestion},{"$set":{"questionName": newQuestion}}).then(result => {
            res.status(200).json({"message": "Question edited successfully", success: true});
        }).catch(err => {
            res.json({"message": "question not found"});
        })
    }
    else{
        res.json({"message": "you are not admin"});
    }
    
    console.log(isAdmin);
})

router.post('/delete-question', async(req,res) => {
    const currentUser = req.body.email;
    const currentQuestion = req.body.id;

    const isAdmin = await verifyAdmin(currentUser);
    if(isAdmin == true){
        Questions.deleteOne({ _id: currentQuestion}).then(result => {
                res.status(200).json({"message": "Question deleted successfully", success: true});
        }).catch(err => {
            res.json({"message": "question not found"});
        })
    }
    else{
        res.json({"message": "you are not admin"});
    }

})

router.post('/add-testcase', async(req,res) => {
    const currentUser = req.body.email;
    let testCases = req.body.testCases;

    const currentQuestion = req.body.id;

    const isAdmin = await verifyAdmin(currentUser);

    if(isAdmin == true){
        Questions.updateOne({ _id: currentQuestion}, { "$push": {"testCases": testCases}}).then(result => {
            res.status(200).json({"message": "Test Cases added successfully", success: true});
        }).catch(err => {
            res.json({error : err.message});
        })
    }
    else{
        res.json({"message": "you are not admin"});
    }
})

router.post('/create-submission', (req,res) => {
    var submissionData = {
        problemId: 42,
        compilerId: 11,
        source: req.body.sourceCode
    };

    request({
        url: 'https://' + endpoint + '/api/v4/submissions?access_token=' + accessToken,
        method: 'POST',
        form: submissionData
    }, function (error, response, body) {
        
        if (error) {
            console.log('Connection problem');
        }
        
        // process response
        if (response) {
            if (response.statusCode === 201) {
                console.log(JSON.parse(response.body)); // submission data in JSON
            } else {
                if (response.statusCode === 401) {
                    console.log('Invalid access token');
                } else if (response.statusCode === 402) {
                    console.log('Unable to create submission');
                } else if (response.statusCode === 400) {
                    var body = JSON.parse(response.body);
                    console.log('Error code: ' + body.error_code + ', details available in the message: ' + body.message)
                }
            }
        }
    });
})

router.post('/get-submissionById', (req, res) => {
    var submissionId = 2017;

    // send request
    request({
        url: 'https://' + endpoint + '/api/v4/submissions/' + submissionId + '?access_token=' + accessToken,
        method: 'GET'
    }, function (error, response, body) {
        
        if (error) {
            console.log('Connection problem');
        }
        
        // process response
        if (response) {
            if (response.statusCode === 200) {
                console.log(JSON.parse(response.body)); // submission data in JSON
            } else {
                if (response.statusCode === 401) {
                    console.log('Invalid access token');
                } else if (response.statusCode === 403) {
                    console.log('Access denied');
                } else if (response.statusCode === 404) {
                    console.log('Submision not found');
                }
            }
        }
    });
})


module.exports = router;