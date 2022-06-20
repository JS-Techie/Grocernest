
const generateOTP = () =>{
    return Math.floor(100000 + Math.random() * 900000);
}

const sendOTPToPhoneNumber = () =>{

}

module.exports = {
    generateOTP,
    sendOTPToPhoneNumber
}