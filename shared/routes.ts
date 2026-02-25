import { z } from 'zod';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
  forbidden: z.object({ message: z.string() })
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
        role: z.enum(['BUYER', 'SUPPLIER']).default('BUYER'),
        businessName: z.string().optional(),
        businessNameAr: z.string().optional(),
        iban: z.string().optional(),
        taxNumber: z.string().optional(),
      }),
      responses: { 201: z.any(), 400: errorSchemas.validation }
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ email: z.string().email(), password: z.string() }),
      responses: { 200: z.any(), 401: errorSchemas.unauthorized }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: { 200: z.object({ message: z.string() }) }
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: { 200: z.any(), 401: errorSchemas.unauthorized }
    }
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      input: z.object({
        search: z.string().optional(),
        categoryId: z.string().optional(),
        processing: z.string().optional(),
        roast: z.string().optional(),
        origin: z.string().optional(),
        brew: z.string().optional(),
        priceMin: z.string().optional(),
        priceMax: z.string().optional(),
        inStock: z.string().optional(),
        sort: z.string().optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
      }).optional(),
      responses: { 200: z.object({ products: z.array(z.any()), total: z.number() }) }
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id' as const,
      responses: { 200: z.any(), 404: errorSchemas.notFound }
    },
    create: {
      method: 'POST' as const,
      path: '/api/products' as const,
      input: z.any(),
      responses: { 201: z.any(), 400: errorSchemas.validation }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/products/:id' as const,
      input: z.any(),
      responses: { 200: z.any(), 404: errorSchemas.notFound }
    },
    toggleActive: {
      method: 'PATCH' as const,
      path: '/api/products/:id/toggle' as const,
      responses: { 200: z.any(), 404: errorSchemas.notFound }
    }
  },
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories' as const,
      responses: { 200: z.array(z.any()) }
    }
  },
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: z.object({
        items: z.array(z.object({
          productId: z.string(),
          quantity: z.number().int().min(1)
        })),
        paymentMethod: z.string().default('COD'),
        notes: z.string().optional(),
        address: z.object({
          city: z.string(),
          district: z.string().optional(),
          street: z.string(),
          fullName: z.string(),
          phone: z.string(),
        }).optional()
      }),
      responses: { 201: z.any(), 400: errorSchemas.validation, 401: errorSchemas.unauthorized }
    },
    myOrders: {
      method: 'GET' as const,
      path: '/api/orders/me' as const,
      responses: { 200: z.array(z.any()), 401: errorSchemas.unauthorized }
    },
    get: {
      method: 'GET' as const,
      path: '/api/orders/:id' as const,
      responses: { 200: z.any(), 404: errorSchemas.notFound }
    }
  },
  supplier: {
    dashboard: {
      method: 'GET' as const,
      path: '/api/supplier/dashboard' as const,
      responses: { 200: z.any() }
    },
    products: {
      method: 'GET' as const,
      path: '/api/supplier/products' as const,
      responses: { 200: z.array(z.any()) }
    },
    orders: {
      method: 'GET' as const,
      path: '/api/supplier/orders' as const,
      responses: { 200: z.array(z.any()) }
    },
    updateOrderItem: {
      method: 'PATCH' as const,
      path: '/api/supplier/order-items/:id' as const,
      input: z.object({ itemStatus: z.string(), trackingNumber: z.string().optional() }),
      responses: { 200: z.any() }
    },
    finances: {
      method: 'GET' as const,
      path: '/api/supplier/finances' as const,
      responses: { 200: z.any() }
    },
    profile: {
      method: 'GET' as const,
      path: '/api/supplier/profile' as const,
      responses: { 200: z.any() }
    },
    updateProfile: {
      method: 'PUT' as const,
      path: '/api/supplier/profile' as const,
      input: z.any(),
      responses: { 200: z.any() }
    }
  },
  admin: {
    dashboard: {
      method: 'GET' as const,
      path: '/api/admin/dashboard' as const,
      responses: { 200: z.any() }
    },
    suppliers: {
      method: 'GET' as const,
      path: '/api/admin/suppliers' as const,
      responses: { 200: z.array(z.any()) }
    },
    approveSupplier: {
      method: 'POST' as const,
      path: '/api/admin/suppliers/:id/approve' as const,
      responses: { 200: z.any() }
    },
    rejectSupplier: {
      method: 'POST' as const,
      path: '/api/admin/suppliers/:id/reject' as const,
      input: z.object({ reason: z.string() }),
      responses: { 200: z.any() }
    },
    orders: {
      method: 'GET' as const,
      path: '/api/admin/orders' as const,
      responses: { 200: z.array(z.any()) }
    },
    products: {
      method: 'GET' as const,
      path: '/api/admin/products' as const,
      responses: { 200: z.array(z.any()) }
    },
    finances: {
      method: 'GET' as const,
      path: '/api/admin/finances' as const,
      responses: { 200: z.any() }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
