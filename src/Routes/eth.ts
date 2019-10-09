import { Router } from "express";
import EthController from '../Controllers/EthController';

const EthRouter = (() => {
    let router = Router();
    let _EthController = new EthController();
    
    router.get('/address', _EthController.createWallet);
    router.get('/validateAddress/:address', _EthController.validateAddress);
    router.get('/balance/:address', _EthController.checkBalance);
    router.get('/transaction/:txHash', _EthController.getTransaction);
    router.post('/transfer', _EthController.transfer);
    router.get('/transactions/:address', _EthController.getTransactions);
    
    return router;
})();

export default EthRouter;