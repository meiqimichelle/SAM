// This file contains delegate functions used by SAM Helper
// when running as a Chrome extension
//
// This file lives at: https://github.com/GSA-OCSIT/sam-helper
//
// It requires usdsJsHelper.js be loaded before execution

// Load Ajax content in a synchronized function


function SamHelperDelegate() {

    this.doneFn = function(msg) { console.log (this.toString() + 'doneFn(): Dude, you need to supply this'); };
    this.failFn = function(msg) { console.log (this.toString() + 'failFn(): Dude, you need to supply this'); };

    this.getSiteData = function() {
        var saveThis = this;
        $.ajax({
            type: "GET",
            url: chrome.extension.getURL("SamHelper/samHelper.json"),
            dataType: "json"
        }).done(function(msg) {
            saveThis.doneFn.call(saveThis, msg);
        }).fail(function(msg, string) {
           saveThis.failFn.call(saveThis, msg); });
    }
}
