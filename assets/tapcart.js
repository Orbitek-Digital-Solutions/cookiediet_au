window.addEventListener("load", function() {
  document.getElementById('add-weight-button').addEventListener('click', addWeight);
  document.getElementById('add-waistline-button').addEventListener('click', addWaistlineMeasurement);
  document.getElementById('save-account-details').addEventListener('click', saveAccountDetails);
  // document.getElementById('load-waistline-button').addEventListener('click', loadWaistlineChart);
  // document.getElementById('load-weight-button').addEventListener('click', loadWeightChart);
  document.getElementById('profile-pic').addEventListener('click', function() {
    document.getElementById('file-input').click();
  });
  // document.getElementById('modal-account-button').addEventListener('click', );
  document.getElementById('modal-cookie-button').addEventListener('click', function() {
    displayEatenCookies();
    displayCookieData();
  });
  document.getElementById('modal-tracking-button').addEventListener('click', function() {
    loadWeightChart();
    loadWaistlineChart();
  });
  // document.getElementById('modal-social-button').addEventListener('click', );
  document.getElementById('profile-form').addEventListener('submit', function(e) {addProfilePic(e)});
  document.getElementById('logout-button').addEventListener('click', signOut);
  document.getElementById('submit-cookie-form').addEventListener('click', submitCookieForm);
  document.getElementById('cookieTime').value = timeString;
  document.getElementById('cookieDate').value = dateString;
  
  var timeString = hours + ':' + minutes;
  var dateString = year + '-' + month + '-' + day;
  
  var currentDate = new Date();
  var day = currentDate.getDate();
  var month = currentDate.getMonth() + 1;
  var year = currentDate.getFullYear();
  var hours = currentDate.getHours();
  var minutes = currentDate.getMinutes();
  if (day < 10) {day = '0' + day;}
  if (month < 10) {month = '0' + month;}
  if (hours < 10) {hours = '0' + hours;}
  if (minutes < 10) {minutes = '0' + minutes;}
  
  getCustomerIdentity();
  // loadFacebookGroup();
});


let shopifyID; /*5210182090906*/
let userEmail;
let firstName;

document.addEventListener('DOMContentLoaded', function () {
  function isShopifyIDSet() {
    return shopifyID !== '' && shopifyID !== undefined;
  }

  // Get all elements with the class .modal-trigger
  var modalTriggers = document.querySelectorAll('.modal-trigger');

  modalTriggers.forEach(function (modalTrigger) {
    modalTrigger.addEventListener('click', function (event) {
      // Prevent the default click behavior
      event.preventDefault();

      // Check if shopifyID is set
      if (!isShopifyIDSet()) {
        showToast(`Please wait for account to finish syncing. Make sure you're logged in by clicking the account button in the bottom right`,10000);
      } else {
          var elems = document.querySelectorAll('.modal');
          var instances = M.Modal.init(elems);
      }
    });
  });
});


// function loadFacebookGroup() {
//   const userId = '100088198585913'; // Replace with your actual user ID

//   fetch(`https://graph.facebook.com/${userId}/groups`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   })
//     .then(response => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       return response.json();
//     })
//     .then(data => {
//       // Handle the response data here
//       showToast(data);
//     })
//     .catch(error => {
//       // Handle any errors that occurred during the fetch.
//       showToast('Fetch error:', error.message); // Use error.message to get the error message
//     });
// }

const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);
const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999);

// Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyDMK2AfxqbaOzIK-1kDDDEPp8fvIrnceNw",
  authDomain: "cookie-diet-app-test.firebaseapp.com",
  projectId: "cookie-diet-app-test",
  storageBucket: "cookie-diet-app-test.appspot.com",
  messagingSenderId: "731483926360",
  appId: "1:731483926360:web:1f096b15dbca883d90ff2d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var storageRef = firebase.storage().ref();
const db = firebase.firestore();
const functions = firebase.functions(); 
  
