import { Calendar, Package, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const InventoryDashboard = () => {
  const inventoryItems = [
    { id: 1, name: "Bananas", category: "Fruit", quantity: 6, expiryDate: "2024-01-15", status: "fresh", daysLeft: 3 },
    { id: 2, name: "Milk", category: "Dairy", quantity: 1, expiryDate: "2024-01-12", status: "expiring", daysLeft: 1 },
    { id: 3, name: "Chicken Breast", category: "Protein", quantity: 2, expiryDate: "2024-01-14", status: "fresh", daysLeft: 2 },
    { id: 4, name: "Spinach", category: "Vegetable", quantity: 1, expiryDate: "2024-01-11", status: "expired", daysLeft: -1 },
  ];

  const getStatusBadge = (status: string, daysLeft: number) => {
    if (status === "expired") {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (status === "expiring") {
      return <Badge variant="secondary" className="bg-warning text-warning-foreground">Expires Soon</Badge>;
    } else {
      return <Badge variant="default" className="bg-primary/10 text-primary">Fresh</Badge>;
    }
  };

  const stats = {
    total: inventoryItems.length,
    fresh: inventoryItems.filter(item => item.status === "fresh").length,
    expiring: inventoryItems.filter(item => item.status === "expiring").length,
    expired: inventoryItems.filter(item => item.status === "expired").length,
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Food Inventory</h2>
        <p className="text-muted-foreground">Track your food items, freshness, and expiry dates</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.fresh}</div>
            <div className="text-sm text-muted-foreground">Fresh</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{stats.expiring}</div>
            <div className="text-sm text-muted-foreground">Expiring Soon</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{stats.expired}</div>
            <div className="text-sm text-muted-foreground">Expired</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Inventory Items</span>
          </CardTitle>
          <CardDescription>Manage your food inventory and expiry dates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventoryItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h4 className="font-medium text-foreground">{item.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right text-sm">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{item.expiryDate}</span>
                    </div>
                    <div className="text-xs">
                      {item.daysLeft > 0 ? `${item.daysLeft} days left` : 
                       item.daysLeft === 0 ? 'Expires today' : 
                       `${Math.abs(item.daysLeft)} days expired`}
                    </div>
                  </div>
                  
                  {getStatusBadge(item.status, item.daysLeft)}
                  
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDashboard;