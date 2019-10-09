import {Router} from "express";
import LtcController from "../Controllers/LtcController";

const LtcRouter = (() => {
    let router = Router();
    let _LtcController = new LtcController();

    router.get('/address', _LtcController.createWallet);
    router.get('/validateAddress/:address', _LtcController.validateAddress);
    router.get('/balance/:address', _LtcController.checkBalance);
    router.get('/total_balance', _LtcController.checkTotalBalance);
    router.get('/transaction/:txHash', _LtcController.getTransaction);
    router.post('/transfer', _LtcController.transfer);
    router.get('/transactions/:address', _LtcController.getTransactions);

    return router;
})();

export default LtcRouter;