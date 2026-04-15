import { useEffect, useState } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  Timestamp,
  where,
  getDocs
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { Sale, Product } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2 
} from "lucide-react";
import { OverviewChart } from "./OverviewChart";
import { RecentSales } from "./RecentSales";

import { useLanguage } from '@/hooks/useLanguage';

export default function Dashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    revenue: 0,
    customers: 0,
    stock: 0,
    rentals: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);

  useEffect(() => {
    // Fetch stats
    const unsubSales = onSnapshot(collection(db, "sales"), (snapshot) => {
      const sales = snapshot.docs.map(doc => doc.data() as Sale);
      const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
      setRecentSales(sales.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()).slice(0, 5));
      setStats(prev => ({ ...prev, revenue: totalRevenue }));
    });

    const unsubCustomers = onSnapshot(collection(db, "customers"), (snapshot) => {
      setStats(prev => ({ ...prev, customers: snapshot.size }));
    });

    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const totalStock = snapshot.docs.reduce((acc, doc) => acc + (doc.data().stockQuantity || 0), 0);
      setStats(prev => ({ ...prev, stock: totalStock }));
      setLoading(false);
    });

    const unsubRentals = onSnapshot(query(collection(db, "rentals"), where("returned", "==", false)), (snapshot) => {
      setStats(prev => ({ ...prev, rentals: snapshot.size }));
    });

    return () => {
      unsubSales();
      unsubCustomers();
      unsubProducts();
      unsubRentals();
    };
  }, []);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title={t('totalRevenue')} 
          value={`$${stats.revenue.toLocaleString()}`} 
          icon={TrendingUp}
          trend="+12.5%"
          trendType="up"
        />
        <StatCard 
          title={t('activeCustomers')} 
          value={stats.customers.toString()} 
          icon={Users}
          trend="+3"
          trendType="up"
        />
        <StatCard 
          title={t('gasStock')} 
          value={stats.stock.toString()} 
          icon={Package}
          trend="-5%"
          trendType="down"
        />
        <StatCard 
          title={t('activeRentals')} 
          value={stats.rentals.toString()} 
          icon={LayoutDashboard}
          trend="+2"
          trendType="up"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>{t('overview')}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t('recentSales')}</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentSales sales={recentSales} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendType }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs mt-1">
          {trendType === 'up' ? (
            <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-destructive mr-1" />
          )}
          <span className={trendType === 'up' ? 'text-emerald-500' : 'text-destructive'}>
            {trend}
          </span>
          <span className="text-muted-foreground ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}
