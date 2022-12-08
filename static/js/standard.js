

document.addEventListener("DOMContentLoaded", async function (event) {

  const url = "/api/user/auth";
  let data = await fetch(url, {
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


  if (data['data'] != null) {
    document.getElementById("authentication-registration-link").innerText = "";
    document.getElementById("authentication-registration-link").innerText = "登出";
    document.getElementById("authentication-registration-link").setAttribute("onClick", "popup_user_logout_box()");
  }else{
    document.getElementById("authentication-registration-link").innerText = "";
    document.getElementById("authentication-registration-link").innerText = "登入/註冊";
    document.getElementById("authentication-registration-link").setAttribute("onClick", "popup_user_login_box()");
  }

});


function navigate_to_homepage() {
  window.location.replace("/");
}

document.addEventListener('click', (e) => {
  if (e.target == document.getElementById("dimmed-background") || e.target == document.getElementById("icon-close")) {
    close_box();
  }
});

function close_box() {
  document.getElementById("dimmed-background").remove();
  enableScrolling();
}


function disableScrolling() {
  var x = window.scrollX;
  var y = window.scrollY;
  window.onscroll = function () { window.scrollTo(x, y); };
}

function enableScrolling() {
  window.onscroll = function () { };
}

function popup_user_login_box() {
  if (document.getElementById("dimmed-background")) {
    document.getElementById("dimmed-background").remove();

  }

  insertHTML = `  <div id="dimmed-background">
  <div id="login-registration-box">
  <div id="icon-close">&times;</div>
    <form  onsubmit="user_login();return false">
      <h3>登入會員帳號</h3>
      <input type="text" class="body" name="email" id="login-registration-box-email" placeholder="輸入電子信箱" required><br>
      <input type="password" class="body" name="password" id="login-registration-box-password" placeholder="輸入密碼" required><br>
      <button id="login-box-button" type="submit" class="btn">登入帳戶</button>
      <form>
    <div class="body">還沒有帳戶？點此<a onclick="popup_user_registration_box()">註冊</a></div>
  </div>
  </div>
`;

  document.body.insertAdjacentHTML("afterbegin", insertHTML);
  disableScrolling();
}

function popup_user_registration_box() {
  if (document.getElementById("dimmed-background")) {
    document.getElementById("dimmed-background").remove();

  }
  insertHTML = `  <div id="dimmed-background">
  <div id="login-registration-box">
  <div id="icon-close">&times;</div>
  <form  onsubmit="user_registration();return false">
      <h3>註冊會員帳號</h3>
      <input type="text" class="body" name="name" id="login-registration-box-name" placeholder="輸入姓名" required><br>
      <input type="email" class="body" name="email" id="login-registration-box-email" placeholder="輸入電子信箱" required><br>
      <input type="password" class="body" name="password" id="login-registration-box-password" placeholder="輸入密碼" required><br>
      <button id="registraion-box-button" type="submit"  class="btn">註冊新帳戶</button>
      <form>
    <div class="body">已經有帳戶了？點此<a onclick="popup_user_login_box()">登入</a></div>
  </div>
  </div>
`;

  document.body.insertAdjacentHTML("afterbegin", insertHTML);
  disableScrolling();
}



async function user_registration() {

  username = document.getElementById('login-registration-box-name').value;
  email = document.getElementById('login-registration-box-email').value;
  password = document.getElementById('login-registration-box-password').value;


  const url = "api/user";
  let data = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json ; charset=UTF-8'
    },
    body: JSON.stringify({
      name: username,
      email: email,
      password: password
    })
  })
    .then((response) => response.json())
    .then((responseData) => {
      console.log(responseData);
      return responseData;
    })
    .catch(error => console.warn(error));

  if (document.getElementById("login-registration-result-message")) {
    document.getElementById("login-registration-result-message").remove()
  }
  if (data["ok"]) {

    insertHTML = ` <div class="body" id="login-registration-result-message"> 註冊成功 </div>`
    document.getElementById("login-registration-box").insertAdjacentHTML("beforeend", insertHTML);
    document.getElementById("login-registration-box-name").value = "";
    document.getElementById("login-registration-box-email").value = "";
    document.getElementById("login-registration-box-password").value = "";


  } else {

    insertHTML = ` <div class="body" id="login-registration-result-message">` + data["message"] + `</div>`
    document.getElementById("login-registration-box").insertAdjacentHTML("beforeend", insertHTML);
  }

}

async function user_login() {
  email = document.getElementById('login-registration-box-email').value;
  password = document.getElementById('login-registration-box-password').value;


  const url = "/api/user/auth";
  let data = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json ; charset=UTF-8'
    },
    withCredentials: true,
    body: JSON.stringify({
      email: email,
      password: password
    })
  })
    .then((response) => response.json())
    .then((responseData) => {
      console.log(responseData);
      return responseData;
    })
    .catch(error => console.warn(error));

  if (document.getElementById("login-registration-result-message")) {
    document.getElementById("login-registration-result-message").remove()
  }

  if (data.hasOwnProperty("ok")) {

    location.href = "/"

  } else {

    insertHTML = ` <div class="body" id="login-registration-result-message"> ` + data["message"] + `</div>`
    document.getElementById("login-registration-box").insertAdjacentHTML("beforeend", insertHTML);
    console.log("delete cookies")


    delete_cookie("token");


  }



}

function getCookie(cookieName) {
  let cookie = {};
  document.cookie.split(';').forEach(function (el) {
    let [key, value] = el.split('=');
    cookie[key.trim()] = value;
  })
  return cookie[cookieName];
}



function delete_cookie(name) {
  document.cookie = name + '=; Path=/; Max-Age=-99999999;';

}



async function user_logout() {
  const url = "/api/user/auth";
  let data = await fetch(url, {
    method: 'DELETE',

  })
    .then((response) => response.json())
    .then((responseData) => {
      console.log(responseData);
      return responseData;
    })
    .catch(error => console.warn(error));


  delete_cookie('token');

  location.href = "/"

}

function popup_user_logout_box() {
  if (document.getElementById("dimmed-background")) {
    document.getElementById("dimmed-background").remove();

  }

  insertHTML = `  <div id="dimmed-background">
  <div id="login-registration-box">
  <div id="icon-close">&times;</div>
  <h3>確定要登出嗎</h3>
  <button id="logout-box-button-confirm" onclick="user_logout()" class="btn">確定</button>
  <button id="logout-box-button-cancel" onclick="close_box()" class="btn">取消</button>
  </div></div>`;

  document.body.insertAdjacentHTML("afterbegin", insertHTML);
  disableScrolling();
}

