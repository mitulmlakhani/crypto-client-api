import { Request, Response } from 'express';
import XmrService from '../Services/XmrService';

export default class XmrController {

    private xmrService;

    constructor() {
        this.xmrService = new XmrService();
    }

    createWallet = (req : Request, res : Response) => {
        try {
            this.xmrService.createWallet().then( address =>  { 

                const wallet = {
                    success: 1,
                    message: "New Address Created",
                    'address': address,
                    'privateKey': ''
                };

                res.status(200).json(wallet);

            }).catch(error => {
                if (error) { res.status(500).json({error : error, success : 0}); return; }
            });
            
        } catch (error) {
            res.status(500).json({error : error.message, success : 0});
        }
    }

    checkBalance = (req : Request, res : Response) => {
        try {
            const balance = this.xmrService.getBalance().then(balance => {
                res.status(200).json({
                    success: 1,
                    'balance' : balance,
                    message: "Balance.",
                });
            }).catch(error => {
                res.status(500).json({error : error, success : 0});    
            });

        } catch (error) {
            res.status(500).json({error : error.message, success : 0});
        }
    }
    
    transfer = (req : Request, res : Response) => {
        try {
            let destination = {
                destinations: [
                    { address : req.body.send_to, amount : req.body.send_amount }
                ],
                payment_id : req.body.private_key
            };

            this.xmrService.transfer(destination).then(transaction =>  {
                res.status(200).json({
                    success: 1,
                    'txid' : transaction.tx_key,
                    message: "send xmr successfull.",
                });
            }).catch(error => {
                res.status(500).json({error : error, success : 0});
            });

        } catch (error) {
            res.status(500).json({error : error.message, success : 0});
        }
    }

    getTransaction = (req : Request, res : Response) => {
        try {
            console.log(this.xmrService);
            this.xmrService.getTransaction(req.params.txHash).then(transaction => {
                res.status(200).json({
                    success: 1,
                    'transaction' : transaction,
                    message: "Get transaction successfull.",
                });
            }).catch(error => {
                res.status(500).json({error : error, success : 0})
            });

        } catch (error) {
            res.status(500).json({error : error.message, success : 0});
        }
    }

    getPayments = (req : Request, res : Response) => {
        try {
            this.xmrService.getPayments(req.params.PaymentId).then(payments => {
                res.status(200).json({
                    success: 1,
                    'payments' : payments,
                    message: "Get Payments successfull.",
                });
            }).catch(error => {
                res.status(500).json({error : error, success : 0})
            });

        } catch (error) {
            res.status(500).json({error : error.message, success : 0});
        }
    }

    getTransactions = (req : Request, res : Response) => {
        try {
            this.xmrService.getTransactions(req.query.type).then(transactions => {
                res.status(200).json({
                    success: 1,
                    'transactions' : transactions,
                    message: "Get transactions successfull.",
                });
            }).catch(error => {
                res.status(500).json({error : error, success : 0})
            });

        } catch (error) {
            res.status(500).json({error : error.message, success : 0});
        }
    }
}