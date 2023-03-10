// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");


// const db = require("../../models");
// const User = db.UserModel;

// const login = async (req,res,next) => {
//     const {userName , password} = req.body;
// try {
//     const currentUser = await User.findOne({
//         where: {email: userName}
//     })
//     if (!currentUser){
//         return res.status(200).send({
//             status: 400,
//             message: "User doesn't exist , please register",
//             data: []
//         })
//     }
//     if (!bcrypt.compareSync(password, currentUser.password)) {
// return res.status(200).send({
//     status: 400,
//     message: "Please enter the correct password", 
//     data: []
// })
// }
// const {full_name,email,mobile_no} = currentUser;
// const token = jwt.sign({
//     mobile_no,
//     full_name,
//     email
// },
//     "cosmetixkey",
//     {expiresIn : "365d"}
// )
// return res.status(200).send({
//     status: 200,
//     message: "Successfully logged in",
//     data : {
//         token: token,
//         currentUser : currentUser
//     }
// })
// } catch (error) {
//     return res.status(200).send({
//         status: 500,
//         message:"Something went wrong , please try again later",
//         data : error.message
//     })
// }
// }

// const getAccessToken = async (req, res, next) => {
//     const {email, password}  = req.body;
//     try {
//         const currentUser = await User.findOne({
//             where : {email , password}
//         })
//         if(!currentUser){
//             return res.status(200).send({
//                 status: 400,
//                 message: "User doesn't exist , please register",
//                 data: []
//             })
//         }
//         if (!bcrypt.compareSync(password, currentUser.password)){
//             return res.status(200).send({
//                 status: 400,
//                 message: "Please enter the correct password",
//                 data: []
//             })
//         }
//         const {full_name,  mobile_no, email} = currentUser;

//         const token = jwt.sign({
//             full_name,
//             mobile_no,
//             email}, "cosmetixkey", {expiresIn : "365d"
//         })
//         return res.status(200).send({
//             status: 200,
//             data: {
//                 token :token,
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

// const register = async(req, res, next ) => {

// }

// module.exports = {
//     login,
//     getAccessToken,
//     register
// }