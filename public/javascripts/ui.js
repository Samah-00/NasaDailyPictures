import { sendComment, deleteComment } from "./api.js";

export {
    buildImgHTMLElement,
    buildCommentHTML,
    toggleLoadMoreLoading
};
/**
 * This function builds HTML elements for three (NUM_OF_IMAGES) pictures and plants them in the DOM
 */
function buildImgHTMLElement(images) {
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
                    <span class="read-more read-more-btn" id="${readMoreId}" data-date="${image.date}">Read more</span>
                    <span class="read-more hide-read-more-btn d-none" id="${hideBtnId}" data-date="${image.date}">Hide</span>
                    <a class="read-more comment-toggle-link" data-target="${commentsCollapseId}" data-bs-toggle="collapse" href="#${commentsCollapseId}" role="button"
                        aria-expanded="false" aria-controls="${commentsCollapseId}" id="toggle-${image.date}">
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
                                <button class="btn btn-outline-secondary send-comment-btn" type="button" data-id="${image.date}">
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

    attachEventListenersToDynamicElements();
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
           <button class="btn btn-outline-dark btn-sm ms-2 mt-1 delete-comment-btn"
                    data-id="${comment.id}" data-image="${imageId}">
                Delete
            </button>`;
    }

    htmlElement += `</div>`;
    return htmlElement;
}

function attachEventListenersToDynamicElements() {
    document.querySelectorAll(".clickable-image").forEach(img => {
        img.addEventListener("click", () => {
            window.open(img.dataset.src, "_blank");
        });
    });

    document.querySelectorAll(".read-more-btn, .hide-read-more-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            toggleText(btn.dataset.date);
        });
    });

    document.querySelectorAll(".comment-toggle-link").forEach(link => {
        link.addEventListener("click", () => {
            toggleCommentText(link);
        });
    });

    document.querySelectorAll(".send-comment-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            sendComment(btn.dataset.id);
        });
    });

    document.querySelectorAll(".delete-comment-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            deleteComment(btn.dataset.id, btn.dataset.image);
        });
    });
}

function toggleText(date) {
    const para = document.getElementById(`explanation-${date}`);
    const readMore = document.getElementById(`read-more-${date}`);
    const hideBtn = document.getElementById(`hide-${date}`);
    const isExpanded = para.style.webkitLineClamp === 'unset';

    if (isExpanded) {
        para.style.webkitLineClamp = '3';
        readMore.classList.remove("d-none");
        hideBtn.classList.add("d-none");
    } else {
        para.style.webkitLineClamp = 'unset';
        readMore.classList.add("d-none");
        hideBtn.classList.remove("d-none");
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
