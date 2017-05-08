var pRequest = require("promisified-request").create();
var fScraper = require("form-scraper");
 
var loginDetails = { user: "my user", password: "my password" };
 
var formProvider = new fScraper.ScrapingFormProvider();
var formSubmitter = new fScraper.FormSubmitter();
 
formProvider.updateOptions({
    formId: "#login",
    url: "http://www.somedomain.com",
    promisifiedRequest: pRequest
});
 
formSubmitter
    .updateOptions({
        formProvider: formProvider,
        promisifiedRequest: pRequest
    })
    .submitForm(loginDetails)
        .then(function(response) {
            console.log(response.body);
        });