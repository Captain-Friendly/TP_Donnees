const Model = require('./model');
module.exports = 
class Image extends Model{
    constructor()
    {
        super();
        this.Title = "";
        this.Description = "";
        this.Shared = false;
        this.Date =  0;
        this.GUID = "";
        this.User = "";

        this.addValidator('Title','string');
        this.addValidator('Description', 'string');

        /*
        -Id int
        -Title string
        -Description string
        -Shared boolean
        -Date int
        -GUID string
        -UserId int
        */

    }
}