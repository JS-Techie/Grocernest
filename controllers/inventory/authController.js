const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../../models");
const User = db.UserModel;
const LkpLocationModel = db.LkpLocationModel;

const {
    getModuleList,
    getUserRoles } = require("../../services/userService")

const login = async (req, res, next) => {

    const { email, password } = req.body;
    console.log("jjfldshfkdshkfhdskfjhsdkj")
    console.log(email)

    try {
        const currentUser = await User.findOne({
            where: { email }
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
        const { full_name, mobile_no } = currentUser;
        const userRoles = await getUserRoles(currentUser.id);
        const moduleList = await getModuleList(currentUser.id);

        // const loc_name= await LkpLocationModel.create({
        //     attributes: ['loc_name'],
        //     where:{id: currentUser.location_name}
        // })
        const userRoleSelectedOutputArrPromises = userRoles.map(async (individualObj) => {
            const rolelistInd = {
                "roleName": individualObj.roleName,
                "roleDesc": individualObj.roleDesc,
                "roleId": individualObj.roleId
            }
            return (rolelistInd)
        })

        const moduleListSelectedOutputArrPromises = moduleList.map(async(individualObj)=>{
            const moduleListInd ={
                "moduleName": individualObj.moduleName ,
                "moduleDesc": individualObj.moduleDesc,
            }
            return moduleListInd
        })

        userRoleSelectedOutputArr = await Promise.all(userRoleSelectedOutputArrPromises)
        moduleListSelectedOutputArr =await Promise.all(moduleListSelectedOutputArrPromises)


        const token = 'Bearer ' + jwt.sign({
            "iss": currentUser.full_name,
            "sub": currentUser.email,
            "aud": currentUser.location_id,
            "USERID": currentUser.id,
            "CURRENTLOCALE": null,
            "USERTYPEID": null,
            "USERROLELIST": userRoleSelectedOutputArr,
            "USERMODULELIST": moduleListSelectedOutputArr
        }, "cosmetixkey",
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
                userDetails: currentUserResponse,
                token: token,
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

// const getAccessToken = async (req, res, next) => {
//     const { email, password } = req.body;
//     try {
//         const currentUser = await User.findOne({
//             where: { email, password }
//         })
//         if (!currentUser) {
//             return res.status(200).send({
//                 status: 400,
//                 message: "User doesn't exist , please register",
//                 data: []
//             })
//         }
//         if (!bcrypt.compareSync(password, currentUser.password)) {
//             return res.status(200).send({
//                 status: 400,
//                 message: "Please enter the correct password",
//                 data: []
//             })
//         }
//         const { full_name, mobile_no, email } = currentUser;
//         const token = jwt.sign({
//             full_name,
//             mobile_no,
//             email
//         }, "cosmetixkey", {
//             expiresIn: "365d"
//         })
//         return res.status(200).send({
//             status: 200,
//             data: {
//                 token: token,
//                 currentUser: currentUser
//             },
//             message: "Successfully logged in"
//         })

//     } catch (error) {
//         return res.status(200).send({
//             status: 500,
//             message: "Something went wrong , please try again later",
//             data: error.message
//         })
//     }
// }
// const register = async(req, res, next ) => {// }

module.exports = {

    login,
    // getAccessToken,

    // register
}