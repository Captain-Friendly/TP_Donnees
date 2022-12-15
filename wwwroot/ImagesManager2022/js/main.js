// session storage user informartion, token
// local storage, if user clicks remember me, store email and password
// need json.stringyfy and json.parse

//const { number } = require("sharp/lib/is");

//const { logout } = require("../../../tokenManager");

// TODO: can connect user if not verified
const periodicRefreshPeriod = 15;
let holdCheckETag = false;
let currentETag = "";
let createMode = true;
let AddMode = true;



let searchCategory = "";
let searchTitle = "";
let hideSearchBar = true;
let imageIdToDelete = 0; // used by confirmDeleteDlg
let selectedCategory = "";
let imagesCount = 50;
let appendCount = 3;
let previousScrollPosition = 0;
let appendMode = false;

let token;
let local_user;

const sessionSTR = window.sessionStorage;

init_UI();
HEAD(checkETag, error);
setInterval(() => { HEAD(checkETag, error) }, periodicRefreshPeriod * 1000);

function checkETag(ETag) {
    if (!holdCheckETag && ETag != currentETag) {
        currentETag = ETag;
        debugger
        getImagesList();
    }
}




function getImagesList(refresh = true) {
    appendMode = !refresh;
    function prepareQueryString() {
        let queryString = "";
        if (appendMode) {
            queryString = `?sort=Date,desc&offset=${Math.trunc(imagesCount / appendCount)}&limit=${appendCount}`;
            imagesCount += appendCount;
        } else {
            queryString = `?sort=Date,desc&offset=${0}&limit=${imagesCount}`;
        }
        return queryString;
    }
    GET_ALL(refreshimagesList, error, prepareQueryString());
}

function getUser(Token, ETag) {
    $("#connectionDlg").dialog("close");
    /*
    "Id": 1,
    "Access_token": "395393fc51f31256e24e848675cf6ba530d93a12380ab67e71bb8b761c664477",
    "UserId": 3,
    "Username": "Moi",
    "Expire_Time": 1671130497

    */

    if(sessionStorage.getItem("local")){
        localStorage.setItem("Access_token",Token.Access_token);
        localStorage.setItem("UserId",Token.UserId);
        localStorage.setItem("Username",Token.Username);
    }
    else{
        sessionStorage.setItem("Access_token",Token.Access_token);
        sessionStorage.setItem("UserId",Token.UserId);
        sessionStorage.setItem("Username",Token.Username);
    }

    refresh()
    // if () verify user with dialog

    // LOGIN USER
    // TODO: in login, use the token, then use index
}
function insertUser(user) {
    $(".buttons").append(
        $(`
            <div class="avatar buttons"
                style="background: url('${user.AvatarURL}') no-repeat center center; background-size: cover;">
                </div>`)
    );
}

function userCreated(user){
    debugger
    let string = user.Id.toString();
    sessionSTR.setItem("user", JSON.stringify(user))
    sessionSTR.setItem("userId", string);
    $("#VCodeDlg").dialog('option', 'title', "Donner le code de Vérification");
    $("#VcodeDlgOkBtn").text("Confirmer");
    $("#VCodeDlg").dialog('open');
    insertUser(user);
}

function refreshimagesList(images, ETag) {
    debugger
    function insertIntoImageList(image) {

        $("#imagesList").append(
            $(` 
                <div class='imageLayout'>
                    <div class='imageHeader'>
                        <div class="imageTitle">${image.Title}</div>
                        <div    class="cmd editCmd  fa fa-pencil-square" 
                                imageid="${image.Id}" 
                                title="Editer ${image.Title}" 
                                data-toggle="tooltip">
                        </div>
                        <div    class="cmd deleteCmd fa fa-window-close" 
                                imageid="${image.Id}" 
                                title="Effacer ${image.Title}" 
                                data-toggle="tooltip">
                        </div>
                    </div>
                    <a href="${image.OriginalURL}" target="_blank">
                        <div    class='image' 
                                style="background-image:url('${image.ThumbnailURL}')">
                        </div>
                    </a>
                    <div class="imageDate">${convertToFrenchDate(parseInt(image.Date))}</div>
                </div>
            `)
        );
    }
    currentETag = ETag;
    // previousScrollPosition = $(".scrollContainer").scrollTop();
    if (!appendMode) $("#imagesList").empty();

    if (appendMode && images.length == 0)
        imagesCount -= appendCount;

    for (let image of images) {
        insertIntoImageList(image);
    }

    // $(".scrollContainer").scrollTop(previousScrollPosition);
    $(".editCmd").off();
    $(".deleteCmd").off();
    $(".showMore").off();
    $(".editCmd").click(e => { editimage(e) });
    $(".deleteCmd").click(e => { deleteimage(e) });

    $('[data-toggle="tooltip"]').tooltip();
}