function getCustomerIdentity() {
      // shopifyID = '5210182090906';
      // signInFirebaseTest(shopifyID, userEmail);
  window.Tapcart.actions.getCustomerIdentity(null, {
    onSuccess: (res) => {
      showToast("Account successfully loaded.", res);

      // Parse the JSON response
      const customerData = JSON.parse(JSON.stringify(res));

      firstName = customerData.firstName;
      shopifyID = customerData.shopifyID;
      userEmail = customerData.email;

      signInFirebaseTest(shopifyID, userEmail);
    },
  });
}



function signInFirebaseTest(shopifyID, userEmail) {
    renderAccountData();
}

function showToast(message, duration) {
  var toast = document.createElement("div");
  toast.classList.add("toast");
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(function() {
    document.body.removeChild(toast);
  }, 3000);
}

function renderAccountData() {
  // User is logged in, get their account details from Firestore
  db.collection('users').doc(shopifyID).get().then((doc) => {
    if (doc.exists) {
      const data = doc.data();
      // Replace the account details with the user's information
      document.getElementById('first-name').value = data.firstName || '';
      document.getElementById('last-name').value = data.lastName || '';
      document.getElementById('email').value = data.email || '';
      if(data.dob != '') {
       document.getElementById('dob').value = data.dob; 
      }
      if (data.profilePicture) {
        document.getElementById('profile-pic').src = data.profilePicture;
      }
      scheduleCookieReminder();
      lastEatenCookie();
    } else {
      db.collection('users').doc(shopifyID).set({}).then(() => {
        showToast('Document successfully written!');
      })
      .catch((error) => {
        showToast('Error writing document:', error);
      });
    }
  })
  .catch((error) => {
    showToast('Error getting document:' + error, 3000);
  });
}

function signOut() {
  firebase.auth().signOut()
  .then(() => {
    window.location.reload();
    const loginTabButton = document.querySelector('.login-tab a');
    if (loginTabButton) {
      loginTabButton.click();
    };
    showToast("User logged out successfully");
  })
  .catch((error) => {
    showToast(error, 3000);
  });
}

// Function to schedule the next cookie reminder
function scheduleCookieReminder() {
  const currentTime = new Date();
  const nextReminderTime = new Date(currentTime.getTime() + (2 * 60 * 60 * 1000)); // Add 2 hours to current time

  // Schedule the next reminder
  setTimeout(() => {
    showToast('Time to eat another cookie!');
    scheduleCookieReminder();
  }, nextReminderTime - currentTime);
}

let waistData = [];
let waistTimestampData = [];
let waistChartInstance = null; // To keep track of the Chart instance

// Function to add waistline measurement entry for the current user
function addWaistlineMeasurement() {
  const waistlineMeasurementInput = document.getElementById('waistlineMeasurementInput').value;
  const currentTime = new Date();

  if (waistlineMeasurementInput !== '') {
    const waistlineMeasurementData = {
      waistlineMeasurement: waistlineMeasurementInput,
      timestamp: firebase.firestore.Timestamp.fromDate(currentTime)
    };

    // Add the waistline measurement data to the user's collection
    db.collection('users').doc(shopifyID).collection('waistlineMeasurements').add(waistlineMeasurementData)
      .then(() => {
        showToast('Waistline measurement added successfully', 3000);
      })
      .catch((error) => {
        showToast('Error adding waistline measurement' + error, 3000);
      });
  } else {
    showToast('Invalid waistline measurement input', 3000);
  }
}

// Format weight data for Chart.js
function formatWaistlineData() {
  const data = {
    labels: waistTimestampData,
    datasets: [{
      label: "Waistline (cm)",
      data: waistData,
      borderColor: "rgba(75, 192, 192, 1)",
      fill: false
    }]
  };
  return data;
}

