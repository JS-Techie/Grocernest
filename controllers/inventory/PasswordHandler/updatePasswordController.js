const db = require("../../../models");

const UserModel = db.UserModel


const compareEncryptedData = require('../../../services/compareEncryptedData')
const specialCharacterCheck = require('../../../services/specialCharacterCheck')
const encryptData = require('../../../services/encryptData')

const updatePassword = async (req, res,next) => {
    const {
        passChangeFlag,
        newPassword,
        newPasswordConfirm
    } = req.body

    var userId

    console.log("userID:", userId)
    console.log("passChangeFlag:", passChangeFlag)
    console.log("new password: ", newPassword)


    
    if (!newPassword) {
        return res.json({
            status: 400,
            success: false,
            message: "New Password field should not be empty"
        })
    }
    if (!newPassword === newPasswordConfirm) {
        return res.json({
            status: 400,
            success: false,
            message: "Confirmed New Password must be same as New Password"
        })
    }
    try {
        console.log("lalalalalala")
        if (passChangeFlag === "user") {
            userId = req.body.userId
            console.log("userID for non self:", userId)
            if (!userId) {
                return res.json({
                    status: 400,
                    success: false,
                    message: "User ID is a mandatory field and must not be empty"
                })
            }
        }


        if (passChangeFlag === "self") {
            const oldPassword = req.body.oldPassword
            userId = req.user_id
            console.log("userID for self:", userId)
            if (!userId) {
                return res.json({
                    status: 400,
                    success: false,
                    message: "User ID is a mandatory field and must not be empty"
                })
            }
            if (!oldPassword) {
                return res.json({
                    status: 400,
                    success: false,
                    message: "Old Password Field must not be left empty"
                })
            }
            if (newPassword === oldPassword) {
                return res.json({
                    status: 400,
                    success: false,
                    message: "New and Old Password should not be same"
                })
            }
            const oldPassFetchResult = await UserModel.findOne({
                attributes: ['password'],
                where: { id: userId }
            })

            console.log("the old password", oldPassword)
            console.log("type of old pass fetch result", typeof (oldPassFetchResult))
            console.log("the old pass fetch result", oldPassFetchResult.password)

            const oldPassCheck = await compareEncryptedData(oldPassword, oldPassFetchResult.password)

            if (!oldPassCheck) {
                return res.json({
                    status: 400,
                    success: false,
                    message: "Old Password doesnt match"
                })
            }
        }
        const specialCharacterCheckResult = specialCharacterCheck(newPassword)

        console.log("special character check result", specialCharacterCheckResult)
        if (!specialCharacterCheckResult) {
            return res.json({
                status: 400,
                success: false,
                message: "Password must contain special characters"
            })
        }
        if (newPassword.length <= 8 || newPassword.length > 20) {
            return res.json({
                status: 400,
                success: false,
                message: "Password length must always be within the range of 8 to 20 characters"
            })
        }

        const encryptedNewPassword = await encryptData(newPassword)


        const updatedPassword = await UserModel.update(
            { password: encryptedNewPassword },
            { where: { id: userId } }
        )

        console.log("the updated password return: ", updatedPassword)
        if (updatedPassword) {
            res.status(200).json({
                success: true,
                status:200,
                message: "Password Updated successfully",
                data: encryptedNewPassword
            })
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Exception Met",
            data: error.message
        })
    }
}

module.exports = updatePassword