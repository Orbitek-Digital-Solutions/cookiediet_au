// Constants
const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);
const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999);

// Lets
// Calculate the 'fromDate' to be 7 days ago from the current date
let fromDate = moment().subtract(7, 'days');
let toDate = moment();

let cookieFromDate = moment();
let cookieToDate = moment();

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMK2AfxqbaOzIK-1kDDDEPp8fvIrnceNw",
  authDomain: "cookie-diet-app-test.firebaseapp.com",
  projectId: "cookie-diet-app-test",
  storageBucket: "cookie-diet-app-test.appspot.com",
  messagingSenderId: "731483926360",
  appId: "1:731483926360:web:1f096b15dbca883d90ff2d"
};

// Firebase initialization
firebase.initializeApp(firebaseConfig);
const storageRef = firebase.storage().ref();
const db = firebase.firestore();
const functions = firebase.functions();

// Variables
let shopifyID; /*5210182090906*/
let userEmail;
let firstName;
let waistData = [];
let waistTimestampData = [];
let waistChartInstance = null; // To keep track of the Chart instance
let weightData = [];
let weightTimestampData = [];
let weightChartInstance = null; // To keep track of the Chart instance

// DOM Elements
const addWeightButton = document.getElementById('add-weight-button');
const addTargetWeightButton = document.getElementById('add-target-weight-button');
const addWaistlineButton = document.getElementById('add-waistline-button');
const saveAccountDetailsButton = document.getElementById('save-account-details');
const profilePicElement = document.getElementById('profile-pic');
const fileInputElement = document.getElementById('file-input');
const modalCookieButton = document.getElementById('modal-cookie-button');
const modalTrackingButton = document.getElementById('modal-tracking-button');
const profileForm = document.getElementById('profile-form');
const submitCookieFormButton = document.getElementById('submit-cookie-form');
const cookieTimeInput = document.getElementById('cookieTime');
const cookieDateInput = document.getElementById('cookieDate');
const fromDateInput = document.getElementById('from-date');
const toDateInput = document.getElementById('to-date');
const filterButton = document.getElementById('filter-button');
const cookieFromDateInput = document.getElementById('cookie-from-date');
const cookieToDateInput = document.getElementById('cookie-to-date');
const cookieFilterButton = document.getElementById('cookie-filter-button');
const cookieTable = document.getElementById('cookieTable');
const lastCookieElement = document.getElementById('last-cookie');
const cookieCounterElement = document.getElementById('cookie-counter');

