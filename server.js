//This is just to confirm if it's works similarly

import express from "express";

const app = express();

app.get("/new:id", (req, res) => {
    console.log(req.params);
    res.json({ id: req.params.id });
});
app.get("/", (req, res, next) => {
    res.json({ data: "A data" });

    //next();
});

app.use("/static", express.static("public"));

app.use((req, res) => {
    console.log(`
        path: ${req.url}
        method: ${req.method}
        `);
    res.json({ data: "express sign" });
});

app.listen(3000, () => {
    console.log("Server started!!!");
});
