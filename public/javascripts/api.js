import { API_KEY, API_URL, NUM_OF_IMAGES } from './config.js';
import { buildCommentHTML } from './ui.js';

let images = [];
let prevDay;

export { fetchUserData, fetchPictures, sendComment, deleteComment, images, prevDay };

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

// This function fetches the user's email and store it in the session
function fetchUserData(){
    fetch(`/getUserData`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            window.sessionStorage.setItem('email', data);
        })
        .catch(err => console.log(err));
}

/**
 * send a delete request to the server in order to delete a comment from the database
 * @param commentId
 * @param imageId
 */
function deleteComment(commentId, imageId){
    let htmlComments = '';

    fetch(`/comments/${commentId}`, {
        method: 'DELETE',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"imageId": `${imageId}`})
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(imageComments => { //build html element of the comments on the image
            imageComments.forEach( comment => {
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
    fetch(`/addComment`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"imageId": `${id}`, "content": `${theComment}`})
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(imageComments => {
            imageComments.forEach(comment => {
                htmlComments += buildCommentHTML(comment);
            });
            // update the list of comments of the image
            document.getElementById(`${id}`).innerHTML = htmlComments;
            // clear the comment input field
            document.getElementById(`${comId}`).value = '';
        })
        .catch(err => console.log(err));
}