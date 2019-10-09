import { Router } from "express";
import TokenController from '../Controllers/MmtController';
import EthController from '../Controllers/EthController';

const MmtRouter = (() => {
    let router = Router();
    let _MmtController = new TokenController();
    let _EthController = new EthController();

    router.get('/address', _EthController.createWallet);
    router.get('/validateAddress/:address', _EthController.validateAddress);
    router.get('/balance/:address', _MmtController.checkBalance);
    router.get('/transaction/:txHash', _MmtController.getTransaction);
    router.post('/transfer', _MmtController.transfer);
    router.get('/transactions/:address', _MmtController.getTransactions);
    
    return router;
})();

export default MmtRouter;