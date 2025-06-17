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
async function fetchPictures(date) {
    for (let i = 0; i < NUM_OF_IMAGES; i++) {
        prevDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (i - 1));
        let prevDayFormatted = prevDay.toISOString().substr(0, 10);

        try {
            const response = await fetch(`${API_URL}?api_key=${API_KEY}&date=${prevDayFormatted}`);
            if (!response.ok) throw new Error(`NASA API error (${response.status}) for date ${prevDayFormatted}`);
            const data = await response.json();

            try {
                const commentsResponse = await fetch(`/findComments`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({ "imageId": data.date })
                });

                if (!commentsResponse.ok) throw new Error(`Failed to fetch comments for ${data.date}`);
                const comments = await commentsResponse.json();
                data.comments = comments;
            } catch (err) {
                console.error("Comment fetch error:", err);
                data.comments = []; // fallback to empty array
            }

            images.push(data);

        } catch (error) {
            console.error("Error fetching image:", error);
        }
    }

    prevDay = new Date(prevDay.getFullYear(), prevDay.getMonth(), prevDay.getDate() - 2);
}

// This function fetches the user's email and store it in the session
async function fetchUserData() {
    try {
        const response = await fetch(`/getUserData`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        window.sessionStorage.setItem('email', data);

    } catch (err) {
        console.error("User data error:", err);
    }
}

/**
 * send a delete request to the server in order to delete a comment from the database
 * @param commentId
 * @param imageId
 */
async function deleteComment(commentId, imageId) {
    try {
        const response = await fetch(`/comments/${commentId}`, {
            method: 'DELETE',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "imageId": imageId })
        });

        if (!response.ok) throw new Error("Delete request failed");

        const updatedComments = await response.json();
        let htmlComments = '';
        updatedComments.forEach(comment => {
            htmlComments += buildCommentHTML(comment);
        });

        document.getElementById(imageId).innerHTML = htmlComments;

    } catch (error) {
        console.error("Error deleting comment:", error);
    }
}

/**
 * POST request
 * this function handles the click on the send comment button
 * it sends a request to the server to add the new comment to the comments' database
 */
async function sendComment(id) {
    const inputId = `comment/${id}`;
    const content = document.getElementById(inputId).value;

    if (!content.trim()) {
        alert("Comment cannot be empty.");
        return;
    }

    try {
        const response = await fetch(`/addComment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageId: id, content: content })
        });

        if (!response.ok) throw new Error("Failed to send comment");

        const updatedComments = await response.json();
        let htmlComments = '';
        updatedComments.forEach(comment => {
            htmlComments += buildCommentHTML(comment);
        });

        document.getElementById(id).innerHTML = htmlComments;
        document.getElementById(inputId).value = ''; // Clear input

    } catch (err) {
        console.error("Send comment error:", err);
        alert("There was an error sending your comment. Please try again later.");
    }
}