function error(status) {
    let errorMessage = "";
    switch (status) {
        case 0:
            errorMessage = "Le service ne répond pas";
            break;
        case 401:
            errorMessage = "Requête non autorisée";
            break;
        case 400:
        case 422:
            errorMessage = "Requête invalide";
            break;
        case 404:
            errorMessage = "Service ou données introuvables";
            break;
        case 409:
            errorMessage = "Conflits de données: le email est déjà utiliser";
            break;
        case 500:
            errorMessage = "Erreur interne du service";
            break;
        case 480:
            errorMessage = "User n'est pas vérifier";
        default:
            errorMessage = "Une erreur est survenue";
            break;
    }
    $("#errorMessage").text(errorMessage);
    $("#errorDlg").dialog('open');
}

function newImage() {
    debugger
    holdCheckETag = true;
    createMode = true;
    resetimageForm();
    ImageUploader.imageRequired('image', true);
    $("#imageDlg").dialog('option', 'title', "Ajout d'image");
    $("#imageDlgOkBtn").text("Ajouter");
    $("#imageDlg").dialog('open');
}

function newUser() {
    //https://yopmail.com/en/
    debugger
    holdCheckETag = true;
    AddMode = true;
    resetUserForm();
    ImageUploader.imageRequired('imageUser', true);
    $("#newUserDlg").dialog('option', 'title', "Création d'utilisateur");
    $("#newUserDlgOkBtn").text("Créer");
    $("#newUserDlg").dialog('open');
}


function editimage(e) {
    holdCheckETag = true;
    createMode = false;
    GET_ID(e.target.getAttribute("imageid"), imageToForm, error);
    holdCheckETag = true;
    ImageUploader.imageRequired('image', false);
    $("#imageDlg").dialog('option', 'title', "Modification d'image");
    $("#imageDlgOkBtn").text("Modifier");
    $("#imageDlg").dialog('open');
}


function deleteimage(e) {
    holdCheckETag = true;
    imageIdToDelete = e.target.getAttribute("imageid")
    GET_ID(
        imageIdToDelete,
        image => {
            $("#confirmationMessage").html("Voulez-vous vraiment effacer l'image <br><b>" + image.Title + "</b>?")
        },
        error
    );
    holdCheckETag = true;
    $("#confirmDlg").dialog('option', 'title', "Retrait d'image'...");
    $("#confirmDeleteDlgOkBtn").text("Effacer");
    $("#confirmDeleteDlg").dialog('open');
}
function resetimageForm() {
    debugger
    $("#Id_input").val("0");
    $("#GUID_input").val("");
    $("#date_input").val(Date.now());
    $("#title_input").val("");
    $("#description_input").val("");
    ImageUploader.resetImage('image');
}
function resetUserForm() {
    $("#Id_input").val("0");
    $("#GUID_input").val("");
    $("#created_input").val(Date.now());

    $("#name_input").val("");
    $("#Email_input").val("");
    $("#Password_input").val("");

    ImageUploader.resetImage('imageUser');
}

function connectionFromForm(){
    if($("#connectionForm")[0].checkValidity()){

        let login = {
            Email: $("#Email_inputC").val(),
            Password: $("#Password_inputC").val()
        };
        return login;
    } else{
        $("#connectionForm")[0].reportValidity();
    }
    return false;
}

function imageFromForm() {
    if ($("#imageForm")[0].checkValidity()) {
        let image = {
            Id: parseInt($("#Id_input").val()),
            GUID: $("#GUID_input").val(),
            Title: $("#title_input").val(),
            Description: $("#description_input").val(),
            ImageData: ImageUploader.getImageData('image'),
            Date: parseInt($("#date_input").val())
        };
        return image;
    } else {
        $("#imageForm")[0].reportValidity();
    }
    return false;
}
function userFromForm() {
    if ($("#newUserForm")[0].checkValidity()) {
        let id = parseInt($("#user_Id_input").val());
        let newUser = {
            Id: id,
            Name: $("#name_input").val(),
            Email: $("#Email_input").val(),
            Password: $("#Password_input").val(),
            AvatarGUID: $("#AvatarGUID_input").val(),
            ImageData: ImageUploader.getImageData('imageUser'),
            Created: parseInt($("#created_input").val()),
            VerifyCode: parseInt($("#VerifyCode_input").val()),
        };
        return newUser;
    } else {
        $("#newUserForm")[0].reportValidity();
    }
}

