import { Router } from 'express';

import { query } from '../db/query.js';
import { asyncHandler } from '../lib/async-handler.js';
import { requireAuth } from '../lib/auth.js';
import { HttpError } from '../lib/http-error.js';
import { requireAccountRole } from '../middleware/require-account-role.js';

const wishlistRouter = Router();

function mapWishlistRow(row) {
  return {
    category: row.category,
    co2DivertedKg: Number(row.co2_diverted_kg),
    conditionLabel: row.condition_label,
    ecoScoreGrade: row.eco_score_grade,
    ecoScoreNumeric: Number(row.eco_score_numeric),
    id: row.id,
    imageUrl: row.image_url,
    material: {
      id: row.material_id,
      name: row.material_name,
    },
    price: Number(row.price),
    seller: {
      id: row.seller_id,
      name: row.seller_name,
    },
    status: row.status,
    title: row.title,
    waterSavedLiters: Number(row.water_saved_liters),
  };
}

wishlistRouter.get('/', requireAuth, requireAccountRole(['buyer']), asyncHandler(async (request, response) => {
  const result = await query(
    `
      SELECT
        p.id,
        p.title,
        p.category,
        p.price,
        p.condition_label,
        p.eco_score_grade,
        p.eco_score_numeric,
        p.water_saved_liters,
        p.co2_diverted_kg,
        p.image_url,
        p.status,
        u.id AS seller_id,
        u.full_name AS seller_name,
        mr.id AS material_id,
        mr.name AS material_name
      FROM wishlist_items wi
      INNER JOIN products p ON p.id = wi.product_id
      INNER JOIN users u ON u.id = p.seller_id
      INNER JOIN materials_registry mr ON mr.id = p.material_id
      WHERE wi.user_id = $1
      ORDER BY wi.created_at DESC
    `,
    [request.auth.userId],
  );

  response.json({
    wishlist: result.rows.map(mapWishlistRow),
  });
}));

wishlistRouter.post('/', requireAuth, requireAccountRole(['buyer']), asyncHandler(async (request, response) => {
  const { productId } = request.body;

  if (!productId) {
    throw new HttpError(400, 'A product id is required to save to wishlist.');
  }

  const productResult = await query('SELECT id, seller_id FROM products WHERE id = $1', [productId]);

  if (productResult.rowCount === 0) {
    throw new HttpError(404, 'Product was not found.');
  }

  if (Number(productResult.rows[0].seller_id) === request.auth.userId) {
    throw new HttpError(400, 'You cannot wishlist your own listing.');
  }

  await query(
    `
      INSERT INTO wishlist_items (user_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, product_id) DO NOTHING
    `,
    [request.auth.userId, productId],
  );

  response.status(201).json({ success: true });
}));

wishlistRouter.delete('/:productId', requireAuth, requireAccountRole(['buyer']), asyncHandler(async (request, response) => {
  await query('DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2', [request.auth.userId, request.params.productId]);

  response.json({ success: true });
}));

export { wishlistRouter };
