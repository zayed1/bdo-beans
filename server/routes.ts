import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { type User } from "@shared/schema";
import { supabaseAdmin } from "./lib/supabase";

function paramId(req: Request): string {
  return String(req.params['id']);
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data: { user: supaUser }, error } = await supabaseAdmin.auth.getUser(token);
      if (supaUser && !error) {
        const dbUser = await storage.getUserByAuthId(supaUser.id);
        if (dbUser) req.user = dbUser;
      }
    }
  } catch (e) {}
  next();
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

async function requireApprovedSupplier(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'SUPPLIER') {
    return res.status(403).json({ message: "Supplier access required" });
  }
  const profile = await storage.getSupplierProfile(req.user.id);
  if (!profile || profile.status !== 'APPROVED') {
    return res.status(403).json({ message: "Supplier not approved" });
  }
  (req as any).supplierProfile = profile;
  next();
}

async function seedDatabase() {
  try {
    const existingCategories = await storage.getCategories();
    if (existingCategories.length > 0) return;

    // Create categories
    const coffee = await storage.createCategory({ nameEn: "Coffee", nameAr: "قهوة", slug: "coffee", parentId: null, imageUrl: null, sortOrder: 1, isActive: true });
    const tea = await storage.createCategory({ nameEn: "Tea", nameAr: "شاي", slug: "tea", parentId: null, imageUrl: null, sortOrder: 2, isActive: true });
    const matcha = await storage.createCategory({ nameEn: "Matcha", nameAr: "ماتشا", slug: "matcha", parentId: null, imageUrl: null, sortOrder: 3, isActive: true });
    const accessories = await storage.createCategory({ nameEn: "Accessories", nameAr: "أدوات", slug: "accessories", parentId: null, imageUrl: null, sortOrder: 4, isActive: true });

    const seedUsers = [
      { email: "supplier1@bdobeans.com", name: "محمصة الفجر", phone: "0501234567", role: "SUPPLIER" },
      { email: "supplier2@bdobeans.com", name: "مزارع ماتشا اليابان", phone: "0507654321", role: "SUPPLIER" },
      { email: "admin@bdobeans.com", name: "مدير المنصة", phone: "0500000000", role: "ADMIN" },
    ];

    const dbUsers: any[] = [];
    for (const su of seedUsers) {
      let authId: string | null = null;
      try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: su.email,
          password: "password123",
          email_confirm: true,
          user_metadata: { name: su.name, role: su.role },
        });
        if (data?.user) authId = data.user.id;
        if (error && !error.message.includes("already")) console.error("Seed auth error:", error.message);
      } catch (e) {}

      const user = await storage.createUser({
        email: su.email, password: "supabase-managed", name: su.name, phone: su.phone,
        role: su.role, isActive: true, authId,
      });
      dbUsers.push(user);
    }
    const [supplierUser1, supplierUser2] = dbUsers;

    // Create supplier profiles
    const profile1 = await storage.createSupplierProfile({
      userId: supplierUser1.id, businessName: "Al-Fajr Roasters", businessNameAr: "محمصة الفجر",
      iban: "SA1234567890123456789012", taxNumber: "300123456789012",
      isTaxRegistered: true, description: "Premium specialty coffee roasters based in Riyadh",
      descriptionAr: "محمصة قهوة مختصة في الرياض متخصصة في أجود أنواع البن",
      logoUrl: null, status: "APPROVED", rejectionReason: null
    });
    const profile2 = await storage.createSupplierProfile({
      userId: supplierUser2.id, businessName: "Japan Matcha Farms", businessNameAr: "مزارع ماتشا اليابان",
      iban: "SA9876543210987654321098", taxNumber: null,
      isTaxRegistered: false, description: "Authentic matcha directly from Japanese farms",
      descriptionAr: "ماتشا أصلية مباشرة من مزارع اليابان",
      logoUrl: null, status: "APPROVED", rejectionReason: null
    });

    // Products
    const p1 = await storage.createProduct({
      supplierId: profile1.id, categoryId: coffee.id,
      nameEn: "Ethiopian Yirgacheffe", nameAr: "إثيوبيا يرغاتشيف",
      descriptionEn: "Single-origin Ethiopian Yirgacheffe with bright citrus and floral notes. Grown at 1,900m altitude.",
      descriptionAr: "قهوة إثيوبية يرغاتشيف أحادية المصدر بإيحاءات الحمضيات والزهور. تُزرع على ارتفاع 1900 متر.",
      slug: "ethiopian-yirgacheffe", basePrice: "135.00", unit: "KG",
      stockQuantity: 50, minOrderQuantity: 1, isActive: true
    });
    const p2 = await storage.createProduct({
      supplierId: profile1.id, categoryId: coffee.id,
      nameEn: "Colombian Supremo", nameAr: "كولومبيا سوبريمو",
      descriptionEn: "Rich and full-bodied Colombian Supremo with caramel and chocolate undertones.",
      descriptionAr: "قهوة كولومبية سوبريمو غنية وكاملة القوام بلمسات الكراميل والشوكولاتة.",
      slug: "colombian-supremo", basePrice: "120.00", unit: "KG",
      stockQuantity: 30, minOrderQuantity: 1, isActive: true
    });
    const p3 = await storage.createProduct({
      supplierId: profile1.id, categoryId: coffee.id,
      nameEn: "Kenya AA Nyeri", nameAr: "كينيا AA نييري",
      descriptionEn: "Premium Kenya AA from Nyeri region. Bright, complex with berry and wine notes.",
      descriptionAr: "كينيا AA ممتازة من منطقة نييري. مشرقة ومعقدة بإيحاءات التوت والنبيذ.",
      slug: "kenya-aa-nyeri", basePrice: "155.00", unit: "KG",
      stockQuantity: 20, minOrderQuantity: 1, isActive: true
    });
    const p4 = await storage.createProduct({
      supplierId: profile2.id, categoryId: matcha.id,
      nameEn: "Ceremonial Grade Matcha", nameAr: "ماتشا سيريموني",
      descriptionEn: "Premium ceremonial grade matcha from Uji, Kyoto. Vibrant green with sweet umami flavor.",
      descriptionAr: "ماتشا من الدرجة الاحتفالية من أوجي، كيوتو. لون أخضر نابض بنكهة أومامي حلوة.",
      slug: "ceremonial-matcha", basePrice: "220.00", unit: "PACK",
      stockQuantity: 40, minOrderQuantity: 1, isActive: true
    });
    const p5 = await storage.createProduct({
      supplierId: profile2.id, categoryId: matcha.id,
      nameEn: "Culinary Matcha", nameAr: "ماتشا للطبخ",
      descriptionEn: "High quality culinary matcha perfect for lattes, smoothies, and baking.",
      descriptionAr: "ماتشا للطبخ عالية الجودة مثالية للاتيه والسموذي والمخبوزات.",
      slug: "culinary-matcha", basePrice: "85.00", unit: "PACK",
      stockQuantity: 60, minOrderQuantity: 2, isActive: true
    });
    const p6 = await storage.createProduct({
      supplierId: profile1.id, categoryId: tea.id,
      nameEn: "Moroccan Mint Tea", nameAr: "شاي مغربي بالنعناع",
      descriptionEn: "Classic Moroccan gunpowder green tea blend with dried mint leaves.",
      descriptionAr: "شاي أخضر مغربي كلاسيكي مع أوراق النعناع المجففة.",
      slug: "moroccan-mint-tea", basePrice: "65.00", unit: "KG",
      stockQuantity: 45, minOrderQuantity: 1, isActive: true
    });
    const p7 = await storage.createProduct({
      supplierId: profile1.id, categoryId: coffee.id,
      nameEn: "Yemen Mocha Ismaili", nameAr: "يمني مخا إسماعيلي",
      descriptionEn: "Rare Yemeni coffee with rich, wine-like body and dried fruit flavors.",
      descriptionAr: "قهوة يمنية نادرة بقوام غني يشبه النبيذ ونكهات الفواكه المجففة.",
      slug: "yemen-mocha-ismaili", basePrice: "280.00", unit: "KG",
      stockQuantity: 10, minOrderQuantity: 1, isActive: true
    });
    const p8 = await storage.createProduct({
      supplierId: profile1.id, categoryId: coffee.id,
      nameEn: "Brazil Santos", nameAr: "برازيل سانتوس",
      descriptionEn: "Smooth and nutty Brazilian Santos. Medium body with low acidity.",
      descriptionAr: "قهوة برازيل سانتوس ناعمة بنكهة المكسرات. قوام متوسط وحموضة منخفضة.",
      slug: "brazil-santos", basePrice: "95.00", unit: "KG",
      stockQuantity: 70, minOrderQuantity: 1, isActive: true
    });

    // Add attributes for ALL products
    const allProductAttrs = [
      { product: p1, processing: { en: "washed", ar: "مغسولة" }, roast: { en: "light", ar: "فاتح" }, origin: { en: "Ethiopia", ar: "إثيوبيا" }, brew: { en: "filter", ar: "تقطير" } },
      { product: p2, processing: { en: "natural", ar: "مجففة" }, roast: { en: "medium", ar: "متوسط" }, origin: { en: "Colombia", ar: "كولومبيا" }, brew: { en: "both", ar: "الاثنين" } },
      { product: p3, processing: { en: "washed", ar: "مغسولة" }, roast: { en: "light", ar: "فاتح" }, origin: { en: "Kenya", ar: "كينيا" }, brew: { en: "filter", ar: "تقطير" } },
      { product: p4, processing: { en: "stone_ground", ar: "مطحون بالحجر" }, roast: { en: "none", ar: "بدون" }, origin: { en: "Japan", ar: "اليابان" }, brew: { en: "whisk", ar: "خفق" } },
      { product: p5, processing: { en: "stone_ground", ar: "مطحون بالحجر" }, roast: { en: "none", ar: "بدون" }, origin: { en: "Japan", ar: "اليابان" }, brew: { en: "both", ar: "الاثنين" } },
      { product: p6, processing: { en: "dried", ar: "مجففة" }, roast: { en: "none", ar: "بدون" }, origin: { en: "Morocco", ar: "المغرب" }, brew: { en: "steep", ar: "نقع" } },
      { product: p7, processing: { en: "natural", ar: "مجففة" }, roast: { en: "dark", ar: "غامق" }, origin: { en: "Yemen", ar: "اليمن" }, brew: { en: "espresso", ar: "إسبريسو" } },
      { product: p8, processing: { en: "natural", ar: "مجففة" }, roast: { en: "medium", ar: "متوسط" }, origin: { en: "Brazil", ar: "البرازيل" }, brew: { en: "both", ar: "الاثنين" } },
    ];

    for (const a of allProductAttrs) {
      await storage.createProductAttributes([
        { productId: a.product.id, attributeKey: "processing_method", attributeValueEn: a.processing.en, attributeValueAr: a.processing.ar },
        { productId: a.product.id, attributeKey: "roast_level", attributeValueEn: a.roast.en, attributeValueAr: a.roast.ar },
        { productId: a.product.id, attributeKey: "origin_country", attributeValueEn: a.origin.en, attributeValueAr: a.origin.ar },
        { productId: a.product.id, attributeKey: "brew_method", attributeValueEn: a.brew.en, attributeValueAr: a.brew.ar },
      ]);
    }

    // Shipping zones for all products
    const allProducts = [p1, p2, p3, p4, p5, p6, p7, p8];
    for (const p of allProducts) {
      await storage.createShippingZones([
        { productId: p.id, zoneNameEn: "Within Riyadh", zoneNameAr: "داخل الرياض", shippingCost: "15.00", estimatedDays: 1, allowsCod: true },
        { productId: p.id, zoneNameEn: "Central Region", zoneNameAr: "المنطقة الوسطى", shippingCost: "25.00", estimatedDays: 3, allowsCod: true },
        { productId: p.id, zoneNameEn: "Other Regions", zoneNameAr: "مناطق أخرى", shippingCost: "40.00", estimatedDays: 5, allowsCod: false },
      ]);
    }

    // Price tiers for ALL products
    for (const p of allProducts) {
      await storage.createPriceTiers([
        { productId: p.id, minQuantity: 1, maxQuantity: 4, pricePerUnit: p.basePrice },
        { productId: p.id, minQuantity: 5, maxQuantity: 9, pricePerUnit: (Number(p.basePrice) * 0.9).toFixed(2) },
        { productId: p.id, minQuantity: 10, maxQuantity: null, pricePerUnit: (Number(p.basePrice) * 0.8).toFixed(2) },
      ]);
    }

    console.log("Database seeded successfully with products, attributes, zones, and tiers");
  } catch (err) {
    console.error("Failed to seed database:", err);
  }
}

