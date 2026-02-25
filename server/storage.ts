import { db } from "./db";
import {
  users, supplierProfiles, categories, products, orders, orderItems,
  productImages, productAttributes, shippingZones, priceTiers, addresses,
  type User, type InsertUser, type Product, type InsertProduct, type Category,
  type Order, type InsertOrder, type InsertOrderItem, type OrderItem,
  type SupplierProfile, type InsertSupplierProfile, type ProductAttribute,
  type ShippingZone, type PriceTier, type InsertProductAttribute,
  type InsertShippingZone, type InsertPriceTier, type Address, type InsertAddress,
  type ProductWithDetails
} from "@shared/schema";
import { eq, ilike, and, gte, lte, gt, desc, asc, sql, inArray, or } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByAuthId(authId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;

  getSupplierProfile(userId: string): Promise<SupplierProfile | undefined>;
  getSupplierProfileById(id: string): Promise<SupplierProfile | undefined>;
  createSupplierProfile(profile: InsertSupplierProfile): Promise<SupplierProfile>;
  updateSupplierProfile(id: string, data: Partial<SupplierProfile>): Promise<SupplierProfile>;
  getAllSupplierProfiles(status?: string): Promise<(SupplierProfile & { user?: User })[]>;

  getProducts(filters: ProductFilters): Promise<{ products: ProductWithDetails[]; total: number }>;
  getProduct(id: string): Promise<ProductWithDetails | undefined>;
  getProductsBySupplier(supplierId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product>;

  createProductAttributes(attrs: InsertProductAttribute[]): Promise<ProductAttribute[]>;
  deleteProductAttributes(productId: string): Promise<void>;
  createShippingZones(zones: InsertShippingZone[]): Promise<ShippingZone[]>;
  deleteShippingZones(productId: string): Promise<void>;
  createPriceTiers(tiers: InsertPriceTier[]): Promise<PriceTier[]>;
  deletePriceTiers(productId: string): Promise<void>;

  getCategories(): Promise<Category[]>;
  createCategory(category: Omit<Category, "id" | "createdAt">): Promise<Category>;

  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]>;
  getOrdersByBuyer(buyerId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderWithItems(id: string): Promise<(Order & { items: OrderItem[] }) | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrderItemsBySupplier(supplierId: string): Promise<OrderItem[]>;
  updateOrderItem(id: string, data: Partial<OrderItem>): Promise<OrderItem>;
  updateOrder(id: string, data: Partial<Order>): Promise<Order>;

  getAddresses(userId: string): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;

  decrementStock(productId: string, quantity: number): Promise<void>;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  processing?: string[];
  roast?: string[];
  origin?: string[];
  brew?: string[];
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByAuthId(authId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.authId, authId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async getSupplierProfile(userId: string): Promise<SupplierProfile | undefined> {
    const [profile] = await db.select().from(supplierProfiles).where(eq(supplierProfiles.userId, userId));
    return profile;
  }

  async getSupplierProfileById(id: string): Promise<SupplierProfile | undefined> {
    const [profile] = await db.select().from(supplierProfiles).where(eq(supplierProfiles.id, id));
    return profile;
  }

  async createSupplierProfile(profile: InsertSupplierProfile): Promise<SupplierProfile> {
    const [created] = await db.insert(supplierProfiles).values(profile).returning();
    return created;
  }

  async updateSupplierProfile(id: string, data: Partial<SupplierProfile>): Promise<SupplierProfile> {
    const [updated] = await db.update(supplierProfiles).set(data).where(eq(supplierProfiles.id, id)).returning();
    return updated;
  }

  async getAllSupplierProfiles(status?: string): Promise<(SupplierProfile & { user?: User })[]> {
    if (status) {
      const profiles = await db.select().from(supplierProfiles).where(eq(supplierProfiles.status, status));
      const result = [];
      for (const p of profiles) {
        const [user] = await db.select().from(users).where(eq(users.id, p.userId));
        result.push({ ...p, user });
      }
      return result;
    }
    const profiles = await db.select().from(supplierProfiles);
    const result = [];
    for (const p of profiles) {
      const [user] = await db.select().from(users).where(eq(users.id, p.userId));
      result.push({ ...p, user });
    }
    return result;
  }

  async getProducts(filters: ProductFilters): Promise<{ products: ProductWithDetails[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const offset = (page - 1) * limit;

    let conditions: any[] = [eq(products.isActive, true)];

    if (filters.search) {
      conditions.push(
        or(
          ilike(products.nameAr, `%${filters.search}%`),
          ilike(products.nameEn, `%${filters.search}%`)
        )
      );
    }

    if (filters.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }

    if (filters.inStock) {
      conditions.push(gt(products.stockQuantity, 0));
    }

    if (filters.priceMin !== undefined) {
      conditions.push(gte(products.basePrice, filters.priceMin.toString()));
    }

    if (filters.priceMax !== undefined) {
      conditions.push(lte(products.basePrice, filters.priceMax.toString()));
    }

    // Get product IDs that match attribute filters
    if (filters.processing?.length || filters.roast?.length || filters.origin?.length || filters.brew?.length) {
      const attrConditions: any[] = [];
      if (filters.processing?.length) {
        attrConditions.push(
          and(eq(productAttributes.attributeKey, 'processing_method'), inArray(productAttributes.attributeValueEn, filters.processing))
        );
      }
      if (filters.roast?.length) {
        attrConditions.push(
          and(eq(productAttributes.attributeKey, 'roast_level'), inArray(productAttributes.attributeValueEn, filters.roast))
        );
      }
      if (filters.origin?.length) {
        attrConditions.push(
          and(eq(productAttributes.attributeKey, 'origin_country'), inArray(productAttributes.attributeValueEn, filters.origin))
        );
      }
      if (filters.brew?.length) {
        attrConditions.push(
          and(eq(productAttributes.attributeKey, 'brew_method'), inArray(productAttributes.attributeValueEn, filters.brew))
        );
      }

      if (attrConditions.length > 0) {
        const matchingAttrs = await db.select({ productId: productAttributes.productId })
          .from(productAttributes)
          .where(or(...attrConditions));
        const matchingIds = Array.from(new Set(matchingAttrs.map(a => a.productId)));
        if (matchingIds.length === 0) {
          return { products: [], total: 0 };
        }
        conditions.push(inArray(products.id, matchingIds));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Count
    const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(products).where(whereClause);
    const total = countResult?.count || 0;

    // Sort
    let orderBy: any = desc(products.createdAt);
    if (filters.sort === 'price_asc') orderBy = asc(products.basePrice);
    else if (filters.sort === 'price_desc') orderBy = desc(products.basePrice);
    else if (filters.sort === 'newest') orderBy = desc(products.createdAt);

    const productRows = await db.select().from(products).where(whereClause).orderBy(orderBy).limit(limit).offset(offset);

    // Fetch details for each product
    const enriched: ProductWithDetails[] = await Promise.all(
      productRows.map(async (p) => {
        const [attrs, zones, tiers, supplier, category] = await Promise.all([
          db.select().from(productAttributes).where(eq(productAttributes.productId, p.id)),
          db.select().from(shippingZones).where(eq(shippingZones.productId, p.id)),
          db.select().from(priceTiers).where(eq(priceTiers.productId, p.id)),
          p.supplierId ? db.select().from(supplierProfiles).where(eq(supplierProfiles.id, p.supplierId)).then(r => r[0]) : undefined,
          p.categoryId ? db.select().from(categories).where(eq(categories.id, p.categoryId)).then(r => r[0]) : undefined,
        ]);
        return { ...p, attributes: attrs, shippingZones: zones, priceTiers: tiers, supplier, category };
      })
    );

    return { products: enriched, total };
  }

  async getProduct(id: string): Promise<ProductWithDetails | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return undefined;

    const [attrs, zones, tiers, supplier, category] = await Promise.all([
      db.select().from(productAttributes).where(eq(productAttributes.productId, id)),
      db.select().from(shippingZones).where(eq(shippingZones.productId, id)),
      db.select().from(priceTiers).where(eq(priceTiers.productId, id)),
      product.supplierId ? db.select().from(supplierProfiles).where(eq(supplierProfiles.id, product.supplierId)).then(r => r[0]) : undefined,
      product.categoryId ? db.select().from(categories).where(eq(categories.id, product.categoryId)).then(r => r[0]) : undefined,
    ]);

    return { ...product, attributes: attrs, shippingZones: zones, priceTiers: tiers, supplier, category };
  }

  async getProductsBySupplier(supplierId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.supplierId, supplierId));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const [updated] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return updated;
  }

  async createProductAttributes(attrs: InsertProductAttribute[]): Promise<ProductAttribute[]> {
    if (attrs.length === 0) return [];
    return await db.insert(productAttributes).values(attrs).returning();
  }

  async deleteProductAttributes(productId: string): Promise<void> {
    await db.delete(productAttributes).where(eq(productAttributes.productId, productId));
  }

  async createShippingZones(zones: InsertShippingZone[]): Promise<ShippingZone[]> {
    if (zones.length === 0) return [];
    return await db.insert(shippingZones).values(zones).returning();
  }

  async deleteShippingZones(productId: string): Promise<void> {
    await db.delete(shippingZones).where(eq(shippingZones.productId, productId));
  }

  async createPriceTiers(tiers: InsertPriceTier[]): Promise<PriceTier[]> {
    if (tiers.length === 0) return [];
    return await db.insert(priceTiers).values(tiers).returning();
  }

  async deletePriceTiers(productId: string): Promise<void> {
    await db.delete(priceTiers).where(eq(priceTiers.productId, productId));
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.sortOrder));
  }

  async createCategory(category: Omit<Category, "id" | "createdAt">): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]> {
    if (items.length === 0) return [];
    return await db.insert(orderItems).values(items).returning();
  }

  async getOrdersByBuyer(buyerId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.buyerId, buyerId)).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderWithItems(id: string): Promise<(Order & { items: OrderItem[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    return { ...order, items };
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrderItemsBySupplier(supplierId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.supplierId, supplierId)).orderBy(desc(orderItems.createdAt));
  }

  async updateOrderItem(id: string, data: Partial<OrderItem>): Promise<OrderItem> {
    const [updated] = await db.update(orderItems).set(data).where(eq(orderItems.id, id)).returning();
    return updated;
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    const [updated] = await db.update(orders).set(data).where(eq(orders.id, id)).returning();
    return updated;
  }

  async getAddresses(userId: string): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const [created] = await db.insert(addresses).values(address).returning();
    return created;
  }

  async decrementStock(productId: string, quantity: number): Promise<void> {
    await db.update(products)
      .set({ stockQuantity: sql`${products.stockQuantity} - ${quantity}` })
      .where(eq(products.id, productId));
  }

  async createOrderWithTransaction(
    orderData: InsertOrder,
    itemsData: InsertOrderItem[],
    stockDecrements: { productId: string; quantity: number }[]
  ): Promise<{ order: Order; items: OrderItem[] }> {
    return await db.transaction(async (tx) => {
      for (const dec of stockDecrements) {
        const [product] = await tx.select({ stockQuantity: products.stockQuantity })
          .from(products).where(eq(products.id, dec.productId));
        if (!product || product.stockQuantity < dec.quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${dec.productId}`);
        }
      }

      const [order] = await tx.insert(orders).values(orderData).returning();
      const items = await tx.insert(orderItems)
        .values(itemsData.map(item => ({ ...item, orderId: order.id })))
        .returning();

      for (const dec of stockDecrements) {
        await tx.update(products)
          .set({ stockQuantity: sql`${products.stockQuantity} - ${dec.quantity}` })
          .where(eq(products.id, dec.productId));
      }

      return { order, items };
    });
  }
}

export const storage = new DatabaseStorage();
