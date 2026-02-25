import { pgTable, text, boolean, timestamp, decimal, json, uuid, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const UserRole = { BUYER: "BUYER", SUPPLIER: "SUPPLIER", ADMIN: "ADMIN" } as const;
export const SupplierStatus = { PENDING: "PENDING", APPROVED: "APPROVED", REJECTED: "REJECTED" } as const;
export const OrderStatus = { PENDING_PAYMENT: "PENDING_PAYMENT", CONFIRMED: "CONFIRMED", PROCESSING: "PROCESSING", SHIPPED: "SHIPPED", DELIVERED: "DELIVERED", CANCELLED: "CANCELLED", REFUNDED: "REFUNDED" } as const;
export const OrderItemStatus = { PENDING: "PENDING", PROCESSING: "PROCESSING", SHIPPED: "SHIPPED", DELIVERED: "DELIVERED" } as const;
export const PaymentMethod = { COD: "COD", ONLINE: "ONLINE" } as const;
export const PaymentStatus = { PENDING: "PENDING", PAID: "PAID", FAILED: "FAILED", REFUNDED: "REFUNDED" } as const;
export const ProductUnit = { KG: "KG", G: "G", PACK: "PACK" } as const;

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  authId: text("auth_id").unique(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  name: text("name"),
  phone: text("phone"),
  role: text("role").default(UserRole.BUYER).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const supplierProfiles = pgTable("supplier_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").unique().notNull(),
  businessName: text("business_name").notNull(),
  businessNameAr: text("business_name_ar").notNull(),
  iban: text("iban").notNull(),
  taxNumber: text("tax_number"),
  isTaxRegistered: boolean("is_tax_registered").default(false).notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  logoUrl: text("logo_url"),
  status: text("status").default(SupplierStatus.PENDING).notNull(),
  rejectionReason: text("rejection_reason"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").unique().notNull(),
  parentId: uuid("parent_id"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierId: uuid("supplier_id").notNull(),
  categoryId: uuid("category_id"),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  slug: text("slug").unique().notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").default(ProductUnit.KG).notNull(),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  minOrderQuantity: integer("min_order_quantity").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull(),
  url: text("url").notNull(),
  altText: text("alt_text"),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const productAttributes = pgTable("product_attributes", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull(),
  attributeKey: text("attribute_key").notNull(),
  attributeValueEn: text("attribute_value_en").notNull(),
  attributeValueAr: text("attribute_value_ar").notNull(),
});

export const shippingZones = pgTable("shipping_zones", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull(),
  zoneNameEn: text("zone_name_en").notNull(),
  zoneNameAr: text("zone_name_ar").notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).notNull(),
  estimatedDays: integer("estimated_days"),
  allowsCod: boolean("allows_cod").default(true).notNull(),
});

export const priceTiers = pgTable("price_tiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull(),
  minQuantity: integer("min_quantity").notNull(),
  maxQuantity: integer("max_quantity"),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(),
});

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  label: text("label"),
  city: text("city").notNull(),
  district: text("district"),
  street: text("street").notNull(),
  postalCode: text("postal_code"),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyerId: uuid("buyer_id").notNull(),
  orderNumber: text("order_number").unique().notNull(),
  status: text("status").default(OrderStatus.PENDING_PAYMENT).notNull(),
  paymentMethod: text("payment_method").default(PaymentMethod.COD).notNull(),
  paymentStatus: text("payment_status").default(PaymentStatus.PENDING).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingTotal: decimal("shipping_total", { precision: 10, scale: 2 }).default("0").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  addressSnapshot: json("address_snapshot"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull(),
  productId: uuid("product_id").notNull(),
  supplierId: uuid("supplier_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0").notNull(),
  supplierPayout: decimal("supplier_payout", { precision: 10, scale: 2 }).notNull(),
  trackingNumber: text("tracking_number"),
  itemStatus: text("item_status").default(OrderItemStatus.PENDING).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const userRelations = relations(users, ({ one, many }) => ({
  supplierProfile: one(supplierProfiles, { fields: [users.id], references: [supplierProfiles.userId] }),
  addresses: many(addresses),
  orders: many(orders),
}));

export const supplierProfileRelations = relations(supplierProfiles, ({ one, many }) => ({
  user: one(users, { fields: [supplierProfiles.userId], references: [users.id] }),
  products: many(products),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  images: many(productImages),
  attributes: many(productAttributes),
  shippingZones: many(shippingZones),
  priceTiers: many(priceTiers),
  supplier: one(supplierProfiles, { fields: [products.supplierId], references: [supplierProfiles.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
}));

export const productImageRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const productAttributeRelations = relations(productAttributes, ({ one }) => ({
  product: one(products, { fields: [productAttributes.productId], references: [products.id] }),
}));

export const shippingZoneRelations = relations(shippingZones, ({ one }) => ({
  product: one(products, { fields: [shippingZones.productId], references: [products.id] }),
}));

export const priceTierRelations = relations(priceTiers, ({ one }) => ({
  product: one(products, { fields: [priceTiers.productId], references: [products.id] }),
}));

export const addressRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, { fields: [orders.buyerId], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true, deletedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export const insertSupplierProfileSchema = createInsertSchema(supplierProfiles).omit({ id: true, createdAt: true, updatedAt: true, approvedAt: true });
export type InsertSupplierProfile = z.infer<typeof insertSupplierProfileSchema>;
export type SupplierProfile = typeof supplierProfiles.$inferSelect;

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export const insertProductAttributeSchema = createInsertSchema(productAttributes).omit({ id: true });
export type InsertProductAttribute = z.infer<typeof insertProductAttributeSchema>;
export type ProductAttribute = typeof productAttributes.$inferSelect;

export const insertShippingZoneSchema = createInsertSchema(shippingZones).omit({ id: true });
export type InsertShippingZone = z.infer<typeof insertShippingZoneSchema>;
export type ShippingZone = typeof shippingZones.$inferSelect;

export const insertPriceTierSchema = createInsertSchema(priceTiers).omit({ id: true });
export type InsertPriceTier = z.infer<typeof insertPriceTierSchema>;
export type PriceTier = typeof priceTiers.$inferSelect;

export const insertAddressSchema = createInsertSchema(addresses).omit({ id: true, createdAt: true });
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Address = typeof addresses.$inferSelect;

// Extended product type with relations for frontend use
export type ProductWithDetails = Product & {
  attributes: ProductAttribute[];
  shippingZones: ShippingZone[];
  priceTiers: PriceTier[];
  supplier?: SupplierProfile;
  category?: Category;
};
