
var jsonexport = require('jsonexport');
var fs = require('fs');

module.exports = class DataAccess {
    constructor() {
        this.outputPath = "data";
        if (!fs.existsSync(this.outputPath)) {
            fs.mkdirSync(this.outputPath);
        }

    }
    async saveData(data, user) {
        const date = new Date().toLocaleString().replace(/:/g, '_').replace(/ /g, '_').replace(/\//g, '_');
        const csvPath = this.outputPath + "/" + "libreview-" + user + "--" + date + ".csv";
        jsonexport(data, function (err, csv) {
            if (err) return console.log(err);
            console.log("creating " + csvPath);
            fs.writeFile(csvPath, csv);
        });
    }
}