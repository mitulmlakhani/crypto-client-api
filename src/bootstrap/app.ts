import * as express from "express";
import * as bodyParser from "body-parser";

class App {
    public app : express.Application;

    constructor() {
        this.app = express();
        this.loadRequestMiddlewares();
    }

    private loadRequestMiddlewares(): void{
        // JSON POST data parsing
        this.app.use(bodyParser.json());
    }

}

export default new App().app;