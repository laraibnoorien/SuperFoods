import { Calendar, Package, Trash2 } from "lucide-react";
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
      return <Badge className="bg-red-500/20 text-red-400">Expired</Badge>;
    } else if (status === "expiring") {
      return <Badge className="bg-amber-500/20 text-amber-400">Expires Soon</Badge>;
    } else {
      return <Badge className="bg-emerald-500/20 text-emerald-400">Fresh</Badge>;
    }
  };

  const stats = {
    total: inventoryItems.length,
    fresh: inventoryItems.filter(item => item.status === "fresh").length,
    expiring: inventoryItems.filter(item => item.status === "expiring").length,
    expired: inventoryItems.filter(item => item.status === "expired").length,
  };

  return (
    <div className="space-y-8 bg-black min-h-screen text-gray-200 font-sans p-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-emerald-400">
          Food Inventory
        </h2>
        <p className="text-gray-400">Track freshness and expiry dates with AI</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="bg-neutral-900 border border-neutral-800">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-emerald-400">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Items</div>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border border-neutral-800">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-emerald-400">{stats.fresh}</div>
            <div className="text-sm text-gray-400">Fresh</div>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border border-neutral-800">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-amber-400">{stats.expiring}</div>
            <div className="text-sm text-gray-400">Expiring Soon</div>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border border-neutral-800">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-red-400">{stats.expired}</div>
            <div className="text-sm text-gray-400">Expired</div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory List */}
      <Card className="bg-neutral-900 border border-neutral-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Package className="w-5 h-5 text-emerald-400" />
            <span>Inventory Items</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage your food and avoid waste
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventoryItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-neutral-950 border border-neutral-800 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-white">{item.name}</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>Qty: {item.quantity}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm">
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <span>{item.expiryDate}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.daysLeft > 0
                        ? `${item.daysLeft} days left`
                        : item.daysLeft === 0
                        ? "Expires today"
                        : `${Math.abs(item.daysLeft)} days expired`}
                    </div>
                  </div>

                  {getStatusBadge(item.status, item.daysLeft)}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:bg-red-500/20"
                  >
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
