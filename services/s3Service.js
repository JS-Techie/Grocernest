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

const uploadImageToS3 = async (base64, key) => {
  const base64Data = new Buffer.from(
    base64.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  //const type = base64.split(";")[0].split("/")[1];
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: base64Data,
    ContentEncoding: "base64",
    ContentType: `image/jpeg`,
  };
  const s3UploadResponse = await s3.upload(params).promise();
  const url = s3UploadResponse.Location;

  return url;
};

const deleteImageFromS3 = async (key) => {
  let deleteSuccess = true;
  let errMessage = "";

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };

  s3.deleteObject(params, (err, data) => {
    if (err) {
      deleteSuccess = false;
      errMessage = err;
    }
  });

  return {
    deleteSuccess,
    errMessage,
  };
};

module.exports = {
  uploadToS3,
  getFromS3,
  uploadImageToS3,
  deleteImageFromS3,
};