async function migrateUsersToSupabaseAuth() {
  try {
    const seedEmails = ["supplier1@bdobeans.com", "supplier2@bdobeans.com", "admin@bdobeans.com"];
    for (const email of seedEmails) {
      const dbUser = await storage.getUserByEmail(email);
      if (!dbUser || dbUser.authId) continue;

      try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: dbUser.email,
          password: "password123",
          email_confirm: true,
          user_metadata: { name: dbUser.name, role: dbUser.role },
        });
        if (data?.user) {
          await storage.updateUser(dbUser.id, { authId: data.user.id });
          console.log(`Migrated ${email} to Supabase Auth (authId: ${data.user.id})`);
        }
        if (error) {
          if (error.message.includes("already been registered") || error.message.includes("already")) {
            const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
            const existing = listData?.users?.find(u => u.email === email);
            if (existing) {
              await storage.updateUser(dbUser.id, { authId: existing.id });
              console.log(`Linked existing Supabase user ${email} (authId: ${existing.id})`);
            }
          } else {
            console.error(`Auth migration error for ${email}:`, error.message);
          }
        }
      } catch (e) {
        console.error(`Migration failed for ${email}:`, e);
      }
    }
  } catch (e) {
    console.error("User migration error:", e);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Apply optional auth to all routes
  app.use(optionalAuth);

  // ============ AUTH ============
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByEmail(input.email);
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const { data: supaUser, error: supaError } = await supabaseAdmin.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: { name: input.name, role: input.role || "BUYER" },
      });
      if (supaError || !supaUser.user) {
        console.error("Supabase auth error:", supaError);
        return res.status(400).json({ message: supaError?.message || "Failed to create auth user" });
      }

      const user = await storage.createUser({
        email: input.email, password: "supabase-managed", name: input.name || null,
        phone: null, role: input.role || "BUYER", isActive: true, authId: supaUser.user.id
      });

      if (input.role === 'SUPPLIER' && input.businessName && input.businessNameAr) {
        await storage.createSupplierProfile({
          userId: user.id, businessName: input.businessName, businessNameAr: input.businessNameAr,
          iban: input.iban || "", taxNumber: input.taxNumber || null,
          isTaxRegistered: false, description: null, descriptionAr: null,
          logoUrl: null, status: "PENDING", rejectionReason: null
        });
      }

      const profile = input.role === 'SUPPLIER' ? await storage.getSupplierProfile(user.id) : null;
      res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role, supplierProfile: profile });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Register error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });
      if (error || !data.user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const dbUser = await storage.getUserByAuthId(data.user.id);
      if (!dbUser) {
        return res.status(401).json({ message: "User not found" });
      }

      const profile = dbUser.role === 'SUPPLIER' ? await storage.getSupplierProfile(dbUser.id) : null;
      res.json({
        id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role,
        supplierProfile: profile,
        session: { access_token: data.session?.access_token, refresh_token: data.session?.refresh_token }
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.logout.path, async (req, res) => {
    res.json({ message: "Logged out" });
  });

  app.get(api.auth.me.path, async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not logged in" });
    }
    const profile = req.user.role === 'SUPPLIER' ? await storage.getSupplierProfile(req.user.id) : null;
    res.json({ id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role, supplierProfile: profile });
  });

  // ============ CATEGORIES ============
  app.get(api.categories.list.path, async (req, res) => {
    try {
      const cats = await storage.getCategories();
      res.json(cats);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // ============ PRODUCTS ============
  app.get(api.products.list.path, async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string | undefined,
        categoryId: req.query.categoryId as string | undefined,
        processing: req.query.processing ? (req.query.processing as string).split(',') : undefined,
        roast: req.query.roast ? (req.query.roast as string).split(',') : undefined,
        origin: req.query.origin ? (req.query.origin as string).split(',') : undefined,
        brew: req.query.brew ? (req.query.brew as string).split(',') : undefined,
        priceMin: req.query.price_min ? Number(req.query.price_min) : undefined,
        priceMax: req.query.price_max ? Number(req.query.price_max) : undefined,
        inStock: req.query.in_stock === 'true',
        sort: req.query.sort as string | undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 12,
      };
      const result = await storage.getProducts(filters);
      res.json(result);
    } catch (err) {
      console.error("Products error:", err);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get(api.products.get.path, async (req, res) => {
    try {
      const product = await storage.getProduct(paramId(req));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // ============ ORDERS ============
  app.post(api.orders.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);

      // Fetch all products and validate stock
      let subtotal = 0;
      let shippingTotal = 0;
      const orderItemsData: any[] = [];

      for (const item of input.items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product not found: ${item.productId}` });
        }
        if (product.stockQuantity < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.nameAr}` });
        }

        // Calculate tier pricing
        let unitPrice = Number(product.basePrice);
        if (product.priceTiers.length > 0) {
          const sortedTiers = [...product.priceTiers].sort((a, b) => a.minQuantity - b.minQuantity);
          for (const tier of sortedTiers) {
            if (item.quantity >= tier.minQuantity && (tier.maxQuantity === null || item.quantity <= tier.maxQuantity)) {
              unitPrice = Number(tier.pricePerUnit);
            }
          }
        }

        const itemSubtotal = unitPrice * item.quantity;
        // Default shipping
        const shippingCost = product.shippingZones.length > 0 ? Number(product.shippingZones[0].shippingCost) : 0;
        const supplierPayout = itemSubtotal * 0.95;

        subtotal += itemSubtotal;
        shippingTotal += shippingCost;

        orderItemsData.push({
          productId: item.productId,
          supplierId: product.supplierId,
          quantity: item.quantity,
          unitPrice: unitPrice.toFixed(2),
          subtotal: itemSubtotal.toFixed(2),
          shippingCost: shippingCost.toFixed(2),
          supplierPayout: supplierPayout.toFixed(2),
        });
      }

      const platformFee = subtotal * 0.05;
      const totalAmount = subtotal + shippingTotal;

      const orderStatus = input.paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING_PAYMENT';

      const { order, items } = await storage.createOrderWithTransaction(
        {
          buyerId: req.user!.id,
          orderNumber: `BDO-${Date.now().toString(36).toUpperCase()}`,
          status: orderStatus,
          paymentMethod: input.paymentMethod || "COD",
          paymentStatus: "PENDING",
          subtotal: subtotal.toFixed(2),
          shippingTotal: shippingTotal.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          platformFee: platformFee.toFixed(2),
          notes: input.notes || null,
          addressSnapshot: input.address || null,
        },
        orderItemsData,
        input.items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      );

      res.status(201).json({ ...order, items });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      if (err instanceof Error && err.message.startsWith("INSUFFICIENT_STOCK:")) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
      console.error("Order error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.orders.myOrders.path, requireAuth, async (req, res) => {
    const orders = await storage.getOrdersByBuyer(req.user!.id);
    res.json(orders);
  });

  app.get(api.orders.get.path, requireAuth, async (req, res) => {
    const order = await storage.getOrderWithItems(paramId(req));
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  // ============ ADDRESSES ============
  app.get("/api/addresses", requireAuth, async (req, res) => {
    try {
      const addrs = await storage.getAddresses(req.user!.id);
      res.json(addrs);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });

  app.post("/api/addresses", requireAuth, async (req, res) => {
    try {
      const { city, district, street, label, postalCode, isDefault } = req.body;
      if (!city || !street) {
        return res.status(400).json({ message: "Missing required address fields (city, street)" });
      }
      const addr = await storage.createAddress({
        userId: req.user!.id,
        city, district: district || null, street,
        label: label || null, postalCode: postalCode || null,
        isDefault: isDefault || false,
      });
      res.status(201).json(addr);
    } catch (err) {
      res.status(500).json({ message: "Failed to create address" });
    }
  });

  // ============ SUPPLIER ROUTES ============
  app.get(api.supplier.dashboard.path, requireAuth, requireRole('SUPPLIER'), async (req, res) => {
    const profile = await storage.getSupplierProfile(req.user!.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const products = await storage.getProductsBySupplier(profile.id);
    const orderItems = await storage.getOrderItemsBySupplier(profile.id);

    const totalSales = orderItems.reduce((sum, i) => sum + Number(i.subtotal), 0);
    const pendingOrders = orderItems.filter(i => i.itemStatus === 'PENDING').length;
    const activeProducts = products.filter(p => p.isActive).length;

    res.json({ totalSales, pendingOrders, activeProducts, monthlyRevenue: totalSales, recentOrders: orderItems.slice(0, 5) });
  });

  app.get(api.supplier.products.path, requireAuth, requireRole('SUPPLIER'), async (req, res) => {
    const profile = await storage.getSupplierProfile(req.user!.id);
    if (!profile) return res.json([]);
    const products = await storage.getProductsBySupplier(profile.id);
    res.json(products);
  });

  app.post(api.products.create.path, requireAuth, requireApprovedSupplier, async (req, res) => {
    try {
      const { attributes, shippingZones: zones, priceTiers: tiers, ...productData } = req.body;
      const profile = (req as any).supplierProfile;

      const product = await storage.createProduct({
        ...productData,
        supplierId: profile.id,
        slug: productData.nameEn.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36),
      });

      if (attributes?.length) await storage.createProductAttributes(attributes.map((a: any) => ({ ...a, productId: product.id })));
      if (zones?.length) await storage.createShippingZones(zones.map((z: any) => ({ ...z, productId: product.id })));
      if (tiers?.length) await storage.createPriceTiers(tiers.map((t: any) => ({ ...t, productId: product.id })));

      res.status(201).json(product);
    } catch (err) {
      console.error("Create product error:", err);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put(api.products.update.path, requireAuth, requireApprovedSupplier, async (req, res) => {
    try {
      const { attributes, shippingZones: zones, priceTiers: tiers, ...productData } = req.body;
      const product = await storage.updateProduct(paramId(req), productData);

      if (attributes) {
        await storage.deleteProductAttributes(paramId(req));
        if (attributes.length) await storage.createProductAttributes(attributes.map((a: any) => ({ ...a, productId: paramId(req) })));
      }
      if (zones) {
        await storage.deleteShippingZones(paramId(req));
        if (zones.length) await storage.createShippingZones(zones.map((z: any) => ({ ...z, productId: paramId(req) })));
      }
      if (tiers) {
        await storage.deletePriceTiers(paramId(req));
        if (tiers.length) await storage.createPriceTiers(tiers.map((t: any) => ({ ...t, productId: paramId(req) })));
      }

      res.json(product);
    } catch (err) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.patch(api.products.toggleActive.path, requireAuth, requireApprovedSupplier, async (req, res) => {
    const product = await storage.getProduct(paramId(req));
    if (!product) return res.status(404).json({ message: "Product not found" });
    const updated = await storage.updateProduct(paramId(req), { isActive: !product.isActive });
    res.json(updated);
  });

  app.get(api.supplier.orders.path, requireAuth, requireRole('SUPPLIER'), async (req, res) => {
    const profile = await storage.getSupplierProfile(req.user!.id);
    if (!profile) return res.json([]);
    const items = await storage.getOrderItemsBySupplier(profile.id);
    res.json(items);
  });

  app.patch(api.supplier.updateOrderItem.path, requireAuth, requireRole('SUPPLIER'), async (req, res) => {
    try {
      const { itemStatus, trackingNumber } = req.body;
      const updated = await storage.updateOrderItem(paramId(req), { itemStatus, trackingNumber: trackingNumber || undefined });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update order item" });
    }
  });

  app.get(api.supplier.finances.path, requireAuth, requireRole('SUPPLIER'), async (req, res) => {
    const profile = await storage.getSupplierProfile(req.user!.id);
    if (!profile) return res.json({ totalEarned: 0, platformFees: 0, netPayout: 0, transactions: [] });
    const items = await storage.getOrderItemsBySupplier(profile.id);
    const totalEarned = items.reduce((sum, i) => sum + Number(i.subtotal), 0);
    const platformFees = totalEarned * 0.05;
    const netPayout = totalEarned - platformFees;
    res.json({ totalEarned, platformFees, netPayout, transactions: items });
  });

  app.get(api.supplier.profile.path, requireAuth, requireRole('SUPPLIER'), async (req, res) => {
    const profile = await storage.getSupplierProfile(req.user!.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  });

  app.put(api.supplier.updateProfile.path, requireAuth, requireRole('SUPPLIER'), async (req, res) => {
    const profile = await storage.getSupplierProfile(req.user!.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    const updated = await storage.updateSupplierProfile(profile.id, req.body);
    res.json(updated);
  });

  // ============ ADMIN ROUTES ============
  app.get(api.admin.dashboard.path, requireAuth, requireRole('ADMIN'), async (req, res) => {
    const allOrders = await storage.getAllOrders();
    const allSuppliers = await storage.getAllSupplierProfiles();
    const pendingSuppliers = allSuppliers.filter(s => s.status === 'PENDING');

    const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const platformFees = allOrders.reduce((sum, o) => sum + Number(o.platformFee), 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= today).length;

    res.json({
      totalRevenue, platformFees,
      activeSuppliers: allSuppliers.filter(s => s.status === 'APPROVED').length,
      pendingApprovals: pendingSuppliers.length,
      totalOrders: allOrders.length,
      todayOrders
    });
  });

  app.get(api.admin.suppliers.path, requireAuth, requireRole('ADMIN'), async (req, res) => {
    const status = req.query.status as string | undefined;
    const suppliers = await storage.getAllSupplierProfiles(status);
    res.json(suppliers);
  });

  app.post(api.admin.approveSupplier.path, requireAuth, requireRole('ADMIN'), async (req, res) => {
    const profile = await storage.getSupplierProfileById(paramId(req));
    if (!profile) return res.status(404).json({ message: "Supplier not found" });
    const updated = await storage.updateSupplierProfile(paramId(req), { status: "APPROVED", approvedAt: new Date() });
    res.json(updated);
  });

  app.post(api.admin.rejectSupplier.path, requireAuth, requireRole('ADMIN'), async (req, res) => {
    const { reason } = req.body;
    const profile = await storage.getSupplierProfileById(paramId(req));
    if (!profile) return res.status(404).json({ message: "Supplier not found" });
    const updated = await storage.updateSupplierProfile(paramId(req), { status: "REJECTED", rejectionReason: reason });
    res.json(updated);
  });

  app.get(api.admin.orders.path, requireAuth, requireRole('ADMIN'), async (req, res) => {
    const allOrders = await storage.getAllOrders();
    res.json(allOrders);
  });

  app.get(api.admin.products.path, requireAuth, requireRole('ADMIN'), async (req, res) => {
    const result = await storage.getProducts({ page: 1, limit: 100 });
    res.json(result.products);
  });

  app.get(api.admin.finances.path, requireAuth, requireRole('ADMIN'), async (req, res) => {
    const allOrders = await storage.getAllOrders();
    const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalFees = allOrders.reduce((sum, o) => sum + Number(o.platformFee), 0);
    const allSuppliers = await storage.getAllSupplierProfiles('APPROVED');

    const supplierSummary = await Promise.all(allSuppliers.map(async (s) => {
      const items = await storage.getOrderItemsBySupplier(s.id);
      const totalSales = items.reduce((sum, i) => sum + Number(i.subtotal), 0);
      const fees = totalSales * 0.05;
      return { supplierId: s.id, businessName: s.businessNameAr, totalSales, fees, payout: totalSales - fees };
    }));

    res.json({ totalRevenue, totalFees, supplierPayouts: totalRevenue - totalFees, suppliers: supplierSummary });
  });

  // Seed on startup, then migrate users to Supabase Auth
  seedDatabase().then(() => migrateUsersToSupabaseAuth());

  return httpServer;
}
