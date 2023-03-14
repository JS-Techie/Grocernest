const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../../models");
const User = db.UserModel;



const {
    getModuleList,
    getUserRoles
} = require("../../services/userService")




const login = async (req, res, next) => {
    const { userName, password } = req.body;
    console.log(userName)
    try {
        const currentUser = await User.findOne({
            where: { email: userName }
        })
        console.log(currentUser)
        if (!currentUser) {
            return res.status(200).send({
                status: 400,
                message: "User doesn't exist , please register",
                data: []
            })
        }
        if (!bcrypt.compareSync(password, currentUser.password)) {
            return res.status(200).send({
                status: 400,
                message: "Please enter the correct password",
                data: []
            })
        }
        const { full_name, email, mobile_no } = currentUser;

        const userRoles = await getUserRoles(currentUser.id);
        const moduleList = await getModuleList(currentUser.id);

        const token = jwt.sign({
            mobile_no,
            full_name,
            email
        },
            "cosmetixkey",
            { expiresIn: "365d" }
        )
        const currentUserResponse = {
            "userId": currentUser.id,
            "newPassword": null,
            "captcha": null,
            "fullName": currentUser.full_name,
            "email": currentUser.email,
            "password": currentUser.password,
            "mobileNo": currentUser.mobile_no,
            "gender": currentUser.gender,
            "dob": currentUser.date_of_birth,
            "type": currentUser.type_cd,
            "status": currentUser.active_ind,
            "isActive": currentUser.active_ind,
            "locationId": currentUser.location_id,
            "locationName": null,
            "serverDate": null,
            "roleList": userRoles,
            "moduleList": moduleList
        }
        return res.status(200).send({
            status: 200,
            message: "Successfully logged in",
            data: {
                token: token,
                userDetails: currentUserResponse,
            }
        })
    } catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Something went wrong , please try again later",
            data: error.message
        })
    }
}

const getAccessToken = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const currentUser = await User.findOne({
            where: { email, password }
        })
        if (!currentUser) {
            return res.status(200).send({
                status: 400,
                message: "User doesn't exist , please register",
                data: []
            })
        }
        if (!bcrypt.compareSync(password, currentUser.password)) {
            return res.status(200).send({
                status: 400,
                message: "Please enter the correct password",
                data: []
            })
        }
        const { full_name, mobile_no, email } = currentUser;

        const token = jwt.sign({
            full_name,
            mobile_no,
            email
        }, "cosmetixkey", {
            expiresIn: "365d"
        })
        return res.status(200).send({
            status: 200,
            data: {
                token: token,
                currentUser: currentUser
            },
            message: "Successfully logged in"
        })
    } catch (error) {
        return res.status(200).send({
            status: 500,
            message: "Something went wrong , please try again later",
            data: error.message
        })
    }
}

// const register = async(req, res, next ) => {

// }


module.exports = {
    login,
    getAccessToken,
    // register
}