document.addEventListener("DOMContentLoaded", function() {
  var second = 1000,
      minute = second * 60,
      hour = minute * 60,
      day = hour * 24;

  function getSydneyTime() {
      var now = new Date();
      var utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      var offset = 10; // Sydney is UTC+10 normally
      return new Date(utc + (3600000 * offset));
  }

  // Retrieve the end date from the data attribute
  var endDateElement = document.querySelector('.timer');
  if (!endDateElement) return;
  
  var endDate = endDateElement.getAttribute('data-end-date');
  var countDown = new Date(endDate + ' 23:59:59 GMT+1000').getTime(); // Explicitly setting the end date to Sydney time zone

  var x = setInterval(function() {
      var now = getSydneyTime().getTime();
      var distance = countDown - now;

      if (distance < 0) {
          clearInterval(x);
          document.querySelector('.timer').classList.add('timer--expired');
          return;
      }

      document.querySelector('.js-timer-days').innerText = Math.max(Math.floor(distance / day), 0).toString().padStart(2, '0');
      document.querySelector('.js-timer-hours').innerText = Math.max(Math.floor((distance % day) / hour), 0).toString().padStart(2, '0');
      document.querySelector('.js-timer-minutes').innerText = Math.max(Math.floor((distance % hour) / minute), 0).toString().padStart(2, '0');
      document.querySelector('.js-timer-seconds').innerText = Math.max(Math.floor((distance % minute) / second), 0).toString().padStart(2, '0');
  }, second);
});
