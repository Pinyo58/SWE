$(document).ready(function() {
  $("#submit").on("click", function() {
    console.log(document.getElementById('username').value.trim(),document.getElementById('password').value.trim());
    //login();
  });

  $('#input-password').keyup(function(event) {
    if (event.which == 13) {
      event.preventDefault();
      //login();
    }
  });
});

var login = function () {
  $.ajax({
    type: "POST",
    beforeSend: function(request) {
      request.setRequestHeader("user", document.getElementById('username').value.trim());
      request.setRequestHeader("pass", document.getElementById('password').value.trim());
    },
    url: urlEndpoint + '/login',
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: loginCallback,
    error: OnErrorLogin
  });
};

var OnErrorLogin = function (data) {
  if (data.readyState === 0) {
    document.getElementById('notificationDiv').className = 'alert alert-danger alert-dismissible';
    document.getElementById('notification').innerText = '*ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง';
  } else {
    alert( 'มีผิดพลาดกรุณาลองใหม่อีกครั้ง --> <br/>' + JSON.stringify(data));
  }
};

var loginCallback =function(data, textStatus, request){
  console.log(data);
  if (data.status) {
    //sessionStorage.setItem("staffId", document.getElementById('username').value);
    //sessionStorage.setItem("token",  request.getResponseHeader('Authorization'));

    var url = urlEndpoint + 'mongodb/cores/role_db/query';
    var obj = {
      "query":{
        "application": "cct",
        "user": document.getElementById('username').value.trim()
      }
    };
    Post(url, obj, getUserDataCallback, OnErrorLogin);
  } else {
    //document.getElementById('notificationDiv').className = 'alert alert-danger alert-dismissible';

    if (data.message === 'Username Deactived') {
      //document.getElementById('notification').innerText = 'ผู้ใช้ นี้ถูกระงับการใช้งาน';
    } else {
      //document.getElementById('notification').innerText = '*ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง';
    }
  }
};

var Post = function (url, obj, onSuccess, onError) {
  $.ajax({
    type: "POST",
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", getToken());
    },
    url: url,
    data: JSON.stringify(obj),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: onSuccess,
    error: onError
  });
};

var logOut = function () {
  sessionStorage.clear();
  window.location = "/index.html";
};