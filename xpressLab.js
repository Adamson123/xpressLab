import http from "http";
import staticFunc from "./static.js";
import url from "url";

class XpressLab {
    constructor() {
        this.routes = [];
    }

    findRoute(path, method) {
        return this.routes.find(
            (route) => route.path === path && route.method === method
        );
    }
    findLastRoute(path, method) {
        return this.routes
            .reverse()
            .find((route) => route.path === path && route.method === method);
    }
    // findLastRouteIndex(path, method) {
    //     let index;
    //     this.routes.forEach((route, idx) => {
    //         if (route.path === path && route.method === method) {
    //             index = idx;
    //         }
    //     });
    //     return index;
    // }

    //middleware mathes path or middleware does not have path
    middlewareCondition(route, path) {
        return (
            (route.path === path || route.path === undefined) &&
            route.type === "middleware"
        );
    }
    findMatchingRoutes(path, method) {
        return this.routes.filter(
            (route) =>
                (route.path === path && route.method === method) ||
                this.middlewareCondition(route, path)
        );
    }
    findMatchingRoutesWithParams(path, method) {
        const routes = this.routes.filter(
            (route) =>
                (route.path?.includes(":") &&
                    route.path.split(":")[0] === path &&
                    route.method === method) ||
                this.middlewareCondition(route, path)
        );
        const routeWithId = routes.find(
            (route) => route.path?.split(":")[0] === path
        );
        return {
            routes,
            id: routeWithId ? routeWithId.path.split(":")[1] : "",
        };
    }
    isRouteExist(path, method) {
        const isExist = this.findRoute(path, method);
        if (isExist)
            throw new Error(
                `Route ${path} with method ${method} already exist`
            );
    }
    filterArgs(args, type) {
        const first = args[0];
        const firstType = typeof first;
        const path = firstType !== "string" || !first ? undefined : first;
        if (firstType !== "string" && type !== "middleware")
            throw new Error("Please specify a path");
        if (firstType === "string") {
            args.shift();
        }
        return { path, handlers: args };
    }
    use(...args) {
        const { path, handlers } = this.filterArgs(args, "middleware");
        handlers.forEach((handler) => {
            // For static files route
            if (handler instanceof Array) {
                handler.forEach((route) => {
                    route.path = path ? path + route.path : route.path;
                    this.routes.push(route);
                });

                return;
            }
            this.routes.push({ path, handler, type: "middleware" });
        });
    }
    get(...args) {
        const { path, handlers } = this.filterArgs(args);

        handlers.forEach((handler) => {
            this.routes.push({ path, handler, method: "GET", type: "route" });
        });
    }
    post(...args) {
        const { path, handlers } = this.filterArgs(args);
        handlers.forEach((handler) => {
            this.routes.push({ path, handler, method: "POST", type: "route" });
        });
    }
    patch(...args) {
        const { path, handlers } = this.filterArgs(args);
        handlers.forEach((handler) => {
            this.routes.push({
                path,
                handler,
                method: "PATCH",
                type: "route",
            });
        });
    }
    put(...args) {
        const { path, handlers } = this.filterArgs(args);
        handlers.forEach((handler) => {
            this.routes.push({ path, handler, method: "PUT", type: "route" });
        });
    }
    delete(...args) {
        const { path, handlers } = this.filterArgs(args);
        handlers.forEach((handler) => {
            this.routes.push({
                path,
                handler,
                method: "DELETE",
                type: "route",
            });
        });
    }
    cleanURL(urlString) {
        const questionMArkIndex = urlString.indexOf("?");
        const splittedUrl =
            questionMArkIndex + 1
                ? urlString.substring(questionMArkIndex)
                : undefined;

        let query = {};
        if (splittedUrl) {
            const parsedUrlString = new URLSearchParams(splittedUrl);
            query = Object.fromEntries(parsedUrlString.entries());
            urlString = urlString.substring(0, urlString.lastIndexOf("?"));
        }

        if (urlString.endsWith("/") && urlString.length > 1) {
            urlString = urlString.slice(0, -1);
        }
        
        let id;
        if(urlString.includes(":")){
         id = urlString.slice(urlString.lastIndexOf(":") + 1);
        urlString = urlString.split(":")[0];
        }
        // const urlString = urlString.slice(
        //     0,
        //     urlString.lastIndexOf(":")
        // );

        if (urlString.endsWith("index.html")) {
            urlString = urlString.substring(0,urlString.lastIndexOf("/index.html"))
           // urlString.pop();
         //   urlString = urlString.join("/");
           urlString = urlString ? urlString : "/";
        }

       // console.log({ urlString, id,urlString });

        return { urlString, id, query };
    }

    listen(port, handler) {
        http.createServer(async (req, res) => {
            let status = 200;
            res.json = (data) => {
                res.writeHead(status, {
                    "Content-Type": "application/json",
                });
                res.end(JSON.stringify(data, null, 2));
            };
            res.send = (data) => {
                let contentType = "text/html";
                const isObject = typeof data === "object";
                if (isObject) {
                    contentType = "application/json";
                }
                res.writeHead(status, {
                    "Content-Type": contentType,
                });
                res.end(isObject ? JSON.stringify(data, null, 2) : data);
            };
            res.status = (code) => {
                status = code;
                return { json: res.json, send: res.send };
            };

            if (req.method !== "GET" && req.method !== "DELETE") {
                let body = "";
                req.on("data", (data) => {
                    body += data.toString();
                });
                await new Promise((resolve, reject) => {
                    req.on("end", () => {
                        req.body = JSON.parse(body);
                        resolve();
                    });
                    req.on("error", () => {
                        reject();
                    });
                });
            }
            const { urlString, id, query } = this.cleanURL(req.url);
            req.query = query;
            req.params = {};

            let matchingRoutes = [];
            if (id) {
                const { routes: matchingRoutesWithParams, id: routeId } =
                    this.findMatchingRoutesWithParams(urlString, req.method);

                matchingRoutes = matchingRoutesWithParams;

                const singleMatchingRouteWithParams = matchingRoutes.find(
                    (route) => route.path?.split(":")[0] === urlString
                );

                if (!singleMatchingRouteWithParams) {
                    matchingRoutes = this.findMatchingRoutes("*", req.method);
                } else {
                    req.params[routeId] = id;
                }
            } else {
                matchingRoutes = this.findMatchingRoutes(urlString, req.method);
                const singleMatchingRouteWithoutParams = matchingRoutes.find(
                    (route) => route.path === urlString
                );
                if (!singleMatchingRouteWithoutParams)
                    matchingRoutes = this.findMatchingRoutes("*", req.method);
            }

            if (matchingRoutes.length > 0) {
                let index = 0;
                //next declared
                const next = () => {
                    const route = matchingRoutes[index++];
                    if (route) {
                        route.handler(req, res, next);
                    } else {
                        // res.writeHead(404, { "Content-type": "text/plain" });
                        res.status(404).send(
                            `404 cannot find ${req.method} ${req.url}`
                        );
                        return;
                    }
                };

                next();
            } else {
                res.end(`404 cannot ${req.method} ${req.url}`);
            }
        }).listen(port, handler);
    }
}

const xpressLab = () => {
    return new XpressLab();
};
xpressLab.static = staticFunc;
export default xpressLab;
