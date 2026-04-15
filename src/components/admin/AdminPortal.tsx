import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  BarChart3, 
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Lock
} from "lucide-react";
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Line, 
  LineChart,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useLanguage } from '@/hooks/useLanguage';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const revenueData = [
  { name: "Jan", revenue: 4500, sales: 120 },
  { name: "Feb", revenue: 5200, sales: 145 },
  { name: "Mar", revenue: 4800, sales: 132 },
  { name: "Apr", revenue: 6100, sales: 178 },
  { name: "May", revenue: 5900, sales: 165 },
  { name: "Jun", revenue: 7200, sales: 210 },
];

const productData = [
  { name: "6kg Domestic", value: 400 },
  { name: "12kg Domestic", value: 300 },
  { name: "15kg Industrial", value: 200 },
  { name: "20kg Industrial", value: 100 },
];

const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899'];

export function AdminPortal() {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'test') {
      setIsAuthenticated(true);
      toast.success("Admin access granted");
    } else {
      toast.error("Invalid admin password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Lock className="w-6 h-6 text-primary" />
              </div>
            </div>
            <CardTitle>{t('admin')}</CardTitle>
            <CardDescription>{t('accessAdmin')}</CardDescription>
          </CardHeader>
          <form onSubmit={handleAdminLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-password">{t('adminPassword')}</Label>
                <Input 
                  id="admin-password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">{t('submit')}</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('admin')}</h2>
        <p className="text-muted-foreground">{t('insights')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+24.5%</div>
            <p className="text-xs text-muted-foreground">+4.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Retention</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88%</div>
            <p className="text-xs text-muted-foreground">+2% from last quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$42,500</div>
            <p className="text-xs text-muted-foreground">Across 450 units</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Low stock items requiring action</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue vs Sales Performance</CardTitle>
            <CardDescription>Performance comparison over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Product Distribution</CardTitle>
            <CardDescription>Sales volume by cylinder type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {productData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {productData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-bold">{item.value} units</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Database Latency</span>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">24ms</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">API Uptime</span>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">99.9%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Backup Status</span>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">Success</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Administrative Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Price Updated", user: "Admin", time: "2 hours ago", target: "12kg Cylinder" },
                { action: "New Manager Added", user: "Admin", time: "5 hours ago", target: "Jean-Claude" },
                { action: "Stock Reconciled", user: "Admin", time: "Yesterday", target: "Warehouse A" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.user} • {item.target}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
