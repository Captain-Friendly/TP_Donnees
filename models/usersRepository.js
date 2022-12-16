const ImageFilesRepository = require('./imageFilesRepository.js');
const UserModel = require('./user.js');
const utilities = require("../utilities");
const ImagesRepository = require('./imagesRepository.js');
const Image = require('./image.js');
const HttpContext = require('../httpContext').get();

module.exports = 
class UsersRepository extends require('./repository') {
    constructor(){
        super(new UserModel(), true);
        this.setBindExtraDataMethod(this.bindAvatarURL);
    }
    bindAvatarURL(user) {
        if (user) {
            let bindedUser = { ...user };
            delete bindedUser.Password;
            if (bindedUser.VerifyCode !== "verified")
                bindedUser.VerifyCode = "unverified";
            if (user["AvatarGUID"] != "") {
                bindedUser["AvatarURL"] = HttpContext.host + ImageFilesRepository.getImageFileURL(user["AvatarGUID"]);
            } else {
                bindedUser["AvatarURL"] = "";
            }
            return bindedUser;
        }
        return null;
    }
    add(user) {
        user["Created"] = utilities.nowInSeconds();
        if (this.model.valid(user)) {
            user["AvatarGUID"] = ImageFilesRepository.storeImageData("", user["ImageData"]);
            delete user["ImageData"]; 
            return this.bindAvatarURL(super.add(user));
        }
        return null;
    }
    update(user) {
        if (this.model.valid(user)) {
            let foundUser = super.get(user.Id);
            if (foundUser) {
                user["Created"] = foundUser["Created"];
                user["AvatarGUID"] = ImageFilesRepository.storeImageData(user["AvatarGUID"], user["ImageData"]);
                delete user["ImageData"];
                return super.update(user);
            }
        }
        return false;
    }
    remove(id){
        let foundUser = super.get(id);
        if (foundUser) {
            let imageRepo = new ImagesRepository();
            let images =  imageRepo.getAll();

            for(let i =0; i < images.length; i++){
                let image = images[i].GUID;
                let imageUser = JSON.parse(images[i].User);
                if(imageUser.Id == foundUser.Id){

                    ImageFilesRepository.removeImageFile(images[i]["GUID"]);
                }
            }


            ImageFilesRepository.removeImageFile(foundUser["AvatarGUID"]);
            return super.remove(id);
        }
        return false;
    }
}