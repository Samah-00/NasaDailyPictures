function setCookie(name, value, secondsToLive){
    // calculate the date that the cookie will have until it expires
    // date: the date of expiration in milliseconds
    // expires: the date of expiration in UTC
    const date = new Date();
    date.setTime(date.getTime() + (secondsToLive * 1000));
    let expires = 'expires=' + date.toUTCString();

    // add a new cookie to the cookies file
    document.cookie = `${name}=${value}; ${expires}; path=/`;
}

function getCookie(name){
    // first we decode the URL file in which the cookies are stored:
    const cookiesDecoded = decodeURIComponent(document.cookie);
    // we split the file into strings of cookies using split:
    const cookiesArray = cookiesDecoded.split("; ");
    let result = null;

    // we iterate over the cookies array and find a match to 'name'
    // then we obtain the requested value from the match that we find:
    cookiesArray.forEach(cookie => {
        if(cookie.indexOf(name) === 0){
            result = cookie.substring(name.length+1);
        }
    });
    return result;
}

function deleteCookie(name){
    // to delete a cookie we overwrite it with an expired date:
    setCookie(name, null, null);
}

//a listener for when the page is done loading content
document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("emailBox").value = getCookie('email');
    document.getElementById("nameBox").value = getCookie('firstName');
    document.getElementById("LastNameBox").value = getCookie('lastName');

    //a listener for when the form is submitted
    let form = document.getElementById("registerForm");
    form.addEventListener("submit",(event) =>{
        event.preventDefault();
        // Get the form data
        let formData = new FormData(form);
        // Make it case-sensitive
        formData.forEach((value, key) => formData.set(key, value.toLowerCase()));
        const email = document.getElementById("emailBox").value.trim();
        const firstName = document.getElementById("nameBox").value.trim();
        const lastName = document.getElementById("LastNameBox").value.trim();
        setCookie("email", email, 30);
        setCookie("firstName", firstName, 30);
        setCookie("lastName", lastName, 30);
        form.submit();
    });
});


