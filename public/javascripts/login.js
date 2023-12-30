/*
//a listener for when the page is done loading content
document.addEventListener("DOMContentLoaded", () => {

    //a listener for when the form is submitted
    let form = document.getElementById("LoginForm");
    form.addEventListener("submit",(event) =>{
        event.preventDefault();
        // Get the form data
        let formData = new FormData(form);
        // Make it case-sensitive before submitting
        formData.forEach((value, key) => formData.set(key, value.toLowerCase()));
        form.submit();
    });
});

 */