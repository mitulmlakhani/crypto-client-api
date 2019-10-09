import * as Web3 from "web3";
import config from "../config/.eth";
import * as net from "net";
import BigNumber from "bignumber.js";
import * as request from 'request';

export default class TokenService {
    
    private web3;
    private token_address;
    private token_ABI;
    private contract;

    constructor(token) {
        this.web3 = new Web3(new Web3.providers.IpcProvider(config.web3Config.ipc_path, net));
        this.token_address = config.tokens[token].token_address;
        this.token_ABI = config.tokens[token].ABI;
        this.contract = new this.web3.eth.Contract(this.token_ABI, this.token_address);
    }

    getBalance(address) {
        return new Promise(async (resolve, reject) => {
            try {
                let decimals = await this.contract.methods.decimals().call((err, decimals) => {
                    if(err) { throw err; }
                    return decimals;
                });
                    
                await this.contract.methods.balanceOf(address).call(function(err, value){
                    if(err) { throw err; }

                    resolve(parseInt(value) / 10 ** (decimals - 2) / 100);
                });
            } catch (e) {
                reject(e);
            }
        })
    }

    getTransaction(txHash) {
        return new Promise(async(resolve, reject) => {
            try {
                let transaction = await this.web3.eth.getTransaction(txHash);
                if(transaction) {       
                    var options = {fromBlock: transaction.blockNumber, toBlock: transaction.blockNumber};
                    const _this = this;
                    
                    let transactions = await this.contract.getPastEvents('Transfer' || 'allEvents', options, async function (err, transactions){
                        if (err) { reject(err); }
                        return transactions;
                    });

                    await transactions.every(async function(trans, index) {
                        if(trans.transactionHash == txHash) {
                            let decimals = await _this.contract.methods.decimals().call((err, decimals) => {
                                if(err) { throw err; }
                                return decimals;
                            });

                            resolve({
                                "blockHash": trans.blockHash,
                                "blockNumber": trans.blockNumber,
                                "from": trans.returnValues.from,
                                "gas": transaction.gas,
                                "gasPrice": transaction.gasPrice,
                                "txid": trans.transactionHash,
                                "input": transaction.input,
                                "nonce": transaction.nonce,
                                "to": trans.returnValues.to,
                                "transactionIndex": trans.transactionIndex,
                                "v": transaction.v,
                                "r": transaction.r,
                                "s": transaction.s,
                                "amount": parseInt(trans.returnValues.value) / 10 ** (decimals - 2) / 100,
                            });

                            return false;
                        } else {
                            reject({message : "Transaction Not Found."})
                        }
                    });
                } else {
                    reject({message : "Transaction Not Found."})
                }
            } catch (err) {
                reject(err);
            }
        });
    }
    
    getTransactions(address) {
        return new Promise(async(resolve, reject) => {
            try {

                let decimals = await this.contract.methods.decimals().call((err, decimals) => {
                    if(err) { throw err; }
                    return decimals;
                });
                
                request('https://api.etherscan.io/api?module=account&action=tokentx&address='+address+'&startblock='+config.start_block+'&endblock=latest&sort=desc&apikey='+config.etherscan_api_token, (error, response, body) => {
                    if(error) { reject(error); }
                    
                    let _body = JSON.parse(body);            

                    if(response.statusCode == 200 && _body.status == 1) {
                        let transactions = _body.result;
                        let i = 0;

                        while(i < transactions.length) {                            
                            transactions[i].txid = transactions[i].hash;
                            transactions[i].amount = parseInt(transactions[i].value) / 10 ** (decimals - 2) / 100;
                        
                            i++;
                        }

                        resolve(transactions);
                    } else {
                        if(_body.result) {
                            resolve([]);
                            return;
                        }
                        reject({message : _body.result});
                    }
                });

            } catch (err) {
                reject(err);
            }
        });
    }

    transfer({send_to, send_amount, keyname, private_key}) {
        return new Promise(async (resolve, reject) => {
            try {
                var balance = await this.contract.methods.balanceOf(keyname).call();
                var tokens = this.web3.utils.toWei(send_amount.toString(), 'ether');
                const tokenAmount = this.web3.utils.toBN(tokens);
                const finalToken = this.web3.utils.toHex(tokenAmount);

                if (+balance < +finalToken) {
                    reject(new Error('not enough balance'));
                } else {
                    var data = this.contract.methods.transfer(send_to, finalToken).encodeABI();
                    let gas = await this.contract.methods.transfer(send_to, finalToken).estimateGas({from: keyname});
                    resolve(this.signTransaction(keyname, private_key, data, gas, this.token_address));
                }
            } catch (e) {
                reject(e);
            }
        })
    }

    signTransaction(address, privateKey, functionData, gasEstimate, to) {
        return new Promise(async (resolve, reject) => {
            try {
                const nonce = await this.web3.eth.getTransactionCount(address);
                const balance = await this.web3.eth.getBalance(address);
                const balanceBN = new BigNumber(balance);
                const finalPriceBN = await this.getGasPrice();
                const estTransactionCostBN = new BigNumber(gasEstimate).multipliedBy(finalPriceBN);
                if (balanceBN.lt(estTransactionCostBN)) {
                    reject(new Error('not enough balance'));
                } else {
                    let transaction = await this.web3.eth.accounts.signTransaction({
                        to: to,
                        data: functionData,
                        gas: gasEstimate,
                        gasPrice: finalPriceBN.toString(),
                        nonce: nonce,
                        chainId: await this.web3.eth.net.getId()
                    }, privateKey);
                    let tranactionHash;
                    let that = this;
                    this.web3.eth.sendSignedTransaction(transaction.rawTransaction)
                        .on('transactionHash', function (hash) {
                            resolve({"hash" : hash});
                        })
                        .on('receipt', function (receipt) {
                            const gasUsedBN = that.web3.utils.toBN(receipt["gasUsed"]).toString();
                            const gasPrice = that.web3.utils.toBN(finalPriceBN.toString(), 10);
                            const transactionCost = that.web3.utils.toBN(gasUsedBN).mul(that.web3.utils.toBN(gasPrice));
                            receipt['transaction_cost'] = that.web3.utils.fromWei(transactionCost, 'ether');
                            receipt['gas_estimation'] = gasUsedBN.toString();
                            receipt['gas_price'] = finalPriceBN.toString();
                            resolve([receipt, nonce]);
                        })
                        .on('confirmation', function (confirmationNumber, receipt) {
                            resolve([confirmationNumber, receipt]);
                        })
                        .on('error', function (error) {
                            resolve([tranactionHash, nonce, error]);
                        });
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    async getGasPrice() {
        const gasPrice = await this.web3.eth.getGasPrice();
        const basePriceBN = new BigNumber(gasPrice);
        const extraPriceBN = (basePriceBN.multipliedBy(new BigNumber(75))).div(new BigNumber(100));
        return basePriceBN.plus(extraPriceBN)
    }

}