// Event Listeners
document.addEventListener('DOMContentLoaded', function () {
  addWeightButton.addEventListener('click', addWeight);
  addTargetWeightButton.addEventListener('click', setTargetWeight);
  addWaistlineButton.addEventListener('click', addWaistlineMeasurement);
  saveAccountDetailsButton.addEventListener('click', saveAccountDetails);
  profilePicElement.addEventListener('click', openFileInput);
  modalCookieButton.addEventListener('click', displayCookieDataAndEatenCookies);
  modalTrackingButton.addEventListener('click', function() {
    loadWaistlineChart();
    loadWeightChart();
    calculateAndDisplayGoalDifference();
  });
  profileForm.addEventListener('submit', addProfilePic);
  submitCookieFormButton.addEventListener('click', submitCookieForm);
  fileInputElement.addEventListener('change', handleFileInputChange);
  fromDateInput.addEventListener('change', function() {
    fromDate = document.getElementById('from-date').value;
    toDate = document.getElementById('to-date').value;
    loadWeightChart();
    loadWaistlineChart();
  });
  toDateInput.addEventListener('change', function() {
    fromDate = document.getElementById('from-date').value;
    toDate = document.getElementById('to-date').value;
    loadWeightChart();
    loadWaistlineChart();
  });
  filterButton.addEventListener('click', function() {
    fromDate = document.getElementById('from-date').value;
    toDate = document.getElementById('to-date').value;
    loadWeightChart();
    loadWaistlineChart();
  });
  cookieFromDateInput.addEventListener('change', function() {
    cookieFromDate = document.getElementById('cookie-from-date').value;
    cookieToDate = document.getElementById('cookie-to-date').value;
    if(cookieToDate == "") {
      Tapcart.actions.showToast({
        type: "error",
        message: "Set end date for filtering." 
      })
    };
    displayCookieDataAndEatenCookies();
    lastEatenCookie();
  });
  cookieToDateInput.addEventListener('change', function() {
    cookieFromDate = document.getElementById('cookie-from-date').value;
    cookieToDate = document.getElementById('cookie-to-date').value;
    if(cookieFromDate == "") {
      Tapcart.actions.showToast({
        type: "error",
        message: "Set start date for filtering." 
      })
    };
    displayCookieDataAndEatenCookies();
    lastEatenCookie();
  });
  cookieFilterButton.addEventListener('click', function() {
    cookieFromDate = document.getElementById('cookie-from-date').value;
    cookieToDate = document.getElementById('cookie-to-date').value;
    if(cookieToDate == "" && cookieFromDate == "") {
      Tapcart.actions.showToast({
        type: "error",
        message: "Set start and end date for filtering." 
      })
    } else if (cookieToDate == "") {
      Tapcart.actions.showToast({
        type: "error",
        message: "Set end date for filtering." 
      })
      
    } else if(cookieFromDate == "") {
      Tapcart.actions.showToast({
        type: "error",
        message: "Set start date for filtering." 
      })
    };
    displayCookieDataAndEatenCookies();
    lastEatenCookie();
  });
});

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
  setInitialDateTime();
  getCustomerIdentity();
});

Tapcart.registerEventHandler("customer/updated", function (eventData) {
  shopifyID = undefined;
  getCustomerIdentity(); 
  Tapcart.actions.showToast({
    type: "success",
    message: "Event occurred: \"customer/updated\"" 
  })
});

// Set initial date and time values
function setInitialDateTime() {
  const currentDate = new Date();
  let day = currentDate.getDate();
  let month = currentDate.getMonth() + 1;
  let year = currentDate.getFullYear();
  let hours = currentDate.getHours();
  let minutes = currentDate.getMinutes();

  if (day < 10) day = '0' + day;
  if (month < 10) month = '0' + month;
  if (hours < 10) hours = '0' + hours;
  if (minutes < 10) minutes = '0' + minutes;

  cookieTimeInput.value = hours + ':' + minutes;
  cookieDateInput.value = year + '-' + month + '-' + day;
}

// Get customer identity
function getCustomerIdentity() {
  // shopifyID = '5210182090906';
  // renderAccountData();
  window.Tapcart.actions.getCustomerIdentity(null, {
    onSuccess: (res) => {
      // Parse the JSON response
      let customerData = JSON.parse(JSON.stringify(res));
      firstName = customerData.firstName;
      shopifyID = customerData.shopifyID;
      userEmail = customerData.email;
      renderAccountData();
    },
    onError: (error) => {
      // Handle the error here
      shopifyID = undefined;
      if (!isShopifyIDSet()) {
        destroyModalInstances();
      }
      Tapcart.actions.showToast({
        type: "error",
        message: "Please click the account icon located in the bottom right corner to log in."
      });
    },
  });
}

function showToast(message, duration) {
  var toast = document.createElement("div");
  toast.classList.add("toast");
  toast.textContent = message;
  document.body.appendChild(toast);
  // Check if duration is not provided or is falsy, then set it to 3000 milliseconds
  if (!duration) {
    duration = 3000;
  }
  setTimeout(function() {
    document.body.removeChild(toast);
  }, duration);
}

