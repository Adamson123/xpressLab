import path from "path";
import fs from "fs";
import { lookupService } from "dns/promises";

const getContentType = (PATH) => {
    const ext = path.extname(PATH).toLowerCase().substring(1, PATH.length);
    switch (ext) {
        case "html":
            return "text/html";
        case "css":
            return "text/css";
        case "js":
            return "application/javascript";
        case "json":
            return "application/json";
        case "xml":
            return "application/xml";
        case "txt":
            return "text/plain";
        case "csv":
            return "text/csv";
        case "pdf":
            return "application/pdf";
        case "zip":
            return "application/zip";
        case "mp3":
            return "audio/mpeg";
        case "mp4":
            return "video/mp4";
        case "wav":
            return "audio/wav";
        case "avi":
            return "video/x-msvideo";
        case "webp":
            return "image/webp";
        case "jpg":
        case "jpeg":
            return "image/jpeg";
        case "png":
            return "image/png";
        case "gif":
            return "image/gif";
        case "svg":
            return "image/svg+xml";
        case "ico":
            return "image/x-icon";
        case "woff":
            return "font/woff";
        case "woff2":
            return "font/woff2";
        case "ttf":
            return "font/ttf";
        case "otf":
            return "font/otf";
        default:
            return "application/octet-stream"; // Generic binary data
    }
};

const getAllContents = (PATH, accArr) => {
    const folderContents = fs.readdirSync(PATH);
    for (const content of folderContents) {
        const contentPath = path.join(PATH, content);
        const isFile = fs.statSync(contentPath).isFile();
        if (isFile) {
            const isIndexHTML = content === "index.html";
            const handler = (req, res) => {
                let url = req.url;
                if (!url.endsWith("/") && isIndexHTML) {
                    if (!url.endsWith("/index.html")) {
                        res.writeHead(301, { Location: req.url + "/" });
                        res.end();
                        return;
                    }
                }
                res.writeHead(200, {
                    "Content-Type": getContentType(content),
                });
                res.end(fs.readFileSync(contentPath));
            };

            let routePath = contentPath.split(path.sep);
            //Remove the root folder name
            routePath.shift();

            //Remove the name index.html
            if (isIndexHTML) {
                routePath.pop();
            }

            routePath = "/" + routePath.join("/");
            // console.log(routePath);
            accArr.push({
                path: routePath,
                type: "route",
                method: "GET",
                handler,
            });
        } else {
            getAllContents(contentPath, accArr);
        }
    }
    return accArr;
};

const staticFunc = (PATH) => {
    try {
        const folderContents = getAllContents(PATH, []);
        // console.log({ folderContents });
        return folderContents;
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

export default staticFunc;
