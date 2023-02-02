const API_KEY = 'fmDcUfzYjy1TxPylIH70VuRzmPFjwgtCJSWlvpHo';
const API_URL = 'https://api.nasa.gov/planetary/apod';
const NUM_OF_IMAGES = 3;
let date;
let images = [];
let prevDay;
const loader = document.getElementById('loader');

/**
 * Set the default value of the date picker to today's date.
 * @param DateHTMLElement
 */
function setDefaultDate(DateHTMLElement){
    const date = new Date();
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    DateHTMLElement.defaultValue = DateHTMLElement.value = date.getFullYear() + "-" + (month) + "-" + (day);
}

// This function logs the user out of his account
async function logout() {
    window.sessionStorage.clear(); // clearing the session(the user data)
    location.href = "/logout";
}

function DisplayDatePicker(event){
    event.preventDefault();
    const datePicker = document.getElementById('Pick_Date_Range');
    datePicker.style.display = (datePicker.style.display === 'none')? 'block': 'none';
}

//This function fetches the user's email and store it in the session
function fetchUserData(){
    loader.style.visibility = 'visible'; //show the loader gif until fetch in done
    fetch(`/getUserData`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            loader.style.visibility = 'hidden';
            return response.json();
        })
        .then(data => {
            window.sessionStorage.setItem('email', data);
        })
        .catch(err => console.log(err));
}

// This function renders the images of nasa to the website
async function renderPictures(event){
    event.preventDefault();
    document.getElementById('Pick_Date_Range').style.display = 'none';
    date = new Date(document.getElementById('date-input').value);
    await fetchPictures(date);
    document.getElementById('images-container').innerHTML = '';
    buildImgHTMLElement();
    document.getElementById("load-more-btn").style.display="block";
}

/**
 * fetch NUM_OF_IMAGES (3) images from the nasa api starting from the pic of the received date
 * @param date
 * @returns {Promise<void>}
 */
async function fetchPictures(date){
    loader.style.visibility = 'visible';
    for (let i = 0; i < NUM_OF_IMAGES; i++) {
        prevDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (i-1));
        let prevDayFormatted = prevDay.toISOString().substr(0,10);
        try {
            let response = await fetch(`${API_URL}?api_key=${API_KEY}&date=${prevDayFormatted}`);
            let data = await response.json();
            // Add the comments array to each image
            await fetch(`/findComments`, { //get all the comments to the image
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({"imageId": `${data.date}`})
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(Comments => {
                    data.comments = Comments;
                    images.push(data);
                })
                .catch(err => console.log(err));
        } catch (error) {
            console.log(error);
        }
    }
    prevDay = new Date(prevDay.getFullYear(), prevDay.getMonth(), prevDay.getDate() - 2);
    loader.style.visibility = 'hidden';
}

/**
 * This function builds HTML elements for three (NUM_OF_IMAGES) pictures and plants them in the DOM
 */
function buildImgHTMLElement() {
    let imagesContainer = document.getElementById('images-container');
    let htmlElement = '';
    images.slice(-3).forEach((image) => {
        if(typeof image.date === 'undefined') {
            htmlElement = `<small>Can't fetch picture: ${image.msg}</small><br>`
        }
        else { // only enter this scope when the image (that was received from nasa api) is defined
            loader.style.visibility = 'hidden';
            htmlElement =
                `<span>
                <p class="figure-caption text-dark"><b>${image.date}: ${image.title}</b></p>
                <span class ="row">
                    <div class="col-12 col-lg-3">
                        <figure class="figure"> 
                        <img class="figure-img img-fluid rounded images" src=${image.url} alt='image/${image.date}' onclick="window.open(this.src)">`
            if(typeof image.copyright !== 'undefined'){ // only enter this scope when the copyright is defined in nasa's api
                htmlElement +=  `<small class="row m-2 text-muted">Copyright: ${image.copyright}</small>`;
            }
            htmlElement +=
                `</figure>
                    </div>
                    <div class="col-12 col-lg-9"><small>${image.explanation}</small></div>
                </span>
                <div class="form-group">
                <span class="row"> <div id="${image.date}">`;
            image.comments.forEach(function(comment) {
                htmlElement += buildCommentHTML(comment);
            });
            htmlElement += `</div>
                <div class="col-11">
                    <input class="form-control" id="comment/${image.date}" type="text" name="comment" minlength="1" maxlength="128" placeholder="leave a comment (max length is 128 characters)">
                </div>
                <div class="col-1"><button id="sendBtn" onclick="sendComment('${image.date}')" type="submit"  class="btn btn-dark">Send</button></div>
                </span>
                </div>
            </span>
            <br>`;
        }
        imagesContainer.innerHTML += htmlElement;
    });
}

// This function build the comments html element that is shown on the website
function buildCommentHTML(comment){
    let htmlElement = `
    <div class="row">
    <div class="col-11">
    <small id="${comment.id}" data-email=${comment.email} data-imageId=${comment.imageId}><b>${comment.name} ${comment.lastName}</b> commented: ${comment.content}</small></div>`
    if(window.sessionStorage.getItem('email') === comment.email)
    {
        const imageId = comment.imageId.toString();
        htmlElement += `<div class="col-1"><button onclick="deleteComment('${comment.id}', '${imageId}')" class="btn btn-outline-dark btn-sm" type="button"> Delete </button></div>`;
    }
    htmlElement += `</div><br>`;
    return htmlElement;
}

/**
 * send a delete request to the server in order to delete a comment from the database
 * @param commentId
 * @param imageId
 */
function deleteComment(commentId, imageId){
    let htmlComments = '';
    loader.style.visibility = 'visible';
    fetch(`/comments/${commentId}`, {
        method: 'DELETE',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"imageId": `${imageId}`})
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            loader.style.visibility = 'hidden';
            return response.json();
        })
        .then(imageComments => { //build html element of the comments on the image
            imageComments.forEach(function(comment) {
                htmlComments += buildCommentHTML(comment);
            });
            // update the list of comments of the image
            document.getElementById(`${imageId}`).innerHTML = htmlComments;
        })
        .catch(error => {
            console.error('Error deleting comment:', error);
        });
}