// Render account data
function renderAccountData() {
  // User is logged in, get their account details from Firestore
  db.collection('users').doc(shopifyID).get().then((doc) => {
    if (doc.exists) {
      Tapcart.actions.showToast({
        type: "success",
        message: "Account successfully loaded."
      });
      const data = doc.data();
      // Replace the account details with the user's information
      document.getElementById('first-name').value = data.firstName || '';
      document.getElementById('last-name').value = data.lastName || '';
      document.getElementById('email').value = data.email || '';
      if (data.dob !== '' && data.dob !== undefined) {
        document.getElementById('dob').value = data.dob;
      }
      if (data.profilePicture) {
        document.getElementById('profile-pic').src = data.profilePicture;
      } else {
        document.getElementById('profile-pic').src = 'https://cdn.shopify.com/s/files/1/0434/0246/1338/files/user-profile-placeholder.png?v=1694655743';
      }
      var elems = document.querySelectorAll('.modal');
      modalInstances = M.Modal.init(elems);
      scheduleCookieReminder();
      lastEatenCookie();
    } else {

      db.collection('users')
        .doc(shopifyID)
        .set({
          firstName: firstName,
          email: userEmail,
        })
        .then(() => {
          Tapcart.actions.showToast({
            type: "success",
            message: "Welcome to our platform, " + firstName + "! Your account is now activated and ready to use."
          });
          renderAccountData();
        })
        .catch((error) => {
          Tapcart.actions.showToast({
            type: "error",
            message: "Error activating account. Force close the app and restart or contact support."
          });
        });
    }
  }).catch((error) => {
    Tapcart.actions.showToast({
      type: "error",
      message: "Error getting document:" + error
    });
  });
}


// Function to save account details
function saveAccountDetails() {
  // Get the input values
  const firstName = document.getElementById('first-name').value;
  const lastName = document.getElementById('last-name').value;
  const email = document.getElementById('email').value;
  const dob = document.getElementById('dob').value;

  // Create an object to store the fields to update
  const updateFields = {};

  // Conditionally add fields to the update object if they are not null or empty
  if (firstName.trim() !== '') {
    updateFields.firstName = firstName;
  }
  if (lastName.trim() !== '') {
    updateFields.lastName = lastName;
  }
  if (email.trim() !== '') {
    updateFields.email = email;
  }
  if (dob.trim() !== '') {
    updateFields.dob = dob;
  }

  // Check if there are fields to update
  if (Object.keys(updateFields).length === 0) {
    // No valid fields to update, show a message or take appropriate action
    Tapcart.actions.showToast({
      type: "error",
      message: "No valid fields to update."
    });
    return; // Exit the function
  }

  // Update the account details in Firestore with the non-empty values
  db.collection('users').doc(shopifyID).update(updateFields)
    .then(() => {
      Tapcart.actions.showToast({
        type: "success",
        message: "Account details updated successfully!"
      });
    })
    .catch((error) => {
      Tapcart.actions.showToast({
        type: "error",
        message: "Error updating account details: " + error
      });
    });
}


// Initialize datepickers
document.addEventListener('DOMContentLoaded', function () {
  const fromDatePicker = document.getElementById('from-date');
  const toDatePicker = document.getElementById('to-date');
  const fromDateInstance = M.Datepicker.init(fromDatePicker);
  const toDateInstance = M.Datepicker.init(toDatePicker);
});

// Schedule the next cookie reminder
function scheduleCookieReminder() {
  const currentTime = new Date();
  const nextReminderTime = new Date(currentTime.getTime() + (2 * 60 * 60 * 1000)); // Add 2 hours to current time

  // Schedule the next reminder
  setTimeout(() => {
    Tapcart.actions.showToast({
      type: "success",
      message: "Time to eat another cookie!"
    });
    scheduleCookieReminder();
  }, nextReminderTime - currentTime);
}

// Add waistline measurement
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
        Tapcart.actions.showToast({
          type: "success",
          message: "Waistline measurement added successfully"
        });
        loadWaistlineChart();
      })
      .catch((error) => {
        Tapcart.actions.showToast({
          type: "error",
          message: "Error adding waistline measurement" + error
        });
      });
  } else {
    Tapcart.actions.showToast({
      type: "error",
      message: "Invalid waistline measurement input"
    });
  }
}

