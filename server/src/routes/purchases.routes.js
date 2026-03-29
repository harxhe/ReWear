import { Router } from 'express';

import { query } from '../db/query.js';
import { withTransaction } from '../db/transaction.js';
import { asyncHandler } from '../lib/async-handler.js';
import { requireAuth } from '../lib/auth.js';
import { HttpError } from '../lib/http-error.js';
import { requireAccountRole } from '../middleware/require-account-role.js';
import { syncUserBadges } from '../services/badge.service.js';

const purchasesRouter = Router();

purchasesRouter.post('/', requireAuth, requireAccountRole(['buyer']), asyncHandler(async (request, response) => {
  const { productId } = request.body;

  if (!productId) {
    throw new HttpError(400, 'A product id is required to create a purchase.');
  }

  const productResult = await query(
    `
      SELECT id, seller_id, price, status, water_saved_liters, co2_diverted_kg
      FROM products
      WHERE id = $1
    `,
    [productId],
  );

  if (productResult.rowCount === 0) {
    throw new HttpError(404, 'Product was not found.');
  }

  const product = productResult.rows[0];

  if (product.status !== 'available') {
    throw new HttpError(409, 'This product is no longer available.');
  }

  if (Number(product.seller_id) === request.auth.userId) {
    throw new HttpError(400, 'You cannot purchase your own listing.');
  }

  const purchaseResult = await withTransaction(async (db) => {
    const lockedProductResult = await db.query(
      `
        SELECT id, seller_id, price, status, water_saved_liters, co2_diverted_kg
        FROM products
        WHERE id = $1
        FOR UPDATE
      `,
      [productId],
    );

    const lockedProduct = lockedProductResult.rows[0];

    if (!lockedProduct) {
      throw new HttpError(404, 'Product was not found.');
    }

    if (lockedProduct.status !== 'available') {
      throw new HttpError(409, 'This product is no longer available.');
    }

    if (Number(lockedProduct.seller_id) === request.auth.userId) {
      throw new HttpError(400, 'You cannot purchase your own listing.');
    }

    const insertedPurchaseResult = await db.query(
      `
        INSERT INTO purchases (buyer_id, product_id, purchase_price, water_saved_liters, co2_diverted_kg)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, purchased_at
      `,
      [
        request.auth.userId,
        lockedProduct.id,
        lockedProduct.price,
        lockedProduct.water_saved_liters,
        lockedProduct.co2_diverted_kg,
      ],
    );

    await db.query('UPDATE products SET status = $1, updated_at = NOW() WHERE id = $2', ['sold', lockedProduct.id]);

    await db.query(
      `
        UPDATE users
        SET
          total_water_saved_liters = (
            SELECT COALESCE(SUM(water_saved_liters), 0)
            FROM purchases
            WHERE buyer_id = $1
          ),
          total_co2_diverted_kg = (
            SELECT COALESCE(SUM(co2_diverted_kg), 0)
            FROM purchases
            WHERE buyer_id = $1
          ),
          updated_at = NOW()
        WHERE id = $1
      `,
      [request.auth.userId],
    );

    await syncUserBadges(request.auth.userId, db);

    return {
      id: insertedPurchaseResult.rows[0].id,
      productId: lockedProduct.id,
      purchasedAt: insertedPurchaseResult.rows[0].purchased_at,
    };
  });

  response.status(201).json({
    purchase: purchaseResult,
  });
}));

export { purchasesRouter };
