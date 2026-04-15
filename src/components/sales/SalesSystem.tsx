import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  increment, 
  Timestamp,
  query,
  orderBy
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType, auth } from "@/lib/firebase";
import { Product, Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ShoppingCart, Plus, Trash2, Loader2 } from "lucide-react";

export function SalesSystem() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>("cash");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
    });
    const unsubCustomers = onSnapshot(collection(db, "customers"), (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Customer[]);
      setLoading(false);
    });
    return () => { unsubProducts(); unsubCustomers(); };
  }, []);

  const addToCart = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    if (product.stockQuantity < quantity) {
      toast.error("Insufficient stock");
      return;
    }

    setCart([...cart, { 
      id: Date.now(), 
      productId: product.id, 
      productName: product.name, 
      quantity, 
      price: product.price 
    }]);
    setSelectedProductId("");
    setQuantity(1);
    toast.success("Added to cart");
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCompleteSale = async () => {
    if (!selectedCustomerId || cart.length === 0) return;
    setProcessing(true);
    const customer = customers.find(c => c.id === selectedCustomerId);

    try {
      for (const item of cart) {
        // Record sale
        await addDoc(collection(db, "sales"), {
          customerId: selectedCustomerId,
          customerName: customer?.name || "Unknown",
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          totalAmount: item.price * item.quantity,
          paymentMethod,
          timestamp: Timestamp.now(),
          workerId: auth.currentUser?.uid
        });

        // Update stock
        await updateDoc(doc(db, "products", item.productId), {
          stockQuantity: increment(-item.quantity)
        });
      }

      toast.success("Sale completed successfully!");
      setCart([]);
      setSelectedCustomerId("");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "sales");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            New Sale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Product</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select gas type" />
              </SelectTrigger>
              <SelectContent>
                {products.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name} (${p.price})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(parseInt(e.target.value))} 
                min={1} 
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full" onClick={addToCart} disabled={!selectedProductId}>Add to Cart</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Current Cart
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Cart is empty
                    </TableCell>
                  </TableRow>
                ) : (
                  cart.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-lg font-bold">Total:</span>
            <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
          </div>
          
          <Button 
            className="w-full h-12 text-lg" 
            disabled={cart.length === 0 || !selectedCustomerId || processing}
            onClick={handleCompleteSale}
          >
            {processing ? <Loader2 className="animate-spin mr-2" /> : null}
            Complete Sale
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
