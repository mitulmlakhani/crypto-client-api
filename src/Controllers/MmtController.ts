import { Request, Response } from 'express';
import TokenService from '../Services/TokenService';

export default class MmtController {

    private tokenService;

    async init() {
        this.tokenService = await new TokenService('mmt');
        return this.tokenService.web3.eth.net.isListening();
    }

    // get balance of address
    checkBalance = async (req : Request, res : Response) => {
        try {
            await this.init().catch(e => { throw 'Failed to connect Ether IPC.'; });
            const balance = await this.tokenService.getBalance(req.params.address).then(response => {
                return response;
            }).catch((error: any) => {
                throw error;
            });

            const response = {
                success: 1,
                balance : balance,
                message: "Balance ",
             };

            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({ error: error.message, success : 0 });
        }
    }

    getTransaction = async(req : Request, res : Response) => {
        try {
            await this.init().catch(e => { throw 'Failed to connect Ether IPC.'; });
            const transaction = await this.tokenService.getTransaction(req.params.txHash).then(response => {
                return response;
            }).catch((error : any) => {
                throw error;
            });

            const response = {
                success: 1,
                transaction : transaction,
                message: "Get transaction successfull.",
            };

            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({error : error.message, success : 0});
        }
    }
    
    getTransactions = async(req : Request, res : Response) => {
        try {
            await this.init().catch(e => { throw 'Failed to connect Ether IPC.'; });

            const transactions = await this.tokenService.getTransactions(req.params.address).then(response => {
                return response;
            }).catch((error : any) => {
                console.log(error);
                throw error;
            });

            const response = {
                success: 1,
                transactions : transactions,
                message: "Get transactions successfull.",
            };

            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({error : error.message, success : 0});
        }
    }
    
    transfer = async(req : Request, res : Response) => {
        try {
            await this.init().catch(e => { throw 'Failed to connect Ether IPC.'; });
            
            let valid = await this.validateTransferRequest(req.body);
            if(!valid) {
                await res.status(400).json({error : 'Bad Request !', success : 0});
                return;
            }

            const transaction = await this.tokenService.transfer(req.body).then(response => {
                return response;
            }).catch((error : any) => {
                throw error;
            });

            const response = {
                success: 1,
                txid : transaction.hash,
                message: "MMT Token transfer successfull.",
            };

            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({error : error.message, success : 0});
        }
    }

    private validateTransferRequest = async (params) => {
        var errors = [];
        
        if(!params.send_to) {
            errors['send_to'] = 'send_to is required.';
        }

        if(!params.send_amount) {
            errors['send_amount'] = 'send_amount is required.';
        }

        if(!params.keyname) {
            errors['keyname'] = 'keyname is required.';
        }

        if(!params.private_key) {
            errors['private_key'] = 'private_key is required.';
        }

        return Object.keys(errors).length ? false : true;
    }
}