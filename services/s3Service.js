const S3 = require("aws-sdk/clients/s3");
const s3Config = require("../config/s3Config");
const fs = require("fs");

const s3 = new S3(s3Config);

//upload document to s3
const uploadToS3 = async (file, key) => {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: fs.readFileSync(file),
  };
  console.log("uploaded to s3");
  return await s3.upload(uploadParams).promise();
};

//get the document from s3
const getFromS3 = async (key) => {
  const downloadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };
  return s3.getObject(downloadParams).createReadStream();
};

module.exports = {
  uploadToS3,
  getFromS3,
};