/**
 * POST request
 * this function handles the click on the send comment button
 * it sends a request to the server to add the new comment to the comments' database
 */
function sendComment(id) {
    let htmlComments = '';
    let comId = "comment/" + id;
    let theComment = document.getElementById(`${comId}`).value;
    loader.style.visibility = 'visible';
    fetch(`/addComment`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"imageId": `${id}`, "content": `${theComment}`})
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            loader.style.visibility = 'hidden';
            return response.json();
        })
        .then(imageComments => {
            imageComments.forEach(function(comment) {
                htmlComments += buildCommentHTML(comment);
            });
            // update the list of comments of the image
            document.getElementById(`${id}`).innerHTML = htmlComments;
        })
        .catch(err => console.log(err));
}

// This function loads 3 more images when clicking on the "load more" button
async function loadMore(event){
    event.preventDefault();
    await fetchPictures(prevDay);
    buildImgHTMLElement();
}

/**
 * This function fires when the dom is done loading.
 * It sets the default date of the date picker to today's date
 * adds event listeners to the 'logout' and 'All Pictures' options in the navbar
 * adds event listeners to the 'date picker' form and to the 'load more' button
 * displays the three most recent pictures on the window
 */
document.addEventListener("DOMContentLoaded", () => {

    fetchUserData();

    setDefaultDate(document.getElementById("date-input"));

    document.getElementById('NavbarLogout').addEventListener("click", logout);

    document.getElementById("Pick-Date-Form").addEventListener("submit",event => renderPictures(event));

    document.getElementById("load-more-btn").addEventListener("click",event => loadMore(event));

    document.getElementById('NavbarAllPics').addEventListener("click", (event) => {
        setDefaultDate(document.getElementById('date-input'));
        renderPictures(event).then(null);
    });

    document.getElementById("NavbarDate").addEventListener('click', (event) => DisplayDatePicker(event));

    // By default, show the three most recent pictures when the page is loaded
    document.getElementById("NavbarAllPics").click();
});
