const baseURL = "http://localhost:5000";
// const baseURL = "https://tp201970761.glitch.me";

// const apiBaseURL = "/api/images";
const apiBaseURL = baseURL + "/api/images";
const accountURL = baseURL + "/accounts";
const loginURL = baseURL + "/token";


function HEAD(successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL,
        type: 'HEAD',
        contentType: 'text/plain',
        complete: request => { successCallBack(request.getResponseHeader('ETag')) },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}
/*
    {
        "Id": 4,
        "Name": "Julian Angel Murillo",
        "Email": "juliandelapaz2001@gmail.com",
        "Password": "********",
        "Created": 1668200346,
        "VerifyCode": 905218,
        "AvatarGUID": "",
        "AvatarURL": ""
    }
*/
function REGISTER(user,successCallBack, errorCallBack){
    $.ajax({
        url: accountURL+"/register",
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(user),
        success: (data, status, xhr) => { successCallBack(data, xhr.getResponseHeader("ETag")) },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}
function LOGIN(){
    $.ajax({
        url: loginURL,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(user),
        success: (data, status, xhr) => { successCallBack(data, xhr.getResponseHeader("ETag")) },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}

function VERIFY_USER(code,userId, successCallBack, errorCallBack){
    $.ajax({
       url:accountURL + `/verify?id=${userId}&code=${code}`,
       type:'GET',
       success: data => { successCallBack(data); },
       error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}

function GET_ID(id, successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL + "/" + id,
        type: 'GET',
        success: data => { successCallBack(data); },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}
function GET_ALL(successCallBack, errorCallBack, queryString = null) {
    let url = apiBaseURL + (queryString ? queryString : "");
    $.ajax({
        url: url,
        type: 'GET',
        success: (data, status, xhr) => { successCallBack(data, xhr.getResponseHeader("ETag")) },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}
function POST(data, successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: (data) => { successCallBack(data) },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}
function PUT(bookmark, successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL + "/" + bookmark.Id,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(bookmark),
        success: () => { successCallBack() },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}
function DELETE(id, successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL + "/" + id,
        type: 'DELETE',
        success: () => { successCallBack() },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}
