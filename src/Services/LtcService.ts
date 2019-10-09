import * as Client from "bitcoin-core";
import config from "../config/.ltc";

export default class LtcService {

    private ltc_client;

    constructor() {
        this.ltc_client = new Client(config);
    }

    createWallet(account) {
        return this.ltc_client.getAccountAddress(account);
    }

    checkValidAddress(address:string) {
        return this.ltc_client.validateAddress(address);
    }

    getAccount(address:string) {
        return this.ltc_client.getAccount(address);
    }

    getBalance(account:string) {
        return this.ltc_client.getBalance(account);
    }

    getTransaction(txid : string) {
        return this.ltc_client.getTransaction(txid);
    }

    transfer({send_from, send_to, send_amount}) {
        if(send_from == '*') {
            return this.ltc_client.sendToAddress(send_to, Number(send_amount));
        }
        return this.ltc_client.sendFrom(send_from, send_to, Number(send_amount), 1);
    }

    getTransactions(account : string, from : number, size : number) {
        return this.ltc_client.listTransactions('*', size, from);
    }
}