import { useEffect, useState } from "react";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy,
  Timestamp,
  updateDoc,
  doc,
  where
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { Rental } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, MapPin, Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, isAfter } from "date-fns";

export function RentalSystem() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "rentals"), orderBy("dueDate", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRentals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Rental[]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "rentals");
    });
    return () => unsubscribe();
  }, []);

  const handleAddRental = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dueDate = new Date(formData.get("dueDate") as string);
    
    const data = {
      customerName: formData.get("customerName") as string,
      area: formData.get("area") as string,
      dueDate: Timestamp.fromDate(dueDate),
      returned: false,
      productName: formData.get("productName") as string,
    };

    try {
      await addDoc(collection(db, "rentals"), data);
      toast.success("Rental recorded");
      setIsDialogOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "rentals");
    }
  };

  const markAsReturned = async (id: string) => {
    try {
      await updateDoc(doc(db, "rentals", id), { returned: true });
      toast.success("Cylinder marked as returned");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "rentals");
    }
  };

  const activeRentals = rentals.filter(r => !r.returned);
  const overdueCount = activeRentals.filter(r => isAfter(new Date(), r.dueDate.toDate())).length;

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRentals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Rental Tracking</h2>
          <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            New Rental
          </Button>
        </div>
        <div className="border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No rentals found.
                  </TableCell>
                </TableRow>
              ) : (
                rentals.map((rental) => {
                  const isOverdue = !rental.returned && isAfter(new Date(), rental.dueDate.toDate());
                  return (
                    <TableRow key={rental.id}>
                      <TableCell className="font-medium">{rental.customerName}</TableCell>
                      <TableCell>{rental.productName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          {rental.area}
                        </div>
                      </TableCell>
                      <TableCell className={isOverdue ? "text-destructive font-medium" : ""}>
                        {format(rental.dueDate.toDate(), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {rental.returned ? (
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">Returned</Badge>
                        ) : isOverdue ? (
                          <Badge variant="destructive">Overdue</Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!rental.returned && (
                          <Button variant="ghost" size="sm" onClick={() => markAsReturned(rental.id)}>
                            Mark Returned
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record New Rental</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddRental} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input id="customerName" name="customerName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productName">Product (Cylinder Type)</Label>
              <Input id="productName" name="productName" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">Area/Location</Label>
                <Input id="area" name="area" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" name="dueDate" type="date" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Record Rental</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
