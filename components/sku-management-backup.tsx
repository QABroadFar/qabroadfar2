"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

// Mock data structure - will be replaced with actual API calls
interface SKUCode {
  id: number;
  code: string;
  description: string;
  created_at: string;
}

export function SKUManagement() {
  const [skus, setSkus] = useState<SKUCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSKU, setEditingSKU] = useState<SKUCode | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    description: ""
  });

  // Load SKUs on component mount
  useEffect(() => {
    loadSKUs();
  }, []);

  const loadSKUs = async () => {
    try {
      setLoading(true);
      // This would be replaced with actual API call
      // const response = await fetch(/api/system-settings/sku-codes);
      // const data = await response.json();
      // For now, mock data
      const mockData: SKUCode[] = [
        { id: 1, code: "SKU001", description: "Product A", created_at: "2023-01-01" },
        { id: 2, code: "SKU002", description: "Product B", created_at: "2023-01-02" },
        { id: 3, code: "SKU003", description: "Product C", created_at: "2023-01-03" }
      ];
      setSkus(mockData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load SKU codes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSKU) {
        // Update existing SKU
        // const response = await fetch(`/api/system-settings/sku-codes/${editingSKU.id}`, {
        //   method: PUT,
        //   headers: { Content-Type: application/json },
        //   body: JSON.stringify(formData)
        // });
        
        // Update local state
        setSkus(prev => prev.map(sku => 
          sku.id === editingSKU.id 
            ? { ...sku, ...formData } 
            : sku
        ));
        
        toast({
          title: "Success",
          description: "SKU code updated successfully"
        });
      } else {
        // Create new SKU
        // const response = await fetch(/api/system-settings/sku-codes, {
        //   method: POST,
        //   headers: { Content-Type: application/json },
        //   body: JSON.stringify(formData)
        // });
        
        // Add to local state (mock)
        const newSKU: SKUCode = {
          id: skus.length + 1,
          code: formData.code,
          description: formData.description,
          created_at: new Date().toISOString().split(T)[0]
        };
        
        setSkus(prev => [...prev, newSKU]);
        
        toast({
          title: "Success",
          description: "SKU code created successfully"
        });
      }
      
      // Reset form and close dialog
      setFormData({ code: "", description: "" });
      setOpenDialog(false);
      setEditingSKU(null);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingSKU ? update : create} SKU code`,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (sku: SKUCode) => {
    setEditingSKU(sku);
    setFormData({
      code: sku.code,
      description: sku.description
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    try {
      // const response = await fetch(`/api/system-settings/sku-codes/${id}`, {
      //   method: DELETE
      // });
      
      // Update local state
      setSkus(prev => prev.filter(sku => sku.id !== id));
      
      toast({
        title: "Success",
        description: "SKU code deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete SKU code",
        variant: "destructive"
      });
    }
  };

  const handleOpenDialog = () => {
    setEditingSKU(null);
    setFormData({ code: "", description: "" });
    setOpenDialog(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SKU Code Management</CardTitle>
          <CardDescription>
            Manage product SKU codes and their descriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">SKU Codes</h3>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenDialog}>Add New SKU</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingSKU ? Edit SKU Code : Add New SKU Code}</DialogTitle>
                  <DialogDescription>
                    {editingSKU 
                      ? Update the SKU code and description below. 
                      : Enter a new SKU code and description.}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="code" className="text-right">
                        SKU Code
                      </Label>
                      <Input
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Input
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingSKU ? Update : Create}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {loading ? (
            <div>Loading SKU codes...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skus.map((sku) => (
                  <TableRow key={sku.id}>
                    <TableCell className="font-medium">{sku.code}</TableCell>
                    <TableCell>{sku.description}</TableCell>
                    <TableCell>{sku.created_at}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(sku)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(sku.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
