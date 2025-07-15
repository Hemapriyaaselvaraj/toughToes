const userModel = require("../models/userModel");

const home = async (req, res) => {
    let name = "Guest";
    if (req.session && req.session.userId) {
        const user = await userModel.findById(req.session.userId);
        if (user) name = user.firstName + ' ' + user.lastName;
    }
    res.render('user/home', { name });
}

module.exports = {
    home
}