function codeFromForm(){
    if ($("#VCodeForm")[0].checkValidity()) {
        let code = parseInt($("#verif_code").val());
        return code;
    } else {
        $("#VCodeForm")[0].reportValidity();
    }
}

/**
 * To Edit images
 * @param {*} image 
 */
function imageToForm(image) {
    $("#Id_input").val(image.Id);
    $("#GUID_input").val(image.GUID);
    $("#date_input").val(image.Date);
    //$("#date_input").val(Date.now());
    $("#title_input").val(image.Title);
    $("#description_input").val(image.Description);
    ImageUploader.setImage('image', image.OriginalURL);
}

function deconnection(){
    holdCheckETag = true;
    $("#deconnectionDlg").dialog('option', 'title', "Deconnexion");
    $("#deconnectionDlgOkBtn").text("Connexion");
    $("#deconnectionDlg").dialog('open'); 
}

function connection(){
    holdCheckETag = true;
    $("#connectionDlg").dialog('option', 'title', "Connexion");
    $("#connectionDlgOkBtn").text("Connexion");
    $("#connectionDlg").dialog('open');
}

function verified(){
    $("#VCodeDlg").dialog("close");
}

function wrongCredential(){
    $("#wrongCredential").text("ERREUR: le mot de passe ou le courriel est incorrect");
}

function wrongNumber(){
    $("#VCodeDlg").append($(`<div id="error_code" style="color: red;">Code de Vérification invalide, Essayer à nouveux</div>`));
}

function local(){
    sessionStorage.setItem("local",$("#localC").prop("checked"));  
}

function profilePic(user){
    $(".ProfilePic").html(`<div class="avatar buttons"
    style="background: url('${user.AvatarURL}') no-repeat center center; background-size: cover; width: 50px;">
    </div>`)
}

function DeleteToken(){
    
    let userid = sessionStorage.getItem("UserId");
    localStorage.clear();
    sessionStorage.clear();
    LOGOUT(userid,refresh,error);
}

function refresh(){

    init_UI();
    HEAD(checkETag, error);
}

function Connected(){

    if(localStorage.getItem("UserId") != null){ // set le session = local
        sessionStorage.setItem("UserId",localStorage.getItem("UserId"));
    }

    if(sessionStorage.getItem("UserId") == null){ // not connected
        $(".ConnectedB").hide();
        $(".NotConnectedB").show();
    }
    else{ // connected
        //debugger;
        GetUser(parseInt(sessionStorage.getItem("UserId"),10) ,profilePic,error);
        $(".ConnectedB").show();
        $(".NotConnectedB").hide();
    }

}

