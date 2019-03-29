const AWS = require('aws-sdk');
const keys = require('../config/keys');
const uuid = require('uuid/v1');
const requireLogin = require('../middlewares/requireLogin');

// Credentias from user created on IAM at amazon.
const s3 = new AWS.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey
});

module.exports = app => {
  app.get('/api/upload', requireLogin, (req, res) => {
    const key = `${req.user.id}/${uuid()}.jpg`;

    s3.getSignedUrl(
      'putObject',
      {
        Bucket: 'ml-blog-bucket',
        ContentType: 'image/jpeg',
        Key: key
      },
      (err, url) => {
        return res.send({ key, url });
      }
    );
  });
};
