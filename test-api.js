const fetch = require('node-fetch');

const testData = {
  email: 'test@example.com',
  userName: 'testuser'
};

fetch('http://identity.asafarim.local:5101/admin/users/with-null-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'atk=test'
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log(`HTTP Status: ${response.status}`);
  return response.text();
})
.then(body => {
  console.log('Response:', body);
})
.catch(error => {
  console.error('Error:', error);
});
