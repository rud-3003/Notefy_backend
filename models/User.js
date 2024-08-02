const mongoose = require('mongoose');
const {Schema}= mongoose;

const UserSchema = new mongoose.Schema({
    fname:{
        type: String,
        required: true
    },
    lname:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    myFile:{
        type: String
    }
});
const User = mongoose.model('User', UserSchema);
User.createIndexes();
module.exports= User;