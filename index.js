import fs from "fs";
import xpressLab from "./xpressLab.js";

const server = xpressLab();

server.use((req, res, next) => {
    console.log(`
path: ${req.url}
method: ${req.method}

`);
    next();
});

server.use(xpressLab.static("public"));

server.get("/new:uuid", (req, res) => {
    console.log(req.params);
    res.json({ succcssfull: req.params.uuid });
});

server.get(
    "/new",
    (req, res, next) => {
        console.log("I was hit!, My name is new!");
        next();
    },
    (req, res, next) => {
        console.log("I was hit!, My name is new episode 2!");
        next();
    }
);
server.get("/new", (req, res) => {
    console.log("I was hit!, My name is new season 2!");
    res.json({
        new: "Hello-World! dude",
        test: "Yeah test",
        data: "Yeah data",
        ...req.query,
    });
});

server.post("/data", (req, res, next) => {
    req.data = { food: "amala", and: "ewedu🌿" };
    next();
});

server.post("/data", (req, res) => {
    res.json({ ...req.body, ...req.data });
});

server.get("/weather", async (req, res) => {
    try {
        const weather = JSON.parse(
            await fs.promises.readFile("weather.json", {
                encoding: "utf8",
            })
        );
        res.json({ weather });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

server.get("*", (req, res) => {
    res.status(404).send("<h1>404 content not found</h1>");
});

server.listen(3100, () => {
    console.log("Server is listening on http://localhost:3100");
});
