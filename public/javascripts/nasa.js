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
    document.getElementById('grid-wrapper').innerHTML = '';
    buildImgHTMLElement();
    document.getElementById("load-more-btn").style.display="block";
}

/**
 * fetch NUM_OF_IMAGES (3) images from the nasa api starting from the pic of the received date
 * @param date
 * @returns {Promise<void>}
 */
async function fetchPictures(date){
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
}

/**
 * This function builds HTML elements for three (NUM_OF_IMAGES) pictures and plants them in the DOM
 */
function buildImgHTMLElement() {
    let gridWrapper = document.getElementById('grid-wrapper');
    let htmlElement = '';

    images.slice(-3).forEach((image) => {
        if (!image.date) {
            htmlElement += `<small>Can't fetch picture: ${image.msg}</small><br>`;
        } else {
            const explanationId = `explanation-${image.date}`;
            const readMoreId = `read-more-${image.date}`;
            const hideBtnId = `hide-${image.date}`;
            const commentsCollapseId = `comments-${image.date}`;

            htmlElement += `
            <div class="image-card">
                <img src="${image.url}" alt="image/${image.date}" onclick="window.open(this.src)">
                <div class="card-body">
                    <h5><b>${image.date}: ${image.title}</b></h5>
                    ${image.copyright ? `<small class="text-muted">© ${image.copyright}</small><br>` : ""}
                    <p id="${explanationId}" class="explanation">${image.explanation}</p>
                    <span class="read-more" id="${readMoreId}" onclick="toggleText('${image.date}')">Read more</span>
                    <span class="read-more" id="${hideBtnId}" onclick="toggleText('${image.date}')" style="display:none;">Hide</span>
                    <a class="read-more" data-bs-toggle="collapse" href="#${commentsCollapseId}" role="button"
                        aria-expanded="false" aria-controls="${commentsCollapseId}"
                        onclick="toggleCommentText(this)" id="toggle-${image.date}">
                        Show Comments
                    </a>      
                    <div class="collapse mt-2" id="${commentsCollapseId}">
                    <div id="${image.date}">`;

            image.comments.forEach(function(comment) {
                htmlElement += buildCommentHTML(comment);
            });

           htmlElement += `</div>
                        <div class="mt-3">
                            <div class="input-group">
                                <input class="form-control" id="comment/${image.date}" type="text" name="comment"
                                    minlength="1" maxlength="128" placeholder="Leave a comment...">
                                <button onclick="sendComment('${image.date}')" class="btn btn-outline-secondary" type="button">
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;

        }
        htmlElement += `</div>`;
    });

    gridWrapper.innerHTML += htmlElement;
}

function toggleText(date) {
    const para = document.getElementById(`explanation-${date}`);
    const readMore = document.getElementById(`read-more-${date}`);
    const hideBtn = document.getElementById(`hide-${date}`);

    const isExpanded = para.style.webkitLineClamp === 'unset';

    if (isExpanded) {
        para.style.webkitLineClamp = '3';
        readMore.style.display = 'inline-block';
        hideBtn.style.display = 'none';
    } else {
        para.style.webkitLineClamp = 'unset';
        readMore.style.display = 'none';
        hideBtn.style.display = 'inline-block';
    }
}

function toggleCommentText(element) {
    const targetId = element.getAttribute("href").replace('#', '');
    const target = document.getElementById(targetId);

    setTimeout(() => {
        if (target.classList.contains("show")) {
            element.textContent = "Hide Comments";
        } else {
            element.textContent = "Show Comments";
        }
    }, 1000);
}

// This function build the comments html element that is shown on the website
function buildCommentHTML(comment) {
    let htmlElement = `
        <div class="d-flex justify-content-between align-items-start mb-2">
            <small id="${comment.id}" data-email="${comment.email}" data-imageId="${comment.imageId}">
                <b>${comment.name} ${comment.lastName}</b> commented: ${comment.content}
            </small>`;

    if (window.sessionStorage.getItem('email') === comment.email) {
        const imageId = comment.imageId.toString();
        htmlElement += `
            <button onclick="deleteComment('${comment.id}', '${imageId}')"
                    class="btn btn-outline-dark btn-sm ms-2 mt-1">
                Delete
            </button>`;
    }

    htmlElement += `</div>`;
    return htmlElement;
}

function toggleLoadMoreLoading(isLoading) {
    const spinner = document.getElementById("load-more-spinner");
    const text = document.getElementById("load-more-text");
    const button = document.getElementById("load-more-btn");

    if (isLoading) {
        spinner.classList.remove("d-none");
        text.textContent = "Loading...";
        button.disabled = true;
    } else {
        spinner.classList.add("d-none");
        text.textContent = "Load More";
        button.disabled = false;
    }
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
            // clear the comment input field
            document.getElementById(`${comId}`).value = '';
        })
        .catch(err => console.log(err));
}

// This function loads 3 more images when clicking on the "load more" button
async function loadMore(event) {
    event.preventDefault();

    toggleLoadMoreLoading(true);

    try {
        await fetchPictures(prevDay);
        buildImgHTMLElement();        
    } catch (error) {
        console.error("Failed to load more images:", error);
    } finally {
        toggleLoadMoreLoading(false);
    }
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
