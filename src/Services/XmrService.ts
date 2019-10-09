import { Wallet } from 'monero-rpc';
import config from '../config/.xmr';
import * as request from 'request';

export default class XmrService {

    private xmr_wallet;

    constructor() {
        this.xmr_wallet = new Wallet(config.url);
    }

    createWallet() {
        return new Promise((resolve, reject) => {

            this.sendRequest('getaddress', [], (response) => {
                if (response.error) {
                    reject(response.error.message);
                } else {
                    resolve(response.result.address);
                }

            });

        });
    }

    getBalance() {
        return new Promise((resolve, reject) => {

            this.sendRequest('getbalance', [], (response) => {
                if (response.error) {
                    reject(response.error.message);
                } else {
                    resolve(response.result.balance);
                }

            });

        });
    }

    transfer(destinations) {
        return new Promise((resolve, reject) => {
            const options = destinations ? destinations : [];

            this.sendRequest('transfer', options, (response) => {

                if (response.error) {
                    reject(response.error.message);
                } else {
                    resolve(response.result);
                }

            });
        });
    }

    getTransaction(txid) {
        return new Promise((resolve, reject) => {
            const options = { "txid": txid };

            this.sendRequest('get_transfer_by_txid', options, (response) => {

                if (response.error) {
                    reject(response.error.message);
                } else {
                    resolve(response.result);
                }

            });

        });
    }

    getPayments(paymentId) {
        return new Promise((resolve, reject) => {
            const options = paymentId ? { 'payment_id': paymentId } : [];

            this.sendRequest('get_payments', options, (response) => {

                if (response.error) {
                    reject(response.error.message);
                } else {
                    resolve(response.result);
                }

            });

        });
    }

    getTransactions(type) {
        const options = type ? { type: true } : [];

        return new Promise((resolve, reject) => {

            this.sendRequest('get_transfers', options, (response) => {
                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response.result);
                }

            });

        });
    }

    sendRequest(method, params, callback) {

        const body = JSON.stringify({ "jsonrpc": "2.0", "id": "0", "method": method, "params": params });

        const options = {
            uri : config.url,
            forever: true,
            method: 'POST',
            body : body,
            auth : {
                user:  config.user,
                pass: config.password,
                sendImmediately: false
            }
        }

        request(options, (error, response, body) => {
            switch (response.statusCode) {
            case 200:
                    callback(JSON.parse(body));
                    break;
                case 401:
                    callback({ 'error': 'Monero Rpc Server Unauthorised Request !' });
                    break;
                case 404:
                    callback({ 'error': 'Monero Rpc Server Not Found !' });
                    break;
                default:
                    callback({ 'error': 'Monero Rpc Some Internal Server Error !' });
                    break;
            }
        });
        return;

    }
}