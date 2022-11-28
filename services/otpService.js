const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const generatePin = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

const sendOTPToPhoneNumber = (otp) => {};

console.log(generatePin());

module.exports = {
  generateOTP,
  sendOTPToPhoneNumber,
  generatePin,
};
