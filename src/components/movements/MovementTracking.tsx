import { useEffect, useState } from "react";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy,
  Timestamp,
  where
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { CylinderMovement } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { History, ArrowUpRight, ArrowDownRight, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfDay } from "date-fns";

export function MovementTracking() {
  const [movements, setMovements] = useState<CylinderMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "movements"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMovements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CylinderMovement[]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "movements");
    });
    return () => unsubscribe();
  }, []);

  const handleAddMovement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      productId: formData.get("productId") as string,
      productName: formData.get("productName") as string,
      type: formData.get("type") as "sent_out" | "returned",
      quantity: parseInt(formData.get("quantity") as string),
      timestamp: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, "movements"), data);
      toast.success("Movement logged");
      setIsDialogOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "movements");
    }
  };

  const today = startOfDay(new Date());
  const todayMovements = movements.filter(m => m.timestamp.toDate() >= today);
  
  const stats = {
    sentOut: todayMovements.filter(m => m.type === "sent_out").reduce((acc, m) => acc + m.quantity, 0),
    returned: todayMovements.filter(m => m.type === "returned").reduce((acc, m) => acc + m.quantity, 0),
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Out (Today)</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sentOut}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returned (Today)</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.returned}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Movement History</h2>
          <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Log Movement
          </Button>
        </div>
        <div className="border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No movements logged yet.
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(movement.timestamp.toDate(), 'MMM dd, HH:mm')}
                    </TableCell>
                    <TableCell className="font-medium">{movement.productName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {movement.type === "sent_out" ? (
                          <ArrowUpRight className="w-4 h-4 text-destructive" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                        )}
                        <span className="capitalize">{movement.type.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>{movement.quantity}</TableCell>
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
            <DialogTitle>Log Cylinder Movement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMovement} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input id="productName" name="productName" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Movement Type</Label>
                <Select name="type" defaultValue="sent_out">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sent_out">Sent Out</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" name="quantity" type="number" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Log Movement</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
