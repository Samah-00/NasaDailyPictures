# NASA Daily Pictures

A full-stack web application that allows users to explore NASA's daily space photos, interact with them through comments, and view photos from any date of choice.

---

## Team

* **Samah Rajabi**
* **Saja Abu Maizar**

---

## Project Description

**NASA Daily Pictures** is a web application where users can:

* **Register** and **log in** securely.
* View the **three most recent daily photos** from NASA on the homepage.
* Select a custom **date** to view past images using NASA's public API.
* **Comment** on any image, **view** all users' comments, and **delete** their own.
* Enjoy a clean, responsive user interface and intuitive navigation.

---

## Technologies Used

### Backend

* Node.js
* Express.js
* SQLite3 (lightweight SQL database)
* NASA API
* Session-based authentication using express-session and cookies

### Frontend

* HTML5, CSS3, Bootstrap
* Vanilla JavaScript

---

## Authentication

* User sessions are maintained via cookies and server-side sessions.
* Only authenticated users can post or delete comments.

---

## Getting Started

### Prerequisites

Make sure you have **Node.js** and **npm** installed.

### Installation

Clone the repository and run:

```bash
npm install
npm install sqlite3
```

### Running the App

To start the server:

```bash
node app.js
```

The app will be available at [http://localhost:3000](http://localhost:3000)

---

## API Reference

This project utilizes the [NASA APOD (Astronomy Picture of the Day) API](https://api.nasa.gov/), which provides access to NASA’s astronomy images with metadata like title, description, and copyright.

---

## Features Overview

| Feature             | Description                                            |
| ------------------- | ------------------------------------------------------ |
| User Authentication | Register and login securely                            |
| Dynamic Gallery     | View the 3 most recent NASA images                     |
| Date Selection      | Pick any date to explore NASA's photo of the day       |
| Commenting System   | Add, view, and delete comments (only by comment owner) |
| Load More Button    | Load older images dynamically without page reload      |

---

## License

This project is for educational and non-commercial purposes only.
NASA images are in the public domain, but usage should respect their [image use policy](https://www.nasa.gov/multimedia/guidelines/index.html).