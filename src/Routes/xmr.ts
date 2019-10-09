import { Router } from 'express';
import XmrController from '../Controllers/XmrController';

const XmrRouter = (() => {
    const router = Router();
    const _XmrController = new XmrController();

    router.get('/address', _XmrController.createWallet);
    router.get('/balance/:address', _XmrController.checkBalance);
    router.post('/transfer', _XmrController.transfer);
    router.get('/transaction/:txHash', _XmrController.getTransaction);
    router.get('/payments/:PaymentId', _XmrController.getPayments);
    router.get('/transactions/:address', _XmrController.getTransactions);

    return router;
})();

export default XmrRouter;