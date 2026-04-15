import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { collection, onSnapshot, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from "date-fns";
import { Sale } from "@/types";

export function OverviewChart() {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const start = startOfWeek(new Date());
    const end = endOfWeek(new Date());
    const days = eachDayOfInterval({ start, end });

    const q = query(
      collection(db, "sales"),
      where("timestamp", ">=", Timestamp.fromDate(start)),
      where("timestamp", "<=", Timestamp.fromDate(end))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sales = snapshot.docs.map(doc => doc.data() as Sale);
      
      const data = days.map(day => {
        const daySales = sales.filter(s => isSameDay(s.timestamp.toDate(), day));
        const total = daySales.reduce((acc, s) => acc + s.totalAmount, 0);
        return {
          name: format(day, 'EEE'),
          total
        };
      });

      setChartData(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
