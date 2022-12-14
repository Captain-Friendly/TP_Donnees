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
init_UI();
HEAD(checkETag, error);
setInterval(() => { HEAD(checkETag, error) }, periodicRefreshPeriod * 1000);

function checkETag(ETag) {
    if (!holdCheckETag && ETag != currentETag) {
        currentETag = ETag;
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




function SaveToken(Token, ETag) {
    
    $("#connectionDlg").dialog("close");

    if(sessionStorage.getItem("local")){
        localStorage.setItem("Access_token",Token.Access_token);
        GetUser(Token.UserId,(user)=>{
            localStorage.setItem("User", JSON.stringify(user));
            
            Connected();
            getImagesList();
        }, error);
    }

    
    sessionStorage.setItem("Access_token",Token.Access_token);
    
    // ;
    
    
    // if () verify user with dialog
}




function userCreated(user){
    sessionStorage.setItem("User",JSON.stringify(user));
    resetUserForm();
    holdCheckETag = false;
    $("#UserDlg").dialog("close");

    $("#Vcode_error_code").html("");
    $("#VCodeDlg").dialog('option', 'title', "V??rification de courriel");
    $("#VcodeDlgOkBtn").text("Confirmer");
    $("#VCodeDlg").dialog('open');
}


function verified(){
    $("#VCodeDlg").dialog("close");
    $("#Vcode_error_code").html("");
    $(".unverified").hide();
    GetUser(JSON.parse(sessionStorage.getItem("User")).Id,logAndStoreUser,error);
    // Connected();
    alert("Usager verifi??");
}

function modified(){
    AddMode = true;
    holdCheckETag = false;
    $("#UserDlg").dialog("close");
    $("#error_code").html("");
    GetUser(JSON.parse(sessionStorage.getItem("User")).Id,logAndStoreUser,error)
    alert("Usager Modifi??");
}


{/*  */}
function refreshimagesList(images, ETag) {
    function insertIntoImageList(image) {
        let user = JSON.parse(image.User);
        let myImage = false;

        if(sessionStorage.getItem("User") != null){
            let sessionUserId = JSON.parse(sessionStorage.getItem("User")).Id;
            if(user.Id == sessionUserId && user.VerifyCode == "verified"){
                myImage = true;
            }
        }
        if(image.Shared == true || myImage == true){
            let divHeader = ``;

            if(myImage){
                divHeader = `<div class='imageHeader'>
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
                            </div>  `
            }
            $("#imagesList").append(
                $(` 
                    <div class='imageLayout'>
                        ${divHeader}
                        <a href="${image.OriginalURL}" target="_blank">
                            <div    class='image' 
                                    style="background-image:url('${image.ThumbnailURL}')">
                            </div>
                        </a>
                        <div title='${user.Name}' data-toggle="tooltip" class="avatar" style="background: url('${user.AvatarURL}') no-repeat center center; background-size: cover; width: 50px;"> </div>
                        <div class="imageDate">${convertToFrenchDate(parseInt(image.Date))}</div>
                        
                    </div>
                `)
            );   
        }
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
    //$(".Avatar").tooltip();
    $('[data-toggle="tooltip"]').tooltip();

}

function error(status) {
    let errorMessage = "";
    switch (status) {
        case 0:
            errorMessage = "Le service ne r??pond pas";
            break;
        case 401:
            errorMessage = "Requ??te non autoris??e";
            break;
        case 400:
        case 422:
            errorMessage = "Requ??te invalide";
            break;
        case 404:
            errorMessage = "Service ou donn??es introuvables";
            break;
        case 409:
            errorMessage = "Conflits de donn??es: le email est d??j?? utiliser";
            break;
        case 500:
            errorMessage = "Erreur interne du service";
            break;
        case 480:
            errorMessage = "User n'est pas v??rifier";
        default:
            errorMessage = "Une erreur est survenue";
            break;
    }
    $("#errorMessage").text(errorMessage);
    $("#errorDlg").dialog('open');
}

function newImage() {
    
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
    
    holdCheckETag = true;
    AddMode = true;
    resetUserForm();
    ImageUploader.imageRequired('imageUser', true);
    $("#UserDlg").dialog('option', 'title', "Cr??ation d'utilisateur");
    $("#UserDlgOkBtn").text("Cr??er");
    $("#UserDlg").dialog('open');
}

function logAndStoreUser(user){
    
    
    // $("#VCodeDlg").dialog('close');
    
    if(user.VerifyCode != "verified"){
        $(".unverified").show();


        $("#UserDlg").dialog('close');
        $("#VCodeDlg").dialog('close');
        $("#VCodeDlg").dialog('option', 'title', "V??rification de courriel");
        $("#VcodeDlgOkBtn").text("Confirmer");
        $("#VCodeDlg").dialog('open');
    }else{
        $(".unverified").hide();
        
    }

    sessionStorage.setItem("User", JSON.stringify(user));

    // sessionStorage.setItem("User_Name", user.Name);
    // sessionStorage.setItem("User_Email", user.Email);
    // sessionStorage.setItem("User_AvatarURL", user.AvatarURL);
    // sessionStorage.setItem("User_AvatarGUID", user.AvatarGUID);
    
    
    $(".ProfilePic").html(`<div class="avatar buttons" style="background: url('${user.AvatarURL}') no-repeat center center; background-size: cover; width: 50px;"> </div>`);

}


function modifyUser(){
    holdCheckETag = true;
    AddMode = false;

    let userFromStorage = JSON.parse(sessionStorage.getItem("User"));
    

    // let user = {
    //     Id: sessionStorage.getItem("UserId"),
    //     Name:sessionStorage.getItem("User_Name"),
    //     Email: sessionStorage.getItem("User_Email"),
    //     AvatarURL : sessionStorage.getItem("User_AvatarURL"),
    //     AvatarGUID: sessionStorage.getItem("User_AvatarGUID")
    // }


    userToForm(userFromStorage);
    $("#UserDlg").dialog('option', 'title', "Modification d'utilisateur");
    $("#UserDlgOkBtn").text("Modifier");
    $("#UserDlg").dialog('open');

}


function userToForm(user){
    resetUserForm();
    parseInt($("#user_Id_input").val(user.Id))
    $("#name_input").val(user.Name);
    $("#Email_input").val(user.Email);
    ImageUploader.setImage('imageUser', user.AvatarURL);
    $("#AvatarGUID_input").val(user.AvatarGUID);
}


function userFromForm() {
    let confirmed_password = false;
    if($("#Password_input").val() == $("#Password_input_confirm").val()) confirmed_password = true;
    if ($("#UserForm")[0].checkValidity()) {
        
        
        let newUser = {
            Id: parseInt($("#user_Id_input").val()),
            Name: $("#name_input").val(),
            Email: $("#Email_input").val(),
            Password: $("#Password_input").val(),
            Confirmed_Password:confirmed_password,
            AvatarGUID: $("#AvatarGUID_input").val(),
            ImageData: ImageUploader.getImageData('imageUser'),
            Created: parseInt($("#created_input").val()),
            VerifyCode: parseInt($("#VerifyCode_input").val()),
        };
        return newUser;
    } else {
        $("#UserForm")[0].reportValidity();
    }
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
    $("#Password_input_confirm").val("");

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
            Date: parseInt($("#date_input").val()),
            User : sessionStorage.getItem("User") ,
            Shared : $("#partage").prop("checked")
        };
        return image;
    } else {
        $("#imageForm")[0].reportValidity();
    }
    return false;
}



function codeFromForm(){
    if ($("#VCodeForm")[0].checkValidity()) {
        let code = parseInt($("#verif_code").val());
        return code;
    } else {
        $("#VCodeForm")[0].reportValidity();
    }
}



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
    $("#deconnectionDlg").dialog('option', 'title', "Etes-vous sur ?");
    $("#deconnectionDlgOkBtn").text("Deconnexion");
    $("#deconnectionDlg").dialog('open'); 
}

