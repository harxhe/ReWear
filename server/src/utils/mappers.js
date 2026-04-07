export function mapUser(user) {
  return {
    id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl || null,
    totalWaterSavedLiters: Number(user.totalWaterSavedLiters || 0),
    totalCo2DivertedKg: Number(user.totalCo2DivertedKg || 0),
    createdAt: user.createdAt,
  };
}

export function mapMaterial(material) {
  return {
    id: String(material._id),
    name: material.name,
    category: material.category,
    description: material.description,
    waterCostLiters: Number(material.waterCostLiters),
    carbonCostKg: Number(material.carbonCostKg),
    baseValue: Number(material.baseValue),
  };
}

export function mapProduct(product) {
  const seller = product.sellerId;
  const material = product.materialId;

  return {
    category: product.category,
    co2DivertedKg: Number(product.co2DivertedKg),
    conditionLabel: product.conditionLabel,
    createdAt: product.createdAt,
    description: product.description,
    ecoScoreGrade: product.ecoScoreGrade,
    ecoScoreNumeric: Number(product.ecoScoreNumeric),
    id: String(product._id),
    imageUrl: product.imageUrl,
    material: {
      category: material.category,
      id: String(material._id),
      name: material.name,
    },
    price: Number(product.price),
    seller: {
      id: String(seller._id),
      name: seller.fullName,
    },
    status: product.status,
    title: product.title,
    waterSavedLiters: Number(product.waterSavedLiters),
  };
}
