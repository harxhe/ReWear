import { Router } from 'express';

import { authRouter } from './auth.routes.js';
import { materialsRouter } from './materials.routes.js';
import { purchasesRouter } from './purchases.routes.js';
import { productsRouter } from './products.routes.js';
import { usersRouter } from './users.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/materials', materialsRouter);
apiRouter.use('/purchases', purchasesRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/users', usersRouter);

export { apiRouter };
