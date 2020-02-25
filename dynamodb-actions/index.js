var AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();


export function saveItemInDB(venue) {
    venue['id'] = uuid();
    const params = {
      TableName: "venue-list",
      Item: venue
    };
  return dynamoDB
      .put(params)
      .promise()
      .then(res => res)
      .catch(err => err);
  }

export function getItemFromDB(id) {
const params = {
    TableName: "venue-list",
    Key: {
    id
    }
};
return dynamoDB
    .get(params)
    .promise()
    .then(res => res.Item)
    .catch(err => err);
}