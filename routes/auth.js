const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchuser = require("../middleware/fetchuser");
require('dotenv').config();
const JWT_SECRET = process.env.SECRET_KEY;

//Route 1
//Create a User using: POST "/api/auth/createuser". Doesn't require Auth
router.post("/createuser", [
    body('fname', 'Enter a valid Name').isLength({ min: 3 }),
    body('lname', 'Enter a valid Name').isLength({ min: 3 }),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
    body('email', 'Enter a valid Email Address').isEmail(),
], async (req, res) => {
    //If there are errors, return Bad request and the errors
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        //Check whether user with this email already exists
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "A User with this email already exists" });
        }
        else {
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);

            // Create a new user
            user = await User.create({
                fname: req.body.fname,
                lname: req.body.lname,
                email: req.body.email,
                password: secPass
            });
            const data = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET);

            success = true;
            res.json({ success, authToken });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
})

//Route 2 
// Authenticating a user using: POST "/api/auth/login" No Login required
router.post("/login", [
    body('email', 'Enter a valid Email Address').isEmail(),
    body('password', 'Password cannot be blank').exists()
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success, error: "Incorrect Username or Password" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {

            return res.status(400).json({ success, error: "Incorrect Username or Password" });
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error Occured");
    }
})

// Route 3
// Get logged in user details using POST "/api/auth/getuser" Login required
router.get("/getuser", fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error Occured");
    }
})
module.exports = router