// Load waistline chart
function loadWaistlineChart() {
  waistData = [];
  waistTimestampData = [];
  // Retrieve waistline data from Firebase and format for Chart.js
  db.collection('users').doc(shopifyID).collection('waistlineMeasurements')
    .orderBy('timestamp')
    .where(
      'timestamp',
      '>=',
      firebase.firestore.Timestamp.fromMillis(new Date(fromDate).setHours(0, 0, 0, 0))
    )
    .where(
      'timestamp',
      '<=',
      firebase.firestore.Timestamp.fromMillis(new Date(toDate).setHours(23, 59, 59, 999))
    )
    .limit(10) // Load the last 10 entries within the date range
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

// Function to update the waistline chart
function updateWaistChart() {
  const ctx = document.getElementById('waistlineChart').getContext('2d');
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
    },
  };

  // Check if the Chart instance exists and destroy it before creating a new one
  if (waistChartInstance) {
    waistChartInstance.destroy();
  }

  waistChartInstance = new Chart(ctx, {
    type: 'line',
    data: data,
    options: waistOptions,
  });
}

// Function to format waistline data for Chart.js
function formatWaistlineData() {
  const data = {
    labels: waistTimestampData,
    datasets: [
      {
        label: 'Waistline (cm)',
        data: waistData,
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
      },
    ],
  };
  return data;
}

function displayGoalDifference(difference) {
  const goalDifferenceElement = document.getElementById('goalDifference');
  if (difference > 0) {
    goalDifferenceElement.innerHTML = `<i class="material-icons green-text">trending_up</i> You are <b>${difference.toFixed(2)}KG</b> below your goal.`;
  } else if (difference < 0) {
    goalDifferenceElement.innerHTML = `<i class="material-icons red-text">trending_down</i> You are <b>${Math.abs(difference).toFixed(2)}KG</b> above your goal.`;
  } else {
    goalDifferenceElement.innerHTML = `<i class="material-icons green-text">check_circle</i> You have reached your goal weight!`;
  }
  document.getElementById('target-weight').style.display = 'block';
}


async function calculateAndDisplayGoalDifference() {
  try {
    const weightsRef = db.collection('users').doc(shopifyID).collection('weights');

    // Query for the last weight entry
    const querySnapshot = await weightsRef.orderBy('timestamp', 'desc').limit(1).get();

    if (!querySnapshot.empty) {
      const lastWeightEntry = querySnapshot.docs[0].data();
      const lastWeight = parseFloat(lastWeightEntry.weight);
      const userRef = db.collection('users').doc(shopifyID);
      const userDoc = await userRef.get();
      const targetWeight = userDoc.data().targetWeight;

      if (lastWeight) {
        let difference = targetWeight - lastWeight;
        if (typeof targetWeight !== 'undefined' && targetWeight !== null) {
          document.getElementById('currentWeight').innerHTML = `Current Weight: <b>${lastWeight.toFixed(2)}KG</b>`;
          document.getElementById('targetWeight').innerHTML = `Target Weight: <b>${targetWeight.toFixed(2)}KG</b>`;
          displayGoalDifference(difference);
        } else {
          document.getElementById('target-weight').style.display = 'none';
        }
      } else {
        Tapcart.actions.showToast({
          type: "error",
          message: "Last weight entry is invalid"
        });
      }
    } else {
      Tapcart.actions.showToast({
        type: "success",
        message: "Time to kickstart your journey by adding some weight entries!"
      });
    }
  } catch (error) {
    Tapcart.actions.showToast({
      type: "error",
      message: "Error: " + error
    });
  }
}


