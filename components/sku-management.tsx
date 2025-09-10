"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

interface SKUCode {
  id: number;
  code: string;
  description: string;
  created_at: string;
}

export function SKUManagement() {
  const [skus, setSkus] = useState<SKUCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSKU, setEditingSKU] = useState<SKUCode | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    description: ""
  });

  useEffect(() => {
    fetchSKUCodes();
  }, []);

  const fetchSKUCodes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/system-settings/sku-codes");
      if (response.ok) {
        const data = await response.json();
        setSkus(data);
      } else {
        throw new Error("Failed to fetch SKU codes");
      }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        const response = await fetch("/api/system-settings/sku-codes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingSKU.id, ...formData })
        });
        
        if (response.ok) {
          toast({
            title: "Success",
            description: "SKU code updated successfully"
          });
          fetchSKUCodes();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update SKU code");
        }
      } else {
        // Create new SKU
        const response = await fetch("/api/system-settings/sku-codes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          toast({
            title: "Success",
            description: "SKU code created successfully"
          });
          fetchSKUCodes();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create SKU code");
        }
      }
      
      // Reset form and close dialog
      setFormData({ code: "", description: "" });
      setDialogOpen(false);
      setEditingSKU(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingSKU ? "update" : "create"} SKU code`,
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
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this SKU code?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/system-settings/sku-codes?id=${id}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "SKU code deleted successfully"
        });
        fetchSKUCodes();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete SKU code");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete SKU code",
        variant: "destructive"
      });
    }
  };

  const handleOpenDialog = () => {
    setEditingSKU(null);
    setFormData({ code: "", description: "" });
    setDialogOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>SKU Code Management</CardTitle>
        <CardDescription>
          Manage product SKU codes and their descriptions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">SKU Codes</h3>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>Add New SKU</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingSKU ? "Edit SKU Code" : "Add New SKU Code"}</DialogTitle>
                <DialogDescription>
                  {editingSKU 
                    ? "Update the SKU code and description below." 
                    : "Enter a new SKU code and description."}
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
                    <Textarea
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
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSKU ? "Update SKU" : "Create SKU"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {loading ? (
          <div className="text-center py-4">Loading SKU codes...</div>
        ) : skus.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No SKU codes found. Add your first SKU code using the button above.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">SKU Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[200px]">Created At</TableHead>
                  <TableHead className="text-right w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skus.map((sku) => (
                  <TableRow key={sku.id}>
                    <TableCell className="font-medium">{sku.code}</TableCell>
                    <TableCell>{sku.description}</TableCell>
                    <TableCell>{new Date(sku.created_at).toLocaleDateString()}</TableCell>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
