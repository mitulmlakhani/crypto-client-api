import * as express from "express";
import * as bodyParser from "body-parser";
import EthRouter from "./../Routes/eth";
import MmtRouter from "./../Routes/mmt";

class App {
    public app : express.Application;

    constructor() {
        this.app = express();
        this.loadRequestMiddlewares();
    }

    private loadRequestMiddlewares(): void{
        // JSON POST data parsing
        this.app.use(bodyParser.json());
        // Routes
        this.app.use('/eth', EthRouter);
        this.app.use('/mmt', MmtRouter);
    }

}

export default new App().app;