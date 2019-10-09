import {Router} from "express";
import BtcController from "../Controllers/BtcController";

const BtcRouter = (() => {
    let router = Router();
    let _BtcController = new BtcController();

    router.get('/address', _BtcController.createWallet);
    router.get('/validateAddress/:address', _BtcController.validateAddress);
    router.get('/balance/:address', _BtcController.checkBalance);
    router.get('/total_balance', _BtcController.checkTotalBalance);
    router.get('/transaction/:txHash', _BtcController.getTransaction);
    router.post('/transfer', _BtcController.transfer);
    router.get('/transactions/:address', _BtcController.getTransactions);

    return router;
})();

export default BtcRouter;