function setTargetWeight() {
  let targetWeightInput = document.getElementById('targetWeightInput').value;
  if (targetWeightInput === '') {
    Tapcart.actions.showToast({
      type: "error",
      message: "Please enter a target weight"
    });
    return; // Exit the function if no target weight input
  }

  let targetWeight = parseFloat(targetWeightInput);
  if (isNaN(targetWeight)) {
    Tapcart.actions.showToast({
      type: "error",
      message: "Invalid target weight input"
    });
    return; // Exit the function if target weight is not a valid number
  }

  // Create a reference to the user's document where you want to store the goal weight
  const userRef = db.collection('users').doc(shopifyID);

  // Update the targetWeight field in the user's document without affecting other fields
  userRef.update({
    targetWeight: targetWeight
  })
  .then(() => {
    Tapcart.actions.showToast({
      type: "success",
      message: "Goal weight set successfully"
    });
    // After setting the goal weight, recalculate and display the difference
    calculateAndDisplayGoalDifference();
  })
  .catch((error) => {
    Tapcart.actions.showToast({
      type: "error",
      message: "Error setting goal weight: " + error
    });
  });
}



// Add weight
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
        Tapcart.actions.showToast({
          type: "success",
          message: "Weight added successfully"
        });
        calculateAndDisplayGoalDifference();
      })
      .catch((error) => {
        Tapcart.actions.showToast({
          type: "error",
          message: "Error adding weight" + error
        });
      });
  } else {
    Tapcart.actions.showToast({
      type: "error",
      message: "Invalid weight input"
    });
  }
}

// Handle file input change
function handleFileInputChange() {
  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0];
  const fileName = Date.now() + '-' + file.name;
  const uploadTask = storageRef.child('profile-pictures/' + fileName).put(file);

  // Listen for upload completion
  uploadTask.on('state_changed', function(snapshot) {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    Tapcart.actions.showToast({
      type: "success",
      message: "Upload is " + progress + "% done"
    });
  }, function(error) {
    Tapcart.actions.showToast({
      type: "error",
      message: "Error uploading profile picture: " + error
    });
  }, function() {
    // Get the download URL of the uploaded file
    uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
      db.collection('users').doc(shopifyID).update({
        profilePicture: downloadURL
      }).then(function() {
        document.getElementById('profile-pic').src = downloadURL;
        Tapcart.actions.showToast({
          type: "success",
          message: "Profile picture updated successfully!"
        });
      }).catch(function(error) {
        Tapcart.actions.showToast({
          type: "error",
          message: "Error updating profile picture: " + error
        });
      });
    });
  });
}


