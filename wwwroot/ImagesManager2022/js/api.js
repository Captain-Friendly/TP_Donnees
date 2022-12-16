// const baseURL = "http://localhost:5000";
const baseURL = "https://tp201970761.glitch.me";
// TODO: ajouter le token dans le headers:{
        //     authorization: `Bearer ${token}`
        // },

// const apiBaseURL = "/api/images";
const apiBaseURL = baseURL + "/api/images";
const accountURL = baseURL + "/accounts";
const loginURL = baseURL + "/token";
const modifyURL = accountURL + "/modify"


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
        success: (data) => { successCallBack(data) },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}
function LOGOUT(userid,successCallBack,errorCallBack){
    // GET: /accounts/logout/id
    $.ajax({
        url: accountURL + "/logout/" + userid,
        type: 'GET',
        contentType: 'application/json',
        data: JSON.stringify(userid),
        success: (data, status, xhr) => { successCallBack(data) },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}
function LOGIN(login,successCallBack,errorCallBack){
    $.ajax({
        url: loginURL,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(login),
        success: (data, status, xhr) => { successCallBack(data) },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}

function GetUser(id,successCallBack,errorCallBack){
    $.ajax({
        url: accountURL + `/index/${id}`,
        type: 'GET',
        success: data => { successCallBack(data) },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}

function REMOVE_USER(id,token,errorCallBack){
    $.ajax({
        url: accountURL + `/remove/${id}`,
        type: 'GET',
        headers:{
            Authorization:token
        },
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

function MODIFY_USER_API(modified_user, token, successCallBack, errorCallBack){
    $.ajax({
        url: modifyURL,
        type:'PUT',
        headers:{
            Authorization:token
        },
        contentType: 'application/json',
        data: JSON.stringify(modified_user),
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
