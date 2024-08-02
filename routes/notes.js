const express = require("express");
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
const Note = require("../models/Note");
const { body, validationResult } = require('express-validator');


// Route 1
// Get all the notes using GET: "/api/notes/"
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
})

// Route 2
// Add a new note using POST: "/api/notes/"
router.post("/addnote", fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, description, tag, myFile } = req.body;
        //If there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Note({
            title, description, tag, myFile, date:Date(), user: req.user.id
        })
        const savedNote = await note.save();
        res.json(savedNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
})

// Route 3
// Update existing node using PUT "/api/notes/updatenote"
router.put("/updatenote/:id", fetchuser, async (req, res) => {
    const { title, description, tag, myFile } = req.body;

    try {
        // Create a new Note Object
        const newNote = {};
        if (title) { newNote.date = Date() };
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };
        if (myFile) { newNote.myFile = myFile };

        // Find the node to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found"); }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
})

// Route 4
// Delete existing note using DELETE "/api/notes/deletenote"
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
    try {
        // Find the node to be deleted and delete it
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found"); }

        // Allow deletion if only user owns the note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Note has been deleted" });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
})

// Route 5
// Search for a note using GET "/api/notes/getnote"
router.get("/searchnotes/:key", fetchuser, async (req, res) => {
    try {
        const notes = await Note.find(
            {
                "$or":[
                    {
                        "tag":{$regex:req.params.key}
                    }
                ]
            }
        );
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
})

router.get("/note/:id", fetchuser, async (req, res) => {
    try {
        let note = await Note.findOne({ user: req.user.id, _id: req.params.id });
        if (!note) {
            return res.status(404).send("Not Found");
        }
        res.json(note);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occurred");
    }
});

module.exports = router