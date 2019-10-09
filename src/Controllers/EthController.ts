import { Request, Response } from 'express';
import EthService from '../Services/EthService';

export default class EthController {

    private ethService;

    async init() {
        this.ethService = await new EthService();
        return this.ethService.web3.eth.net.isListening();
    }

    // Crete new account
    createWallet = async (req : Request, res : Response) => {
        try {
            await this.init().catch(e => { throw new Error('Failed to connect Ether IPC.'); });

            const newAccount = await this.ethService.createWallet().then(response => {
                return response;
            }).catch((error: any) => {
                throw error;
            });

            const wallet = {
                success: 1,
                message: "New Address Created",
                address: newAccount.address,
                privateKey: newAccount.privateKey
            };

            res.status(200).json(wallet);
        }
        catch (error) {
            res.status(500).json({ error: error.message, success : 0 });
        }
    }

    // Check ether address is valid or not
    validateAddress = async (req : Request, res : Response) => {
        try {
            await this.init().catch(e => { throw new Error('Failed to connect Ether IPC.'); });

            const validAddress = await this.ethService.checkValidEthereumAddress(req.params.address).then(response => {
                return response;
            }).catch((error: any) => {
                throw error;
            });

            const response = {
                success: 1,
                status : validAddress,
                message: "Address Validation complete.",
             };

            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({ error: error.message, success : 0 });
        }
    }

    // get balance of address
    checkBalance = async (req : Request, res : Response) => {
        try {
            await this.init().catch(e => { throw new Error('Failed to connect Ether IPC.'); });

            const balance = await this.ethService.getEtherBalance(req.params.address).then(response => {
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

    // get transaction from blockchain transaction id
    getTransaction = async (req : Request, res : Response) => {
        try {
            await this.init().catch(e => { throw new Error('Failed to connect Ether IPC.'); });
           
            const transaction = await this.ethService.getTransaction(req.params.txHash).then(response => {
                return response;
            }).catch((error: any) => {
                throw error;
            });

            const response = {
                success: 1,
                transaction : transaction,
                message: "Get transaction successfull.",
            };
            
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({ error: error.message, success : 0 });
        }
    }
    
    // get transaction from blockchain transaction id
    getTransactions = async (req : Request, res : Response) => {
        try {
            await this.init().catch(e => { throw new Error('Failed to connect Ether IPC.'); });
           
            const transactions = await this.ethService.getTransactions(req.params.address).then(response => {
                return response;
            }).catch((error: any) => {
                res.status(500).json({ error: error.message, success : 0 });
            });

            const response = {
                success: 1,
                transactions : transactions,
                message: "Get transactions successfull.",
            };
            
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({ error: error.message, success : 0 });
        }
    }
    
    // Transfer ether
    transfer = async (req : Request, res : Response) => {
        try {
            await this.init().catch(e => { throw new Error('Failed to connect Ether IPC.'); });
           
            let valid = await this.validateTransferRequest(req.body);
            if(!valid) {
                await res.status(400).json({error : 'Bad Request !', success : 0});
                return;
            }

            const transaction = await this.ethService.etherTransfer(req.body.send_to, req.body.send_amount, req.body.keyname, req.body.private_key).then(response => {
                return response;
            }).catch((error: any) => {
                throw error;
            });

            const response = {
                success: 1,
                txid : transaction.tranactionHash,
                message: "send eth successfull.",
            };
            
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({ error: error.message, success : 0 });
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