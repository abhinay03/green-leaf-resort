"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, DollarSign, Plus, Calendar } from "lucide-react"

export function FinancialManagement() {
  const [incomeRecords, setIncomeRecords] = useState([])
  const [expenseRecords, setExpenseRecords] = useState([])
  const [financialSummary, setFinancialSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
  })
  const [showIncomeDialog, setShowIncomeDialog] = useState(false)
  const [showExpenseDialog, setShowExpenseDialog] = useState(false)

  const [newIncome, setNewIncome] = useState({
    amount: "",
    source: "other",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })

  const [newExpense, setNewExpense] = useState({
    category: "maintenance",
    amount: "",
    description: "",
    vendor: "",
    date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchFinancialData()
  }, [])

  const fetchFinancialData = async () => {
    try {
      const [incomeRes, expenseRes, summaryRes] = await Promise.all([
        fetch("/api/admin/income"),
        fetch("/api/admin/expenses"),
        fetch("/api/admin/financial-summary"),
      ])

      const [incomeData, expenseData, summaryData] = await Promise.all([
        incomeRes.json(),
        expenseRes.json(),
        summaryRes.json(),
      ])

      setIncomeRecords(incomeData)
      setExpenseRecords(expenseData)
      setFinancialSummary(summaryData)
    } catch (error) {
      console.error("Failed to fetch financial data:", error)
    }
  }

  const addIncomeRecord = async () => {
    try {
      const response = await fetch("/api/admin/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIncome),
      })

      if (response.ok) {
        setShowIncomeDialog(false)
        setNewIncome({
          amount: "",
          source: "other",
          description: "",
          date: new Date().toISOString().split("T")[0],
        })
        fetchFinancialData()
      }
    } catch (error) {
      console.error("Failed to add income record:", error)
    }
  }

  const addExpenseRecord = async () => {
    try {
      const response = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpense),
      })

      if (response.ok) {
        setShowExpenseDialog(false)
        setNewExpense({
          category: "maintenance",
          amount: "",
          description: "",
          vendor: "",
          date: new Date().toISOString().split("T")[0],
        })
        fetchFinancialData()
      }
    } catch (error) {
      console.error("Failed to add expense record:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600">Track income, expenses, and profitability</p>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-3xl font-bold text-green-600">₹{financialSummary.totalIncome.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600">₹{financialSummary.totalExpenses.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p
                  className={`text-3xl font-bold ${financialSummary.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ₹{financialSummary.netProfit.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                <p className="text-3xl font-bold text-emerald-600">
                  ₹{financialSummary.monthlyIncome.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income and Expense Management */}
      <Tabs defaultValue="income" className="space-y-6">
        <TabsList>
          <TabsTrigger value="income">Income Records</TabsTrigger>
          <TabsTrigger value="expenses">Expense Records</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Income Records</h2>
            <Dialog open={showIncomeDialog} onOpenChange={setShowIncomeDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Income
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Income Record</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newIncome.amount}
                      onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <Label>Source</Label>
                    <Select
                      value={newIncome.source}
                      onValueChange={(value) => setNewIncome({ ...newIncome, source: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="booking">Booking Revenue</SelectItem>
                        <SelectItem value="extras">Extra Services</SelectItem>
                        <SelectItem value="other">Other Income</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newIncome.description}
                      onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                      placeholder="Description of income"
                    />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newIncome.date}
                      onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowIncomeDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addIncomeRecord} className="bg-green-600 hover:bg-green-700">
                    Add Income
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeRecords.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell className="capitalize">{record.source}</TableCell>
                      <TableCell>{record.description}</TableCell>
                      <TableCell className="font-medium text-green-600">₹{record.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Expense Records</h2>
            <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Expense Record</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newExpense.category}
                      onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="supplies">Supplies</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <Label>Vendor</Label>
                    <Input
                      value={newExpense.vendor}
                      onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                      placeholder="Vendor name"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      placeholder="Description of expense"
                    />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowExpenseDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addExpenseRecord} className="bg-red-600 hover:bg-red-700">
                    Add Expense
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseRecords.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell className="capitalize">{record.category}</TableCell>
                      <TableCell>{record.vendor}</TableCell>
                      <TableCell>{record.description}</TableCell>
                      <TableCell className="font-medium text-red-600">₹{record.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