function init_UI() {
    // $("#newImageCmd").click(newImage);
    $("#newImageCmd").on("click", newImage);
    $("#newUserCmd").on("click", newUser);
    $("#connectionCmd").on("click",connection)
    $("#deconnectionCmd").on("click",deconnection)

    Connected();

    $("#imageDlg").dialog({
        title: "...",
        autoOpen: false,
        modal: true,
        show: { effect: 'fade', speed: 400 },
        hide: { effect: 'fade', speed: 400 },
        width: 640,
        minWidth: 640,
        maxWidth: 640,
        height: 780,
        minHeight: 780,
        maxHeight: 780,
        position: { my: "top", at: "top", of: window },
        buttons: [{
            id: "imageDlgOkBtn",
            text: "Title will be changed dynamically",
            click: function () {
                let image = imageFromForm();
                if (image) {
                    if (createMode) {
                        debugger
                        POST(image, getImagesList, error);
                        $(".scrollContainer").scrollTop(0);
                    }
                    else
                        debugger
                        PUT(image, getImagesList, error); 
                    resetimageForm();
                    holdCheckETag = false;
                    $(this).dialog("close");
                }
            }
        },
        {
            text: "Annuler",
            click: function () {
                holdCheckETag = false;
                $(this).dialog("close");
            }
        }]
    });

    $("#newUserDlg").dialog({
        title: "...",
        autoOpen: false,
        modal: true,
        show: { effect: 'fade', speed: 400 },
        hide: { effect: 'fade', speed: 400 },
        width: 640,
        minWidth: 640,
        maxWidth: 640,
        height: 780,
        minHeight: 780,
        maxHeight: 780,
        position: { my: "top", at: "top", of: window },
        buttons: [{
            id: "newUserDlgOkBtn",
            text: "Title will be changed dynamically",
            click: function (e) {
                e.preventDefault();
                let newUser = userFromForm();
                if (newUser) {
                    if (AddMode) { // if we are adding a new user
                        // TODO: ask question on register and PUT(image, getImagesList, error);// add image
                        REGISTER(newUser, userCreated, error);
                        // $(".scrollContainer").scrollTop(0);
                        debugger
                    }
                    // else //if we are modifying a user
                    //     // PUT(image, getImagesList, error)
                    resetUserForm();
                    holdCheckETag = false;
                    $(this).dialog("close");
                }
            }
        },
        {
            text: "Annuler",
            click: function () {
                holdCheckETag = false;
                $(this).dialog("close");
            }
        }]
    });

    $("#VCodeDlg").dialog({
        title: "...",
        autoOpen: false,
        modal: true,
        show: { effect: 'fade', speed: 400 },
        hide: { effect: 'fade', speed: 400 },
        width: 640,
        minWidth: 640,
        maxWidth: 640,
        height: 400,
        minHeight: 400,
        maxHeight: 400,
        position: { my: "top", at: "top", of: window },
        buttons: [{
            id: "VcodeDlgOkBtn",
            text: "Title will be changed dynamically",
            click: function () {
                let code = codeFromForm();
                let userId = sessionSTR.getItem("userId")
                VERIFY_USER(code, userId,verified, wrongNumber);


                
                
            }
        }]
    });

    $('#connectionDlg').dialog({
        title:"...",
        autoOpen: false,
        modal : true,
        show: { effect: 'fade', speed: 400 },
        hide: { effect: 'fade', speed: 400 },
        width: 500, minWidth: 500, maxWidth: 500,
        height: 500, minHeight: 500, maxHeight: 500,
        position: { my: "top", at: "top", of: window },
        buttons: [{
            id: "connectionDlgOkBtn",
            text: "title will be changed",
            click: function () {
                local();
                let login = connectionFromForm();
                if(login){
                LOGIN(login,getUser,wrongCredential);
                //$(this).dialog("close");
                }

            }
        },
        {
            text: "Annuler",
            click: function () {
                holdCheckETag = false;
                $(this).dialog("close");
            }
        }]
    })
    
    $("#deconnectionDlg").dialog({
        title:"...",
        autoOpen: false,
        modal : true,
        show: { effect: 'fade', speed: 400 },
        hide: { effect: 'fade', speed: 400 },
        width: 500, minWidth: 500, maxWidth: 500,
        height: 500, minHeight: 500, maxHeight: 500,
        position: { my: "top", at: "top", of: window },
        buttons: [{
            id: "deconnectionDlgOkBtn",
            text: "title will be changed",
            click: function () {
                DeleteToken()
                $(this).dialog("close");
            }
        },
        {
            text: "Annuler",
            click: function () {
                holdCheckETag = false;
                $(this).dialog("close");
            }
        }]
    })

    $("#confirmDeleteDlg").dialog({
        title: "Attention!",
        autoOpen: false,
        modal: true,
        show: { effect: 'fade', speed: 400 },
        hide: { effect: 'fade', speed: 400 },
        width: 500, minWidth: 500, maxWidth: 500,
        height: 230, minHeight: 230, maxHeight: 230,
        position: { my: "top", at: "top", of: window },
        buttons: [{
            id: "confirmDeleteDlgOkBtn",
            text: "Oui",
            click: function () {
                holdCheckETag = false;
                if (imageIdToDelete)
                    debugger
                    DELETE(imageIdToDelete, getImagesList, error);
                imageIdToDelete = 0;
                $(this).dialog("close");
            }
        },
        {
            text: "Annuler",
            click: function () {
                holdCheckETag = false;
                imageIdToDelete = 0;
                $(this).dialog("close");
            }
        }]
    });

    $("#errorDlg").dialog({
        title: "Erreur...",
        autoOpen: false,
        modal: true,
        show: { effect: 'fade', speed: 400 },
        hide: { effect: 'fade', speed: 400 },
        width: 500, minWidth: 500, maxWidth: 500,
        height: 230, minHeight: 230, maxHeight: 230,
        position: { my: "top", at: "top", of: window },
        buttons: [{
            text: "Fermer",
            click: function () {
                holdCheckETag = false;
                imageIdToDelete = 0;
                $(this).dialog("close");
            }
        }]
    });

    $(".scrollContainer").scroll(function () {
        if ($(".scrollContainer").scrollTop() + $(".scrollContainer").innerHeight() >= $("#imagesList").height()) {
            //debugger
            getImagesList(false);
        }
    });
}