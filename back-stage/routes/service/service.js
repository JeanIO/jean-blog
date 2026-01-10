import Router from '@koa/router';
import { getOSSAuthrization, getFileCosKey } from '../../controllers/service.js';

const serviceRouter = new Router();


serviceRouter.get('/getCOSAuthrization', getOSSAuthrization); // params: none
serviceRouter.get('/getCOSKey', getFileCosKey); // params: filename
export default serviceRouter;
