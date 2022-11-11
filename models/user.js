const Model = require('./model');
module.exports = 
class User extends Model{
    constructor()
    {
        super();

        // To send
        this.Name = "";
        this.Email = "";
        this.Password = "";

        this.AvatarGUID = ""; // not yet

        // to change
        this.Created = 0;
        this.key = "Email";
        this.VerifyCode = 0;

        this.addValidator('Name','string');
        this.addValidator('Email','email');
        this.addValidator('Password','string');
        this.addValidator('Created','integer');

        /**
         * -Id int
         * -Name string
         * -Email (key) string
         * -Password string
         * -Created int
         * -VerifyCode string (code de 6 chiffres ou la constante verified)
         * -AvatarGUID string
         */
    }
}