function updateWaistChart() {
  const ctx = document.getElementById("waistlineChart").getContext("2d");
  const data = formatWaistlineData(waistData, waistTimestampData);
  const waistOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date', // Add the label for the x-axis
        },
      },
      y: {
        title: {
          display: true,
          text: 'Waistline (cm)', // Add the label for the y-axis
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
    }
  };
   // Check if the Chart instance exists and destroy it before creating a new one
  if (waistChartInstance) {
    waistChartInstance.destroy();
  }


  waistChartInstance = new Chart(ctx, {
    type: "line",
    data: data,
    options: waistOptions,
  });
}

function loadWaistlineChart() {
  waistData = []
  waistTimestampData = [];
  // Retrieve weight data from Firebase and format for Chart.js
  db.collection('users').doc(shopifyID).collection('waistlineMeasurements')
    .orderBy("timestamp")
    .onSnapshot((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = moment(data.timestamp.toDate()).utcOffset(8);
        waistData.push(data.waistlineMeasurement);
        waistTimestampData.push(timestamp.format("D MMM"));
      });
      // Update chart with new data
      updateWaistChart(waistData, waistTimestampData);
  });
}


// Function to add weight entry for the current user
function addWeight() {
  let weightInput = document.getElementById('weightInput').value;
  let currentTime = new Date();
  if (weightInput != '') {
    const weightData = {
      weight: weightInput,
      timestamp: firebase.firestore.Timestamp.fromDate(currentTime)
    };
    // Add the weight data to the user's collection
    db.collection('users').doc(shopifyID).collection('weights').add(weightData)
      .then(() => {
        weightInput = '';
        showToast('Weight added successfully', 3000);
        loadWeightChart();
      })
      .catch((error) => {
        showToast('Error adding weight' + error, 3000);
      });
  } else {
    showToast('Invalid weight input', 3000);
  }
}

// Initialize datepickers
document.addEventListener('DOMContentLoaded', function () {
  var fromDatePicker = document.getElementById('from-date');
  var toDatePicker = document.getElementById('to-date');
  var fromDateInstance = M.Datepicker.init(fromDatePicker);
  var toDateInstance = M.Datepicker.init(toDatePicker);
});

// Calculate the 'fromDate' to be 7 days ago from the current date
let fromDate = moment().subtract(7, 'days');
// Calculate the 'toDate' as the current date
let toDate = moment();

// document.getElementById('from-date').value = fromDate;
// document.getElementById('to-date').value = toDate;

// Filter button click event handler
document.getElementById('filter-button').addEventListener('click', function () {
  fromDate = document.getElementById('from-date').value;
  toDate = document.getElementById('to-date').value;
  loadWeightChart();
});


// Initialize empty arrays for weight and timestamp data
let weightData = [];
let weightTimestampData = [];
let weightChartInstance = null; // To keep track of the Chart instance

function loadWeightChart() {
  weightData = [];
  weightTimestampData = []; // Clear the weightTimestampData array
  // Retrieve weight data from Firebase and format for Chart.js
  db.collection('users').doc(shopifyID).collection('weights')
    .orderBy("timestamp")
    .where("timestamp", ">=", firebase.firestore.Timestamp.fromMillis(new Date(fromDate).setHours(0, 0, 0, 0)))
  .where("timestamp", "<=", firebase.firestore.Timestamp.fromMillis(new Date(toDate).setHours(23, 59, 59, 999)))
    .limit(10) // Load the last 10 entries within the date range
    .onSnapshot((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Convert the timestamp to the user's local time (UTC+8)
        const timestamp = moment(data.timestamp.toDate()).utcOffset(8);
        weightData.push(data.weight);
        weightTimestampData.push(timestamp.format("D MMM"));
      });
      // Update chart with new data
      updateWeightChart();
    });
}

// Format weight data for Chart.js
function formatWeightData(weightData, weightTimestampData) {
  const data = {
    labels: weightTimestampData,
    datasets: [{
      label: "Weight (kg)",
      data: weightData,
      borderColor: "rgba(75, 192, 192, 1)",
      fill: false
    }]
  };
  return data;
}

