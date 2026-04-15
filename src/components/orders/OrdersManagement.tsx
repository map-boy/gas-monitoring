import { useEffect, useState } from "react";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy,
  Timestamp,
  updateDoc,
  doc
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Package, DollarSign, Plus, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("orderDate", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "orders");
    });
    return () => unsubscribe();
  }, []);

  const handleAddOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      supplierName: formData.get("supplierName") as string,
      productId: formData.get("productId") as string,
      productName: formData.get("productName") as string,
      quantity: parseInt(formData.get("quantity") as string),
      totalCost: parseFloat(formData.get("totalCost") as string),
      status: "pending",
      orderDate: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, "orders"), data);
      toast.success("Order placed");
      setIsDialogOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "orders");
    }
  };

  const markAsReceived = async (id: string) => {
    try {
      await updateDoc(doc(db, "orders", id), { status: "received" });
      toast.success("Order marked as received");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "orders");
    }
  };

  const stats = {
    pending: orders.filter(o => o.status === "pending").length,
    totalSpent: orders.reduce((acc, o) => acc + o.totalCost, 0),
    completed: orders.filter(o => o.status === "received").length,
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Supplier Orders</h2>
          <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            New Order
          </Button>
        </div>
        <div className="border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.supplierName}</TableCell>
                    <TableCell>{order.productName}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>${order.totalCost.toFixed(2)}</TableCell>
                    <TableCell>{format(order.orderDate.toDate(), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "pending" ? "outline" : "secondary"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {order.status === "pending" && (
                        <Button variant="ghost" size="sm" onClick={() => markAsReceived(order.id)}>
                          Mark Received
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place New Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddOrder} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplierName">Supplier Name</Label>
              <Input id="supplierName" name="supplierName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input id="productName" name="productName" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" name="quantity" type="number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalCost">Total Cost ($)</Label>
                <Input id="totalCost" name="totalCost" type="number" step="0.01" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Place Order</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
