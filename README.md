# xpressLab

xpressLab is a small project that simulates how Express.js works using Node.js’s HTTP module. I’m not trying to reinvent the wheel, just exploring how middleware, routing, static file serving, and handling route parameters and query strings work behind the scenes.

## What It Does

* **Middleware Simulation** – Implements a basic `next()`-like function for chaining middleware.
* **Routing System** – Supports dynamic routes with parameters and query strings.
* **Static File Serving** – Serves files from deeply nested directories.
* **HTTP Request Handling** – Manages different request methods and responses.

## Why?

The goal is to break down and simulate how Express.js handles requests, middleware execution, and static file serving—without using a framework. This project helped in understanding the inner workings of Express.js in a more hands-on way.

## Running It

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/Adamson123/xpressLab.git](https://github.com/Adamson123/xpressLab.git)
    cd xpressLab
    ```

2.  **Start the server:**

    ```bash
    node index.js
    ```

3.  **Open a browser or use Postman to test different routes.**

## Note

This isn’t meant to replace Express.js, just a personal experiment to understand its core mechanics without relying on a framework.
