import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sale } from "@/types";
import { format } from "date-fns";

interface RecentSalesProps {
  sales: Sale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
  return (
    <div className="space-y-8">
      {sales.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No recent sales</p>
      ) : (
        sales.map((sale, i) => (
          <div key={i} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`https://avatar.iran.liara.run/username?username=${sale.customerName}`} alt="Avatar" />
              <AvatarFallback>{sale.customerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{sale.customerName}</p>
              <p className="text-xs text-muted-foreground">
                {sale.productName} • {format(sale.timestamp.toDate(), 'HH:mm')}
              </p>
            </div>
            <div className="ml-auto font-medium text-emerald-500">
              +${sale.totalAmount.toFixed(2)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
