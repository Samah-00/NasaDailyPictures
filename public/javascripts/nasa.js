import { setDefaultDate, DisplayDatePicker } from './dateUtills.js';
import { fetchUserData, fetchPictures, images, prevDay } from './api.js';
import { buildImgHTMLElement, toggleLoadMoreLoading } from './ui.js';


let date;

// This function logs the user out of his account
async function logout() {
    window.sessionStorage.clear(); // clearing the session(the user data)
    location.href = "/logout";
}

// This function renders the images of nasa to the website
async function renderPictures(event){
    event.preventDefault();
    document.getElementById('Pick_Date_Range').style.display = 'none';
    date = new Date(document.getElementById('date-input').value);
    await fetchPictures(date);
    document.getElementById('grid-wrapper').innerHTML = '';
    buildImgHTMLElement(images);
    document.getElementById("load-more-btn").style.display="block";
}

// This function loads 3 more images when clicking on the "load more" button
async function loadMore(event) {
    event.preventDefault();

    toggleLoadMoreLoading(true);

    try {
        await fetchPictures(prevDay);
        buildImgHTMLElement(images);        
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
