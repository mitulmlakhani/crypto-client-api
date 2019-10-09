import * as Client from "bitcoin-core";
import config from "../config/.btc";

export default class BtcService {

    private btc_client;

    constructor() {
        this.btc_client = new Client(config);
    }

    createWallet(account) {
        return this.btc_client.getAccountAddress(account);
    }

    checkValidAddress(address:string) {
        return this.btc_client.validateAddress(address);
    }

    getAccount(address:string) {
        return this.btc_client.getAccount(address);
    }

    getBalance(account:string) {
        return this.btc_client.getBalance(account);
    }

    getTransaction(txid : string) {
        return this.btc_client.getTransaction(txid);
    }
    
    transfer({send_from, send_to, send_amount}) {
        if(send_from == '*') {
            return this.btc_client.sendToAddress(send_to, Number(send_amount));
        }
        return this.btc_client.sendFrom(send_from, send_to, Number(send_amount), 1);
    }
    
    getTransactions(account : string, from : number, size : number) {
        return this.btc_client.listTransactions('*', size, from);
    }
}


