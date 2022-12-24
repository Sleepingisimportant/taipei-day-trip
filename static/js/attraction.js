let slideIndex = 1;
const attrId = getAttractionId();
let price=2000;


document.addEventListener("DOMContentLoaded", function (event) {

  renderPage();
  document.getElementById('bookingDatePicker').valueAsDate = new Date();


});


function getAttractionId() {
  const attrId = window.location.href.split("/").pop();
  return !isNaN(attrId) ? attrId : null;
}

async function renderPage() {
  const url = '/api/attraction/' + attrId;

  let fetchedData = await fetch(url, {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((responseData) => {
      console.log(responseData);
      return responseData;
    })
    .catch(error => console.warn(error));

  data = fetchedData["data"]
  description = data["description"]
  address = data["address"]
  transport = data["transport"]
  mrt = data["mrt"]
  attractionName = data["name"]
  category = data["category"]
  images = data["images"]

  await get_images(images);

  imgTitleAndBooking = `   <h3> ` + attractionName + `  </h3>
  <p class="body">` + category + `at ` + mrt + `</span> `;
  document.getElementById('imgTitle-and-booking').insertAdjacentHTML("afterbegin", imgTitleAndBooking);


  attractionInfoDescription = ` <p class="content">` + description + `</p>`
  document.getElementById('attraction-info-description').insertAdjacentHTML("afterbegin", attractionInfoDescription);

  attractionInfoAddress = ` <p class="content">` + address + `</p>`
  document.getElementById('attraction-info-address').insertAdjacentHTML("beforeend", attractionInfoAddress);

  attractionInfoTransportation = ` <p class="content">` + transport + `</p>`
  document.getElementById('attraction-info-transportation').insertAdjacentHTML("beforeend", attractionInfoTransportation);

}

async function get_images(images) {
  for (let i = 0; i < images.length; i++) {

    slide = "<div class='mySlides fade'><img src='" + images[i] + "'></div>";
    document.getElementById('slideshow-container-image').insertAdjacentHTML("afterbegin", slide);

    dot = "<span class='dot' onclick='currentSlide(" + (i + 1) + ")'></span>";
    document.getElementById('slideshow-dots').insertAdjacentHTML("beforeend", dot);

  }
  showSlides(slideIndex);
}




function get_package_price(clicked_id) {

  if (clicked_id == "booking-forenoon") {
    document.getElementById("booking-cost").textContent = "2,000";
    price= 2000;
  } else if (clicked_id == "booking-afternoon") {
    document.getElementById("booking-cost").textContent = "2,500";
    price= 2500;

  }
}



// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");

  if (n > slides.length) { slideIndex = 1 }
  if (n < 1) { slideIndex = slides.length }

  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }

  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
}


async function confirm_booking() {

  const url = "/api/user/auth";
  let data_auth = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json ; charset=UTF-8'
    }
  })
    .then((response) => response.json())
    .then((responseData) => {
      console.log(responseData);
      return responseData;
    })
    .catch(error => console.warn(error));

  if (data_auth['data'] == null) {
    popup_user_login_box("/booking");

  } else {

    date = document.getElementById('bookingDatePicker').value;
    
    if (document.getElementById('booking-forenoon').checked) {
      time = 0;
    } else {
      time = 1;
    };


    const url = "/api/booking";
    let data = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json ; charset=UTF-8'
      },
      body: JSON.stringify({
        memberId: data_auth['data']['id'],
        attractionId: attrId,
        date: date,
        time: time,
        price: price,
      })
    })
      .then((response) => response.json())
      .then((responseData) => {
        console.log(responseData);
        return responseData;
      })
      .catch(error => console.warn(error));

      if(data.hasOwnProperty("ok")){
        location.href = "/booking";
      }else{
        //to be added
      }

  }
}