function loadWeightChart() {
  weightData = [];
  weightTimestampData = []; // Clear the weightTimestampData array

  // Retrieve weight data from Firebase and format for Chart.js
  db.collection('users')
    .doc(shopifyID)
    .collection('weights')
    .orderBy('timestamp')
    .where(
      'timestamp',
      '>=',
      firebase.firestore.Timestamp.fromMillis(new Date(fromDate).setHours(0, 0, 0, 0))
    )
    .where(
      'timestamp',
      '<=',
      firebase.firestore.Timestamp.fromMillis(new Date(toDate).setHours(23, 59, 59, 999))
    )
    .limit(10) // Load the last 10 entries within the date range
    .onSnapshot((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp && data.timestamp.toDate();

        // Check if the timestamp is valid
        if (timestamp instanceof Date && !isNaN(timestamp)) {
          weightData.push(data.weight);
          weightTimestampData.push(timestamp.toLocaleDateString()); // Format timestamp as needed
        }
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

// Update weight chart
function updateWeightChart() {
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
    Tapcart.actions.showToast({
      type: "success",
      message: "Cookie Successfully Added"
    });
    // Clear form inputs
    displayCookieDataAndEatenCookies();
    lastEatenCookie();
  })
  .catch(function(error) {
    Tapcart.actions.showToast({
      type: "error",
      message: "Error adding document: " + error
    });
  });
}

// Display cookie data in a table and count eaten cookies
function displayCookieDataAndEatenCookies() {
  const cookieTable = document.getElementById('cookieTable');
  cookieTable.getElementsByTagName('tbody')[0].innerHTML = '';
  let cookiesEaten = 1;
  db.collection('users').doc(shopifyID).collection('cookies')
    .orderBy('timestamp')
    .where(
      'timestamp',
      '>=',
      firebase.firestore.Timestamp.fromMillis(new Date(cookieFromDate).setHours(0, 0, 0, 0))
    )
    .where(
      'timestamp',
      '<=',
      firebase.firestore.Timestamp.fromMillis(new Date(cookieToDate).setHours(23, 59, 59, 999))
    )
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
              Tapcart.actions.showToast({
                type: "success",
                message: "Cookie deleted from history"
              });
              displayCookieDataAndEatenCookies();
            })
            .catch((error) => {
              Tapcart.actions.showToast({
                type: "error",
                message: "Error deleting Cookie: " + error
              });
            });
        });
      });
      cookiesEaten = querySnapshot.size;
      displayEatenCookies(cookiesEaten);
    })
    .catch((error) => {
      Tapcart.actions.showToast({
        type: "error",
        message: "Error getting documents: " + error
      });
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

// Display eaten cookies
function displayEatenCookies(cookiesEaten) {
  var cookieCounterElem = document.getElementById('cookie-counter');
  var cookieElems = cookieCounterElem.querySelectorAll('.material-icons');

  // Remove active cookies before function initializes
  cookieElems.forEach(elem => {
    elem.classList.remove('primary-text');
  });

  // Check if cookiesEaten is greater than 9
  if (cookiesEaten > 0 && cookiesEaten <= 9) {
    for (let i = 0; i < cookiesEaten; i++) {
      cookieElems[i].classList.add('primary-text');
    }

  } else if (cookiesEaten <= 0) {
    Tapcart.actions.showToast({
      type: "success",
      message: "Start tracking your Cookies!"
    });
  } else {
    Tapcart.actions.showToast({
      type: "error",
      message: "You can view the history below, but please note that we can't display more than 8 cookies simultaneously."
    });
  }
}

// Calculate last eaten cookie time
function lastEatenCookie() {
  db.collection('users')
  .doc(shopifyID)
  .collection('cookies')
  .where(
    'timestamp',
    '>=',
    firebase.firestore.Timestamp.fromMillis(new Date(cookieFromDate).setHours(0, 0, 0, 0))
  )
  .where(
    'timestamp',
    '<=',
    firebase.firestore.Timestamp.fromMillis(new Date(cookieToDate).setHours(23, 59, 59, 999))
  )
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

      document.getElementById('last-cookie').innerHTML = 'You had your last Cookie <b>' + formattedTimeDifference + '</b> ago.';
    } else {
      document.getElementById('last-cookie').innerHTML = '';
    }
  })
  .catch(function(error) {
    Tapcart.actions.showToast({
      type: "error",
      message: "Error retrieving data: " + error
    });
  });
}

var modalTriggers = document.querySelectorAll('.modal-trigger');
var modalInstances = null; // Initialize modalInstances outside the event listener scope


modalTriggers.forEach(function (modalTrigger) {
  modalTrigger.addEventListener('click', function (event) {
    // Prevent the default click behavior
    event.preventDefault();

    // Check if shopifyID is set
    if (!isShopifyIDSet()) {
      Tapcart.actions.showToast({
        type: "error",
        message: "Please click the account icon located in the bottom right corner to log in."
      })
    } else {
      // Destroy existing modal instances if they exist
      if (modalInstances) {
        modalInstances.forEach(function (instance) {
          instance.destroy();
        });
      }

      var elems = document.querySelectorAll('.modal');
      modalInstances = M.Modal.init(elems);
    }
  });
});

// Function to check if Shopify ID is set (you can replace this with your implementation)
function isShopifyIDSet() {
  // Replace with your logic to check if Shopify ID is set
  return typeof shopifyID !== 'undefined' && shopifyID !== null;
}

// Function to destroy modal instances when a user logs out
function destroyModalInstances() {
  if (modalInstances) {
    modalInstances.forEach(function (instance) {
      instance.destroy();
    });
  }
}

// Function to show toast messages
function showToast(message, duration) {
  var toast = document.createElement("div");
  toast.classList.add("toast");
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(function() {
    document.body.removeChild(toast);
  }, 3000);
}

