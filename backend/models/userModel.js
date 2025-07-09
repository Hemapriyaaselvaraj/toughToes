const mongoose = require("mongoose");

const UserRoles = Object.freeze({
  ADMIN: 'admin',
  USER: 'user',
});

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required : true,
    },
    role:{
        type: String,
        enum: Object.values(UserRoles),
        default: UserRoles.USER,  
        required : true,
    },
    firstName:{
        type: String,
        required: true,
    },
    lastName:{
        type: String,
        required : true,
    },
    phoneNumber:{
        type: String,
        required : true,
    },
    isActive:{
        type: Boolean,
        required: true,
        default: true,
    },
    isBlocked:{
        type: Boolean,
        required : true,
        default: false,
    },
},
  {
    timestamps: true,
  }

);

module.exports = mongoose.model("user",userSchema)