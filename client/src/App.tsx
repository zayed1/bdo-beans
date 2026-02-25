import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/i18n/i18nProvider";
import NotFound from "@/pages/not-found";

import { AppLayout } from "@/components/layout/AppLayout";
import { SupplierLayout } from "@/components/layout/SupplierLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

import { AuthGuard } from "@/components/guards/AuthGuard";
import { SupplierGuard } from "@/components/guards/SupplierGuard";
import { AdminGuard } from "@/components/guards/AdminGuard";

import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetails from "@/pages/ProductDetails";
import Checkout from "@/pages/Checkout";
import Auth from "@/pages/Auth";
import Orders from "@/pages/Orders";

import SupplierDashboard from "@/pages/supplier/Dashboard";
import SupplierProducts from "@/pages/supplier/Products";
import SupplierProductForm from "@/pages/supplier/ProductForm";
import SupplierOrders from "@/pages/supplier/Orders";
import SupplierFinances from "@/pages/supplier/Finances";
import SupplierProfile from "@/pages/supplier/Profile";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminSuppliers from "@/pages/admin/Suppliers";
import AdminOrders from "@/pages/admin/Orders";
import AdminProducts from "@/pages/admin/Products";
import AdminFinances from "@/pages/admin/Finances";

function SupplierPage({ component: Component }: { component: () => JSX.Element }) {
  return (
    <SupplierGuard>
      <SupplierLayout>
        <Component />
      </SupplierLayout>
    </SupplierGuard>
  );
}

function AdminPage({ component: Component }: { component: () => JSX.Element }) {
  return (
    <AdminGuard>
      <AdminLayout>
        <Component />
      </AdminLayout>
    </AdminGuard>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/supplier" component={() => <SupplierPage component={SupplierDashboard} />} />
      <Route path="/supplier/products" component={() => <SupplierPage component={SupplierProducts} />} />
      <Route path="/supplier/products/new" component={() => <SupplierPage component={SupplierProductForm} />} />
      <Route path="/supplier/orders" component={() => <SupplierPage component={SupplierOrders} />} />
      <Route path="/supplier/finances" component={() => <SupplierPage component={SupplierFinances} />} />
      <Route path="/supplier/profile" component={() => <SupplierPage component={SupplierProfile} />} />

      <Route path="/admin" component={() => <AdminPage component={AdminDashboard} />} />
      <Route path="/admin/suppliers" component={() => <AdminPage component={AdminSuppliers} />} />
      <Route path="/admin/orders" component={() => <AdminPage component={AdminOrders} />} />
      <Route path="/admin/products" component={() => <AdminPage component={AdminProducts} />} />
      <Route path="/admin/finances" component={() => <AdminPage component={AdminFinances} />} />

      <Route path="/">
        <AppLayout><Home /></AppLayout>
      </Route>
      <Route path="/products">
        <AppLayout><Products /></AppLayout>
      </Route>
      <Route path="/products/:id">
        {(params) => <AppLayout><ProductDetails /></AppLayout>}
      </Route>
      <Route path="/checkout">
        <AppLayout><AuthGuard><Checkout /></AuthGuard></AppLayout>
      </Route>
      <Route path="/auth">
        <AppLayout><Auth /></AppLayout>
      </Route>
      <Route path="/orders">
        <AppLayout><AuthGuard><Orders /></AuthGuard></AppLayout>
      </Route>
      <Route>
        <AppLayout><NotFound /></AppLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
}

export default App;