// Function to schedule the next cookie reminder
function scheduleCookieReminder() {
  const currentTime = new Date();
  const nextReminderTime = new Date(currentTime.getTime() + (2 * 60 * 60 * 1000)); // Add 2 hours to current time

  // Schedule the next reminder
  setTimeout(() => {
    Tapcart.actions.showToast({
      type: "success",
      message: "Time to eat another cookie!"
    });
    scheduleCookieReminder();
  }, nextReminderTime - currentTime);
}

// Initialize date variables
var currentDate = new Date();
var day = currentDate.getDate();
var month = currentDate.getMonth() + 1;
var year = currentDate.getFullYear();
var hours = currentDate.getHours();
var minutes = currentDate.getMinutes();

if (day < 10) day = '0' + day;
if (month < 10) month = '0' + month;
if (hours < 10) hours = '0' + hours;
if (minutes < 10) minutes = '0' + minutes;

var today = year + '-' + month + '-' + day;
var currentTime = hours + ':' + minutes;

// Initialize date and time input fields
document.getElementById('cookieDate').value = today;
document.getElementById('cookieTime').value = currentTime;

// Function to add a new profile picture
function addProfilePic(event) {
  event.preventDefault();

  // Get the selected file
  var fileInput = document.getElementById('file-input');
  var file = fileInput.files[0];

  // Check if a file is selected
  if (file) {
    var reader = new FileReader();

    reader.onload = function(event) {
      var img = new Image();
      img.src = event.target.result;

      img.onload = function() {
        // Create a canvas element to resize the image
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        // Set the canvas size to the desired dimensions (e.g., 300x300 pixels)
        canvas.width = 300;
        canvas.height = 300;

        // Draw the image on the canvas, resizing it
        ctx.drawImage(img, 0, 0, 300, 300);

        // Convert the canvas image to a Blob
        canvas.toBlob(function(blob) {
          // Create a storage reference for the file
          var storageRef = firebase.storage().ref().child('profile-pictures/' + file.name);

          // Upload the resized file to Firebase Storage
          storageRef.put(blob).then(function(snapshot) {
            // Get the download URL for the file
            snapshot.ref.getDownloadURL().then(function(downloadURL) {
              // Update the profile picture in Firestore
              db.collection('users').doc(shopifyID).update({
                profilePicture: downloadURL
              }).then(function() {
                // Update the profile picture displayed on the page
                document.getElementById('profile-pic').src = downloadURL;
                Tapcart.actions.showToast({
                  type: "success",
                  message: "Profile picture updated successfully!"
                });
              }).catch(function(error) {
                Tapcart.actions.showToast({
                  type: "error",
                  message: "Error updating profile picture: " + error
                });
              });
            });
          }).catch(function(error) {
            Tapcart.actions.showToast({
              type: "error",
              message: "Error uploading profile picture: " + error
            });
          });
        }, file.type);
      };
    };

    reader.readAsDataURL(file);
  } else {
    Tapcart.actions.showToast({
      type: "error",
      message: "Please select a file to upload"
    });
  }
}

// Function to open the file input dialog when the profile picture is clicked
function openFileInput() {
  document.getElementById('file-input').click();
}

// Function to initialize datepicker fields
document.addEventListener('DOMContentLoaded', function() {
  var datepickerOptions = {
    format: 'yyyy-mm-dd',
    autoClose: true
  };

  var datepickerElements = document.querySelectorAll('.datepicker');
  M.Datepicker.init(datepickerElements, datepickerOptions);
});

// Function to initialize materialize select inputs
document.addEventListener('DOMContentLoaded', function() {
  var selectOptions = {};
  var selectElements = document.querySelectorAll('select');
  M.FormSelect.init(selectElements, selectOptions);
});

// Function to initialize timepicker fields
document.addEventListener('DOMContentLoaded', function() {
  var timepickerOptions = {
    twelveHour: false
  };

  var timepickerElements = document.querySelectorAll('.timepicker');
  M.Timepicker.init(timepickerElements, timepickerOptions);
});
