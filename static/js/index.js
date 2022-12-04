let nextPage;
let keyword = "";
let isLoading = false;



document.addEventListener("DOMContentLoaded", function (event) {

  // load first page
  if (isLoading == false) {
    get_first_page();

  }


  // fold searchbar category list if click somewhere other than category list
  document.addEventListener('click', (e) => {
    if (e.target != document.getElementById("#banner-searchbar")) {
      let categorylist = document.getElementById("banner-searchbar-category-list");
      if (categorylist !== null) {
        categorylist.remove();
      }
    }
  });

});


// check if a user hit the bottom of the page
window.onscroll = function () {


  var totalPageHeight = document.body.scrollHeight;

  var scrollPoint = window.scrollY + window.innerHeight;

  if (scrollPoint == totalPageHeight) {

    if (nextPage != null && isLoading == false) {
      load_page();

    }
  }
}


function clicked_searchbar_button() {

  search_keyword();
}


async function show_posts(data, appendedElementID) {

  for (let i = 0; i < data.length; i++) {

    image = data[i]["images"][0];
    attractionName = data[i]["name"];
    mrt = data[i]["mrt"];
    category = data[i]["category"];
    id = data[i]["id"];


    const div = document.createElement('div');

    div.innerHTML = `   <div class="post-default" onclick="navigate_to_attraction_page(this.id)" id=` + id + `>
        <div class="post-default-image">
          <img src=` + image + `  alt=` + attractionName + ` >
        </div>
        <div class="post-default-title">
          <p>` + attractionName + `</p>
        </div>
        <div class="post-default-subtitle">
      <a>` + mrt + `</a><a>` + category + `</a></div>
      </div>`;

    document.getElementById(appendedElementID).appendChild(div);

  }

  if (window.innerWidth > 1200) {
    emptybox = 4 - (data.length % 4);
    if (emptybox == 4) {
      emptybox = 0;
    }

  } else if (window.innerWidth <= 1200 && window.innerWidth > 1000) {
    emptybox = 3 - (data.length % 3);
    if (emptybox == 3) {
      emptybox = 0;
    }

  } else if (window.innerWidth <= 1000 && window.innerWidth > 666) {
    emptybox = data.length % 2;
    if (emptybox == 2) {
      emptybox = 0;
    }
  }

  for (let i = 0; i < emptybox; i++) {
    const div = document.createElement('div');


    div.innerHTML = `   <div class="post-default" style="visibility: hidden;">
        <div class="post-default-image">
          <img >
        </div>
        <div class="post-default-title">
          <p></p>
        </div>
        <div class="post-default-subtitle">
    
      </div>`;

    document.getElementById(appendedElementID).appendChild(div);
  }
}


async function get_first_page() {
  isLoading = true;

  nextPage = 0;

  const url = 'api/attractions?page=' + nextPage;

  fetchedData = await api_fetch(url);

  nextPage = fetchedData["nextPage"];
  data = fetchedData["data"];


  show_posts(data, "main-content-default");
  isLoading = false;

}


function navigate_to_attraction_page(attractionId) {
  window.location.replace("/attraction/" + attractionId);
}


function populate_category_name(categoryName) {
  keyword = categoryName;
  document.getElementById('banner-searchbar-input').value = categoryName;
  let categorylist = document.getElementById("banner-searchbar-category-list");
  categorylist.remove();
}


async function load_page() {
  isLoading = true;


  if (keyword == "") {
    url = 'api/attractions?page=' + nextPage

  } else {
    url = 'api/attractions?page=' + nextPage + '&keyword=' + keyword

  }

  fetchedData = await api_fetch(url);

  data = fetchedData["data"];
  nextPage = fetchedData["nextPage"];


  show_posts(data, "main-content-default");
  isLoading = false;

}

function searchbar_keydown_enter(e) {
  if (e.key == "Enter") {
    isLoading = true;

    search_keyword();
    isLoading = false;
  }
}

async function api_fetch(url) {
  let fetchedData = await fetch(url, {
    method: 'GET',
  })
    .then((response) => response.json())
    .then((responseData) => {
      console.log(responseData);
      return responseData;
    })
    .catch(error => console.warn(error));

  return fetchedData
}

async function search_keyword() {


  keyword = document.getElementById('banner-searchbar-input').value;

  nextPage = 0;

  const url = 'api/attractions?page=' + nextPage + '&keyword=' + keyword;


  fetchedData = await api_fetch(url);

  data = fetchedData["data"];
  nextPage = fetchedData["nextPage"];

  document.getElementById("main-content-default").innerHTML = "";

  if (data.length > 0) {
    show_posts(data, "main-content-default");

  } else {
    document.getElementById("main-content-default").innerHTML = "";

    const div = document.createElement('div');
    div.id = "result-none-content"
    div.innerHTML = `<h2>
          搜尋`+ keyword + `沒有找到任何內容，請輸入其他關鍵字
        </h2>`;

    document.getElementById("main-content-default").appendChild(div);

  }

};


async function unfold_searchbar_category_list() {

  let categorylist = document.getElementById("banner-searchbar-category-list");
  if (categorylist) {
    categorylist.remove();
  }

  const url = 'api/categories';
  fetchedData = await api_fetch(url);


  data = fetchedData["data"];

  const div = document.createElement('div');
  div.id = "banner-searchbar-category-list";
  document.getElementById("banner-searchbar").appendChild(div);


  for (let i = 0; i < data.length; i++) {

    const div = document.createElement('a');
    div.text = data[i];
    div.setAttribute("onclick", "populate_category_name(this.text)");
    document.getElementById("banner-searchbar-category-list").appendChild(div);
  }

};