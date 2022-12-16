
 // Attention de ne pas avoir des références circulaire
; // pas ici sinon référence ciculaire
const ImageFilesRepository = require('./imageFilesRepository.js');
const ImageModel = require('./image.js');
const utilities = require("../utilities");
const UsersRepository = require('./usersRepository.js');
const HttpContext = require('../httpContext').get();

module.exports =
    class ImagesRepository extends require('./repository') {
        constructor() {
            super(new ImageModel(), true /* cached */);
            this.setBindExtraDataMethod(this.bindImageURL);
        }
        /**
         * Binds the image to the url and thumbnail url    
         *  TODO:Add the user who added the image, use userRepo
         * @param {*} image image data
         * @returns 
         */
        bindImageURL(image) {
            if (image) {
                let bindedImage = { ...image };
                
                if (image["GUID"] != "") {
                    bindedImage["OriginalURL"] = HttpContext.host + ImageFilesRepository.getImageFileURL(image["GUID"]);
                    bindedImage["ThumbnailURL"] = HttpContext.host + ImageFilesRepository.getThumbnailFileURL(image["GUID"]);
                    // let user = UsersRepository.get(image.UserId)
                    bindedImage["Shared"] = image.Shared;
                } else {
                    bindedImage["OriginalURL"] = "";
                    bindedImage["ThumbnailURL"] = "";
                    bindedImage["User"] = "";
                    bindedImage["Shared"] = "";
                }
                return bindedImage;
            }
            return null;
        }
        add(image) {

            if (this.model.valid(image)) {
                let user = JSON.parse(image.User);
                let userRepo = new UsersRepository();


                // verifie qu'une image a un usager
                if(userRepo.get(user.Id) != null){
                    image["GUID"] = ImageFilesRepository.storeImageData("", image["ImageData"]);
                    delete image["ImageData"];
                    return this.bindImageURL(super.add(image));
                }
                
            }
            return null;
        }
        update(image) {
            if (this.model.valid(image)) {

                // let userRepo = new UsersRepository();
                // userRepo.get()
                // if(){

                // }
                image["GUID"] = ImageFilesRepository.storeImageData(image["GUID"], image["ImageData"]);
                delete image["ImageData"];
                return super.update(image);
            }
            return false;
        }

        removeByUserId(UserId){
            let ImagesOfUser = [];
            let allImages = this.getAll();
            
        }

        remove(id) {
            let foundImage = super.get(id);
            if (foundImage) {
                ImageFilesRepository.removeImageFile(foundImage["GUID"]);
                return super.remove(id);
            }
            return false;
        }
    }