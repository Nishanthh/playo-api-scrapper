'use strict';
const fetch = require('node-fetch');
// import { saveItemInDB, getItemFromDB } from "./dynamodb-actions";

let venueList = [];
var AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();


function saveItemInDB(venue) {
    // venue['id'] = uuid();

    const params = {
      TableName: "venue-list",
      Item: venue
    };

  return dynamoDB
      .put(params)
      .promise()
      .then(res => {
        res
        console.log(res, 'responses')
      })
      .catch(err => {
        err
        console.log(err, 'error coming')
      });
  }


module.exports.hello = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};



module.exports.getVenues = async() => {
  await getAllVenues(0);
  const response = await storeInDb();
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'geting venues',
      data: venueList,
      dbReport: response
    }
    ),
  }
};

async function storeInDb() {
  const item = venueList[0];
  let response = {}
  try {
    await saveItemInDB(item);
    response = {
      created: item,
      statusCode: 201
    }
  } catch (err) {
    response = {
      error: err,
      statusCode: 400
    }
  }
  return response;
}

async function getAllVenues(page) {
  const data = JSON.stringify({
    "page": page,
    "lat": 13.076440,
    "lng": 80.260139,
    "sportId": ["SP2"]
  })

  let venues = {};

  await fetch('https://api.playo.io/venue-public/list', {
    method: 'post',
    body:    data,
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': '5534898698eb3426d00168b6ed447d23d000026552ed6200' 
    },
  })
  .then(res => res.json())
  .then(res => {    
    venues = modifyVenue(res.list);
    venueList = venueList.concat(venues);
    if (res.nextPage === -1) { 
    } else {
      getAllVenues(page++);
    }
  });
}

function modifyVenue(venues) {
  let extractKeys = ['_id', 'name', 'area', 'city', 'sports'];
  let modifiedVenues = [];
  venues.map(venue => {
    let venueObj = {};
    extractKeys.map(key => {
      if (venue.hasOwnProperty(key)) {
        venueObj[key] = venue[key];
      }
    })
    modifiedVenues.push(venueObj);
  })
  return modifiedVenues;
}

// export const respond = (fulfillmentText, statusCode) => {
//   return {
//     statusCode,
//     body: JSON.stringify(fulfillmentText),
//     headers: {
//       "Access-Control-Allow-Credentials": true,
//       "Access-Control-Allow-Origin": "*",
//       "Content-Type": "application/json"
//     }
//   };
// };

/** Save an item in the to-do list */
module.exports.saveToDoItem = async (
  event,
  context
) => {
  const incoming = JSON.parse(event.body);
  const { item, complete } = incoming;
try {
    await saveItemInDB(item, complete);
    return respond({ created: incoming }, 201);
  } catch (err) {
    return respond(err, 400);
  }
};
// /** Get an item from the to-do-list table */
// module.exports.getToDoItem = async (
//   event,
//   context
// ) => {
//   const id = event.pathParameters.id;
// try {
//     const toDoItem = await getItemFromDB(id);
//     return respond(toDoItem, 200);
//   } catch (err) {
//     return respond(err, 404);
//   }
// };