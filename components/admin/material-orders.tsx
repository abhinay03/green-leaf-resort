"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Truck, CheckCircle, Clock, X } from "lucide-react"

export function MaterialOrders() {
  const [orders, setOrders] = useState([])
  const [showNewOrder, setShowNewOrder] = useState(false)
  const [orderItems, setOrderItems] = useState([{ item_name: "", description: "", quantity: 1, unit_price: 0 }])

  const [newOrder, setNewOrder] = useState({
    supplier: "",
    order_date: new Date().toISOString().split("T")[0],
    expected_delivery: "",
    notes: "",
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/material-orders")
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    }
  }

  const addOrderItem = () => {
    setOrderItems([...orderItems, { item_name: "", description: "", quantity: 1, unit_price: 0 }])
  }

  const updateOrderItem = (index: number, field: string, value: any) => {
    const updated = [...orderItems]
    updated[index] = { ...updated[index], [field]: value }
    setOrderItems(updated)
  }

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.quantity * item.unit_price, 0)
  }

  const createOrder = async () => {
    try {
      const orderNumber = `ORD${Date.now().toString().slice(-6)}`
      const totalAmount = calculateTotal()

      const response = await fetch("/api/admin/material-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newOrder,
          order_number: orderNumber,
          total_amount: totalAmount,
          items: orderItems,
        }),
      })

      if (response.ok) {
        setShowNewOrder(false)
        setNewOrder({
          supplier: "",
          order_date: new Date().toISOString().split("T")[0],
          expected_delivery: "",
          notes: "",
        })
        setOrderItems([{ item_name: "", description: "", quantity: 1, unit_price: 0 }])
        fetchOrders()
      }
    } catch (error) {
      console.error("Failed to create order:", error)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/material-orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchOrders()
      }
    } catch (error) {
      console.error("Failed to update order status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "ordered":
        return "bg-blue-100 text-blue-800"
      case "received":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "ordered":
        return <Truck className="h-4 w-4" />
      case "received":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <X className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Material Orders</h1>
          <p className="text-gray-600">Manage supply orders and inventory</p>
        </div>
        <Dialog open={showNewOrder} onOpenChange={setShowNewOrder}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Material Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier</Label>
                  <Input
                    value={newOrder.supplier}
                    onChange={(e) => setNewOrder({ ...newOrder, supplier: e.target.value })}
                    placeholder="Supplier name"
                  />
                </div>
                <div>
                  <Label>Order Date</Label>
                  <Input
                    type="date"
                    value={newOrder.order_date}
                    onChange={(e) => setNewOrder({ ...newOrder, order_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Expected Delivery</Label>
                  <Input
                    type="date"
                    value={newOrder.expected_delivery}
                    onChange={(e) => setNewOrder({ ...newOrder, expected_delivery: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                    placeholder="Order notes"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Order Items</h3>
                  <Button onClick={addOrderItem} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-5 gap-4 items-end">
                          <div>
                            <Label>Item Name</Label>
                            <Input
                              value={item.item_name}
                              onChange={(e) => updateOrderItem(index, "item_name", e.target.value)}
                              placeholder="Item name"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateOrderItem(index, "description", e.target.value)}
                              placeholder="Description"
                            />
                          </div>
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateOrderItem(index, "quantity", Number.parseInt(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label>Unit Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => updateOrderItem(index, "unit_price", Number.parseFloat(e.target.value))}
                            />
                          </div>
                          <div>
                            <Button
                              onClick={() => removeOrderItem(index)}
                              variant="outline"
                              size="icon"
                              disabled={orderItems.length === 1}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 text-right">
                          <span className="font-medium">Total: ₹{(item.quantity * item.unit_price).toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-right">
                    <span className="text-lg font-bold">Order Total: ₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewOrder(false)}>
                Cancel
              </Button>
              <Button onClick={createOrder} className="bg-emerald-600 hover:bg-emerald-700">
                Create Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Material Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString() : "TBD"}
                  </TableCell>
                  <TableCell className="font-medium">₹{order.total_amount}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="ordered">Ordered</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
