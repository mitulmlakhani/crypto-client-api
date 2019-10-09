import {Request, Response} from "express";
import BtcService from '../Services/BtcService';
import * as uuidv1 from "uuid/v1";
import config from "../config/.btc";

export default class BtcController {
    private btcService;

    constructor() {
        this.btcService = new BtcService();
    }

    createWallet = (req : Request, res : Response) => {
        try {
            let account = uuidv1();
            this.btcService.createWallet(account).then(address => {

                const wallet = {
                    success: 1,
                    message: "New Address Created",
                    address: address,
                    privateKey: account
                };

                res.status(200).json(wallet);

            }).catch(error => {
                res.status(500).json({error : error.message, success : 0})
            });
            
        } catch (error) {
            res.status(500).json({error : error.message, 'success' : 0});
        }
    }

    validateAddress = (req : Request, res : Response) => {
        try {
            this.btcService.checkValidAddress(req.params.address).then(response => {

                res.status(200).json({
                    success: 1,
                    status : response.isvalid,
                    message: "Address Validation complete.",
                });

            }).catch(error => {
                res.status(500).json({error : error.message, success : 0})
            });

        } catch (error) {
            res.status(500).json({ error: error.message, success : 0 });
        }
    }

    checkBalance = async (req : Request, res : Response) => {
        try{
            const account = await this.btcService.getAccount(req.params.address).then(response => { return response; }).catch(error => { res.status(500).json({error : error.message, success : 0}) });
            if(!account) {
                res.status(400).json({ error: 'address is not belongs to cryptomerchant or invalid.', success : 0 });
                return;
            }

            this.btcService.getBalance(account).then(balance => {
                
                res.status(200).json({
                    success: 1,
                    balance : balance,
                    message: "Balance.",
                });

            }).catch(error => {
                res.status(500).json({error : error.message, success : 0})
            });

        } catch (error) {
            res.status(500).json({ error: error.message, success : 0 });
        }
    }
    
    checkTotalBalance = async (req : Request, res : Response) => {
        try{
            this.btcService.getBalance("*").then(balance => {
                
                res.status(200).json({
                    success: 1,
                    balance : balance,
                    message: "Balance.",
                });

            }).catch(error => {
                res.status(500).json({error : error.message, success : 0})
            });

        } catch (error) {
            res.status(500).json({ error: error.message, success : 0 });
        }
    }

    getTransaction = async (req : Request, res : Response) => {
        try {
            this.btcService.getTransaction(req.params.txHash).then(transaction => {

                res.status(200).json({
                    success: 1,
                    transaction : transaction,
                    message: "Get transaction successfull.",
                });

            }).catch(error => {
                res.status(500).json({error : error.message, success : 0})
            });
            
        } catch (error) {
            res.status(500).json({ error: error.message, success : 0 });
        }
    }

    transfer = async (req : Request, res : Response) => {
        try {
            // get send from account
            let send_from = undefined;
            if(req.body.keyname == config.core_address){
                send_from = '*';        
            } else {
                send_from = await this.btcService.getAccount(req.body.keyname).then(response => { return response; }).catch(error => { res.status(500).json({error : error.message, success : 0}) });
                if(!send_from) {
                    res.status(400).json({ error: 'from address is not belongs to cryptomerchant or invalid.', success : 0 });
                    return;
                }
            }
            // checking balance of send from account
            await this.btcService.getBalance(send_from).then(response => {
                if(response < req.body.send_amount) {
                    res.status(400).json({ error : 'Withdrawal amount exceeds your wallet balance.', success : 0});
                    return;
                }
            }).catch((error) => {
                res.status(500).json({error : error.message, success : 0})
            });

            this.btcService.transfer({'send_from' : send_from, 'send_to' : req.body.send_to, 'send_amount' : req.body.send_amount}).then(transaction => {
                res.status(200).json({
                    success: 1,
                    txid : transaction,
                    message: "send btc successfull.",
                });

            }).catch(error => {
                console.log(error);
                res.status(500).json({error : error.message, success : 0})
            });

        } catch (error) {
            res.status(500).json({ error: error.message, success : 0 });
        }
    }

    getTransactions = async (req : Request, res : Response) => {
        try {
            let account = undefined;
            if(req.body.keyname == config.core_address){
                account = '*';        
            } else {
                account = await this.btcService.getAccount(req.params.address).then(response => { return response; }).catch(error => { res.status(500).json({error : error.message, success : 0}) });
                if(!account) {
                    res.status(400).json({ error: 'address is not belongs to cryptomerchant or invalid.', success : 0 });
                    return;
                }
            }

            const from = Number(req.query.from) || 0;
            const size = Number(req.query.size) || 100;

            this.btcService.getTransactions('*', from, size).then(transactions => {
                let transactionList = [];
                transactions.forEach(transaction => {
                    if(transaction.category == 'receive') {
                        transaction.to = transaction.address;
                        transactionList.push(transaction);
                    }
                });
                res.status(200).json({
                    success: 1,
                    transactions : transactionList,
                    message: "Get transactions successfull.",
                });

            }).catch(error => {
                res.status(500).json({error : error.message, success : 0})
            });
            
        } catch (error) {
            res.status(500).json({ error: error.message, success : 0 });
        }
    }
}