function updateWeightChart() {
  console.log(weightData);
  const ctx = document.getElementById("weightChart").getContext("2d");
  const data = formatWeightData(weightData, weightTimestampData);
  const weightOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date', // Add the label for the x-axis
        },
      },
      y: {
        title: {
          display: true,
          text: 'Weight (kg)', // Add the label for the y-axis
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
    }
  };
   // Check if the Chart instance exists and destroy it before creating a new one
  if (weightChartInstance) {
    weightChartInstance.destroy();
  }


  weightChartInstance = new Chart(ctx, {
    type: "line",
    data: data,
    options: weightOptions,
  });
}


function saveAccountDetails() {
  let firstName = document.getElementById('first-name').value;
  let lastName = document.getElementById('last-name').value;
  let email = document.getElementById('email').value;
  let dob = document.getElementById('dob').value;
  db.collection('users').doc(shopifyID).set({
    firstName: firstName,
    lastName: lastName,
    email: email,
    dob: dob
  })
  .then(() => {
    showToast("Account details updated.", 3000);
  })
  .catch((error) => {
    showToast("Error updating account details: " + error, 3000);
  });
}

// Submit cookie form data to Firebase
function submitCookieForm() {
  const dateInput = document.getElementById('cookieDate');
  const timeInput = document.getElementById('cookieTime');
  const date = dateInput.value;
  const time = timeInput.value;

  // Combine date and time into a single Date object
  const timestamp = new Date(date + ' ' + time);

  // Add data to Firebase
  db.collection('users').doc(shopifyID).collection('cookies').add({
    timestamp: timestamp,
  })
  .then(function(docRef) {
    showToast("Cookie Sucessfully Added", 3000);
    // Clear form inputs
    displayCookieData()
    displayEatenCookies();
    lastEatenCookie();
  })
  .catch(function(error) {
    showToast("Error adding document: " + error, 3000);
  });
}

// Display cookie data in a table
function displayCookieData() {
  const cookieTable = document.getElementById('cookieTable');
  cookieTable.getElementsByTagName('tbody')[0].innerHTML = '';
  let cookiesEaten = 1;
  db.collection('users').doc(shopifyID).collection('cookies')
  .where('timestamp', '>=', startOfToday)
  .where('timestamp', '<=', endOfToday)
    .orderBy('timestamp', 'desc')
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp.toDate();
        const row = cookieTable.tBodies[0].insertRow(-1);
        insertCell(row, 0).innerHTML = timestamp.toDateString();
        insertCell(row, 1).innerHTML = timestamp.toLocaleTimeString();
        insertCell(row, 2).innerHTML = '<a class="btn-flat waves-effect waves-light red-text"><i class="material-icons">delete</i></a>';
        // Add event listener to delete button
        const deleteButton = row.querySelector('a');
        deleteButton.addEventListener('click', () => {
          // Get the ID of the document to delete
          const docId = doc.id;
          // Delete the document from Firestore
          db.collection('users').doc(shopifyID).collection('cookies').doc(docId).delete()
            .then(() => {
              // Remove the row from the table
              cookieTable.deleteRow(row.rowIndex);
              showToast("Cookie deleted from history", 3000);
              displayEatenCookies();
            })
            .catch((error) => {
              showToast("Error deleting Cookie: " + error, 3000);
            });
        });
      });
    })
    .catch((error) => {
      showToast("Error getting documents: " + error, 3000);
    });
}

// Inserts a new row at the specified index in the table
function insertRow(table, index) {
  return table.insertRow(index);
}
// Inserts a new cell at the specified index in the row
function insertCell(row, index) {
  return row.insertCell(index);
}

