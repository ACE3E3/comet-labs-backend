const Users = require('../models/Users');

const verifyAdmin = async(userEmail) => {
    var isAdmin = false;
    await Users.findOne({email : userEmail}).then(users => {
        if(users.isAdmin == true){
            isAdmin = true;
        }
        else {
            isAdmin = false;
        }
    })

    return isAdmin;
}

module.exports = {verifyAdmin};