function connection(){
    holdCheckETag = true;
    $("#connectionDlg").dialog('option', 'title', "Connexion");
    $("#connectionDlgOkBtn").text("Connexion");
    $("#connectionDlg").dialog('open');
}



function wrongCredential(){
    $("#wrongCredential").text("ERREUR: le mot de passe ou le courriel est incorrect");
}

function wrongNumber(){
    $("#Vcode_error_code").html("Code de V??rification invalide, Essayer ?? nouveux");
}

function local(){
    sessionStorage.setItem("local",$("#localC").prop("checked"));  
}



function DeleteToken(){


    let userid = JSON.parse(sessionStorage.getItem("User")).Id;
    localStorage.clear();
    sessionStorage.clear();
    
    Connected();
    LOGOUT(userid,()=>{getImagesList();},error);
}

// function {
//     init_UI();
//     HEAD(checkETag, error);
// }

function Connected(){
    
    // let user = JSON.parse();
    $(".SearchBar").hide();
    
    

    if(localStorage.getItem("User") != null){ // set le session = local
        sessionStorage.setItem("User",localStorage.getItem("User"));
    }
    if(localStorage.getItem("Access_token") != null){ // set le session = local
        sessionStorage.setItem("Access_token",localStorage.getItem("Access_token"));
    }
    // if(localStorage.getItem("Username") != null){ // set le session = local
    //     sessionStorage.setItem("Username",localStorage.getItem("Username"));
    // }

    if(sessionStorage.getItem("User") == null){ // not connected
        $(".ConnectedB").hide();
        $(".NotConnectedB").show();
        $("#DesinscrireOkBtn").hide();
    }

    else{ // connected
        GetUser(parseInt(JSON.parse(sessionStorage.getItem("User")).Id,10) ,logAndStoreUser,error); // profile pic

        $("#DesinscrireOkBtn").show();
        $(".ConnectedB").show();
        $(".NotConnectedB").hide();
        let user = JSON.parse(sessionStorage.getItem("User"));
        $(".ProfileName").text(user.Name);

        // let verifyCode = user.VerifyCode;
        // if(verifyCode != "verified"){
        //     
        //     $(".unverified").show();
        // }
    }

}

