import * as Web3 from "web3";
import config from "../config/.eth";
import * as net from "net";
import BigNumber from "bignumber.js";
import * as request from 'request';


export default class EthService {
    
    private web3;

    constructor() {
        this.web3 = new Web3(new Web3.providers.IpcProvider(config.web3Config.ipc_path, net));
    }

    createWallet() {
        return new Promise((resolve, reject) => {
            resolve(this.web3.eth.accounts.create());
        });
    }

    checkValidEthereumAddress(address : string) {
        return new Promise((resolve, reject) => {
            try {
                resolve(this.web3.utils.isAddress(address));
            } catch (e) {
                resolve(false);
            }
        });
    }

    getEtherBalance(address) {
        return new Promise(async (resolve, reject) => {
            try {
                const balance = await this.web3.eth.getBalance(address);
                resolve(this.web3.utils.fromWei(balance, 'ether'));
            } catch (e) {
                resolve(e);
            }
        })
    }

    getTransaction(txHash) {
        return new Promise(async (resolve, reject) => {
            try {
                let transaction = await this.web3.eth.getTransaction(txHash);
                if (transaction) {
                    transaction.amount = this.web3.utils.fromWei(transaction.value, 'ether');
                    resolve(transaction)
                } else {
                    reject(new Error('TRANSACTION NOT FOUND'));
                }
            } catch (e) {
                reject(e)
            }
        })
    }

    async getGasPrice() {
        const gasPrice = await this.web3.eth.getGasPrice();
        const basePriceBN = new BigNumber(gasPrice);
        const extraPriceBN = (basePriceBN.multipliedBy(new BigNumber(75))).div(new BigNumber(100));
        return basePriceBN.plus(extraPriceBN)
    }

    etherTransfer(recipientAddress,value, address, privateKey) {
        return new Promise(async (resolve, reject) => {
            try {
                var gasObj = {
                    to: recipientAddress,
                    from: address,
                    value: this.web3.utils.toHex(this.web3.utils.toWei(value, 'ether'))
                };
                var nonce = await this.web3.eth.getTransactionCount(address);
                var gasEstimate = await this.web3.eth.estimateGas(gasObj);
                var balance = await this.web3.eth.getBalance(address);
                const balanceBN = new BigNumber(balance);
                const finalPriceBN = await this.getGasPrice();
                const estTransactionCostBN = new BigNumber(gasEstimate).multipliedBy(finalPriceBN);
                
                if (balanceBN.lt(estTransactionCostBN)) {
                    reject(new Error('not enough balance'));
                } else {
                    let tranactionHash;
                    let that = this;
                    let transaction = await this.web3.eth.accounts.signTransaction({
                        to: recipientAddress,
                        value: this.web3.utils.toWei(value, 'ether').toString(),
                        gas: gasEstimate.toString(),
                        gasPrice: finalPriceBN.toString(),
                        nonce: nonce,
                     }, privateKey);

                    this.web3.eth.sendSignedTransaction(transaction.rawTransaction)
                        .on('transactionHash', function (hash) {
                            tranactionHash = hash;
                            resolve({tranactionHash:tranactionHash});

                        })
                        .on('receipt', function (receipt) {
                            const gasUsedBN = that.web3.utils.toBN(receipt["gasUsed"]).toString();
                            const gasPrice = that.web3.utils.toBN(finalPriceBN.toString(), 10);
                            const transactionCost = that.web3.utils.toBN(gasUsedBN).mul(that.web3.utils.toBN(gasPrice));
                            receipt['transaction_cost'] = that.web3.utils.fromWei(transactionCost, 'ether');
                            receipt['gas_estimation'] = gasUsedBN.toString();
                            receipt['gas_price'] = finalPriceBN.toString();
                            resolve([receipt]);
                        })
                        .on('confirmation', function (confirmationNumber) {
                            resolve([confirmationNumber]);
                        })
                        .on('error', function (error) {
                            reject({error:{tranactionHash:tranactionHash, nonce:nonce, error:error, finalPriceBN:finalPriceBN.toString()}});
                        });
                }
            } catch (e) {
                reject(e);
            }
        })
    }

    async getBlock(blockNumber, address, transactionsList) {
        await this.web3.eth.getBlock(blockNumber, true).then((block) => {
            if (block != null && block.transactions != null) {
                block.transactions.forEach(function(e) {
                    if (address == e.from || address == e.to) {
                        transactionsList.push(e);
                    }
                });
            }
            return transactionsList;
        }).catch(console.log);
    }

    getTransactionsFromLocalNode(address) {
        return new Promise( async (resolve, reject) => {
            try {
                let endBlockNumber = await this.web3.eth.getBlockNumber().then(b => { return b; });
                let startBlockNumber = 0;
                let transactionsList = [];
                let i = endBlockNumber;
                let results = [];

                while(i >= startBlockNumber) {
                    results.push(this.getBlock(i, address, transactionsList));
                    i--;
                }
                await Promise.all(results);
                resolve(transactionsList);
            } catch (error) {
                reject(error);   
            }
        });
    }

    getTransactions(address) {
        return new Promise( async (resolve, reject) => {
            request('https://api.etherscan.io/api?module=account&action=txlist&address='+address+'&startblock='+config.start_block+'&endblock=latest&sort=desc&apikey='+config.etherscan_api_token, (error, response, body) => {
                if(error) { reject(error); }
                
                let _body = JSON.parse(body);
                
                if(response.statusCode == 200 && _body.status == 1) {
                    let transactions = _body.result;

                    let i = 0;
                    while(i < transactions.length) {
                        transactions[i].amount = this.web3.utils.fromWei(transactions[i].value, 'ether');
                        transactions[i].txid = transactions[i].hash;
                        i++;
                    }
                    resolve(transactions);
                } else {
                    if(_body.result) {
                        resolve([]);
                        return;
                    }
                    
                    reject(response);
                }
            });
        });
    }
}