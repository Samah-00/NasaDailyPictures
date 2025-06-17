export function setDefaultDate(DateHTMLElement) {
    const date = new Date();
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    DateHTMLElement.defaultValue = DateHTMLElement.value = date.getFullYear() + "-" + (month) + "-" + (day);
}

export function DisplayDatePicker(event) {
    event.preventDefault();
    const datePicker = document.getElementById('Pick_Date_Range');
    datePicker.classList.toggle('d-none');
}