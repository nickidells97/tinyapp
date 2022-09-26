const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.deepEqual(user, expectedUserID, 'These emails are equal');
  });
  it('should return undefined', function() {
    const user = getUserByEmail("user23@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.notDeepEqual(user, expectedUserID, 'This email does not exist');
  });
});