function about(){
    holdCheckETag = true;
    $("#aboutDlg").dialog('option', 'title', "A propos");
    $("#aboutMessage").text("Faite par Thomas Lavoie et Julian Angel Murilo");
    $("#aboutDlg").dialog('open'); 
}

function showSearch(){
    if($(".SearchBar").is(":visible")){
        $(".SearchBar").hide();
    }
    else{
        $(".SearchBar").show();
    }
}

function search(){

}

function veridyUSer(){
    $("#VCodeDlg").dialog('option', 'title', "V??rification de courriel");
    $("#VcodeDlgOkBtn").text("Confirmer");
    $("#VCodeDlg").dialog('open');
}

function infoImage(){
    $("#InfoDlg").dialog('option', 'title', "infoImage");
    $("#InfoDlgOkBtn").text("Confirmer");
    $("#InfoDlg").dialog('open');
}

function init_UI() {
    // $("#newImageCmd").click(newImage);
    $("#newImageCmd").on("click", newImage);
    $("#newUserCmd").on("click", newUser);
    $("#connectionCmd").on("click",connection)
    $("#deconnectionCmd").on("click",deconnection)
    $("#aboutCmd").on("click",about);
    $("#modifyCmd").on("click", modifyUser)
    $("#SearchBarCmd").on("click",showSearch)
    $("#SearchCmd").on("click",search)
    $("#imageLayout").on("click",infoImage)

    $("#unverifiedCmd").on("click", veridyUSer)

    $(".unverified").hide();

    

    Connected();

    $("#aboutDlg").dialog({
        title:"...",
        autoOpen: false,
        modal : true,
        show: { effect: 'fade', speed: 400 },
        hide: { effect: 'fade', speed: 400 },
        width: 500, minWidth: 500, maxWidth: 500,
        height: 300, minHeight: 300, maxHeight: 300,
        position: { my: "top", at: "top", of: window },
        buttons: [
        {
            text: "OK",
            click: function () {
                holdCheckETag = false;
                $(this).dialog("close");
            }
        }]
    })

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
                        
                        POST(image, getImagesList, error);
                        $(".scrollContainer").scrollTop(0);
                    }
                    else
                        
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

    $("#UserDlg").dialog({
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
            id: "UserDlgOkBtn",
            text: "Title will be changed dynamically",
            click: function (e) {
                e.preventDefault();
                let user = userFromForm();

                if (user) {
                    if(user.Confirmed_Password){
                        delete user.Confirmed_Password;
                        if (AddMode) { 
                            REGISTER(user, userCreated, error);
                        }
                        //if we are modifying a user
                        else{
                            
                            let token = sessionStorage.getItem("Access_token");
                            MODIFY_USER_API(user,token,modified,error);
                        } 

                    }
                    else{
                        $("#error_code").html("Mots de passes differents, Essayer ?? nouveux");  
                    }  
                }
            }
        },
        {
            id: "DesinscrireOkBtn",
            text: "Desinscrire",
            click: function () {
                let userId = JSON.parse(sessionStorage.getItem("User")).Id;
                let token = sessionStorage.getItem("Access_token");

                REMOVE_USER(userId,token,error);

                LOGOUT(userId,()=>{getImagesList();},error);

                holdCheckETag = false;
                $(this).dialog("close");
            }
        }
        ,
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
                
                let userId = JSON.parse(sessionStorage.getItem("User")).Id;
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
                    LOGIN(login,SaveToken,wrongCredential);
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
        height: 300, minHeight: 300, maxHeight: 300,
        position: { my: "top", at: "top", of: window },
        buttons: [{
            id: "deconnectionDlgOkBtn",
            text: "title will be changed",
            click: function () {
                DeleteToken();
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
            getImagesList(false);
        }
    });
}