function lastEatenCookie() {
  db.collection('users')
  .doc(shopifyID)
  .collection('cookies')
  .where('timestamp', '>=', startOfToday)
  .where('timestamp', '<=', endOfToday)
  .orderBy('timestamp', 'desc')
  .limit(1) 
  .get()
  .then(function(snapshot) {
    if (!snapshot.empty) {
      // Get the last entry
      const lastEntry = snapshot.docs[0].data();

      // Calculate the time difference
      const lastEntryTimestamp = lastEntry.timestamp.toDate(); // Convert Firestore timestamp to JavaScript Date
      const currentTime = new Date();
      const timeDifference = currentTime - lastEntryTimestamp;

      // Calculate hours, minutes, and seconds
      const hours = Math.floor(timeDifference / 3600000); // 1 hour = 3600000 milliseconds
      const minutes = Math.floor((timeDifference % 3600000) / 60000); // 1 minute = 60000 milliseconds

      // Format the result
      const formattedTimeDifference = `${hours} hours, ${minutes} minutes`;

      document.getElementById('last-cookie').innerHTML = 
      // Now you can use the formattedTimeDifference as needed
      showToast(`You had your last Cookie ${formattedTimeDifference} ago.`);
      document.getElementById('last-cookie').innerHTML = 'You had your last Cookie <b>' + formattedTimeDifference + '</b> ago.';
    } else {
      showToast('No entries found for today.');
    }
  })
  .catch(function(error) {
    showToast('Error retrieving data:', error);
  });
}
function displayEatenCookies() {
  var cookieCounterElem = document.getElementById('cookie-counter');
  var cookieElems = cookieCounterElem.querySelectorAll('.material-icons');
  // remove active cookies before function initialises
  cookieElems.forEach(elem => {
    elem.classList.remove('primary-text');
  });
  let cookiesEaten = 0;
  db.collection('users').doc(shopifyID).collection('cookies')
    .where('timestamp', '>=', startOfToday)
    .where('timestamp', '<=', endOfToday)
    .orderBy('timestamp', 'desc')
    .get().then(function(snapshot) {
      snapshot.forEach(function(doc) {
      cookiesEaten++;
      var cookieData = doc.data();
      cookieElems[cookiesEaten - 1].classList.add('primary-text');
    });
  });
}


function addProfilePic(e) {
  e.preventDefault();
  var fileInput = document.getElementById('file-input');
  // Get the file object
  var file = fileInput.files[0];
  var fileName = Date.now() + '-' + file.name;
  var uploadTask = storageRef.child('profile-pictures/' + fileName).put(file);

  // Listen for upload completion
  uploadTask.on('state_changed', function(snapshot) {
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    showToast('Upload is ' + progress + '% done');
  }, function(error) {
    showToast('Error uploading profile picture: ' + error, 3000);
  }, function() {
    // Get the download URL of the uploaded file
    uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
      db.collection('users').doc(shopifyID).update({
        profilePicture: downloadURL
      }).then(function() {
        document.getElementById('profile-pic').src = downloadURL;
        showToast('Profile picture updated successfully!', 3000);
      }).catch(function(error) {
        showToast('Error updating profile picture: ' + error, 3000);
      });
    });
  });
}



// old functions removed
// function signInFirebase(shopifyID, userEmail) {
//   // Always proceed with fetching and using the custom token.
//   fetchCustomToken(shopifyID);
// }

// async function signInWithCustomToken(customToken) {
//   try {
//     const userCredential = await firebase.auth().signInWithCustomToken(customToken);
//     const user = userCredential.user;
//     showToast('User signed in:', user);
//     renderAccountData();
//   } catch (error) {
//     showToast('Error signing in with custom token:', error);
//     renderAccountData();
//   }
// }

// async function fetchCustomToken(shopifyID) {
//   try {
//     const generateCustomToken = firebase.functions().httpsCallable('generateCustomToken');
//     const result = await generateCustomToken({ uid: shopifyID });
//     const customToken = result.data.customToken;
//     await signInWithCustomToken(customToken);
//   } catch (error) {
//     showToast('Error fetching or using custom token:', error);
//     renderAccountData();
//   }
// }