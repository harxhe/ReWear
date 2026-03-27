import { Router } from 'express';

import { authRouter } from './auth.routes.js';
import { materialsRouter } from './materials.routes.js';
import { productsRouter } from './products.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/materials', materialsRouter);
apiRouter.use('/products', productsRouter);

export { apiRouter };
