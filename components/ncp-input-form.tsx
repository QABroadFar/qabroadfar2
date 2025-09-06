"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Calendar, Upload, Clock } from "lucide-react"

const machineOptions = ["SC1", "DC1A", "MAX", "DC1B", "SC2", "DC2", "HLP1", "HLP2", "HLP3", "HLP4", "SC3", "DC2"]

const qaLeaderOptions = ["QA Leader 1", "QA Leader 2"]

export function NCPInputForm() {
  const [formData, setFormData] = useState({
    skuCode: "",
    machineCode: "",
    date: "",
    timeIncident: "",
    holdQuantity: "",
    holdQuantityUOM: "PCS", // Added UOM field
    problemDescription: "",
    photoAttachment: null as File | null,
    qaLeader: "",
  })

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState({} as any);

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleInputChange("photoAttachment", file)
  }

  const handleReset = () => {
    setFormData({
      skuCode: "",
      machineCode: "",
      date: "",
      timeIncident: "",
      holdQuantity: "",
      holdQuantityUOM: "PCS",
      problemDescription: "",
      photoAttachment: null,
      qaLeader: "",
    });
    setShowPreview(false);
    setPreviewData({});
  }

  const handlePreview = () => {
    setPreviewData(formData);
    setShowPreview(true);
  }

  const handleSubmit = async () => {
    try {
      // If we're in preview mode, submit the preview data
      const dataToSubmit = showPreview ? previewData : formData;
      
      const response = await fetch("/api/ncp/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("NCP submitted successfully:", result);
        // Reset form after successful submission
        handleReset();
        // Hide preview if it was shown
        setShowPreview(false);
        // Show success message to user
        alert("NCP submitted successfully!");
      } else {
        const errorData = await response.json();
        console.error("Error submitting NCP:", errorData);
        // Show error message to user
        alert("Error submitting NCP: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Network error:", error);
      // Show error message to user
      alert("Network error occurred while submitting NCP");
    }
  }

  const handleEdit = () => {
    setShowPreview(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {showPreview ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <span>NCP Report Preview</span>
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Review your NCP report details before submitting.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">SKU Code</Label>
                    <p className="mt-1 text-gray-900">{previewData.skuCode}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Machine Code</Label>
                    <p className="mt-1 text-gray-900">{previewData.machineCode}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Date</Label>
                    <p className="mt-1 text-gray-900">{previewData.date}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Time of Incident</Label>
                    <p className="mt-1 text-gray-900">{previewData.timeIncident}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Hold Quantity</Label>
                    <p className="mt-1 text-gray-900">{previewData.holdQuantity} {previewData.holdQuantityUOM}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">QA Leader</Label>
                    <p className="mt-1 text-gray-900">{previewData.qaLeader}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Problem Description</Label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{previewData.problemDescription}</p>
                </div>
                {previewData.photoAttachment && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Photo Attachment</Label>
                    <p className="mt-1 text-gray-900">{previewData.photoAttachment.name}</p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleEdit}
                    className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 bg-transparent"
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Submit NCP
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <span>New NCP Report</span>
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Fill in the details below to submit a new Non-Conformance Product report.
              </p>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* SKU Code */}
                <div className="space-y-2">
                  <Label htmlFor="skuCode" className="text-sm font-medium text-gray-700">
                    SKU Code
                  </Label>
                  <Input
                    id="skuCode"
                    type="text"
                    placeholder="Enter SKU code"
                    value={formData.skuCode}
                    onChange={(e) => handleInputChange("skuCode", e.target.value)}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Machine Code */}
                <div className="space-y-2">
                  <Label htmlFor="machineCode" className="text-sm font-medium text-gray-700">
                    Machine Code
                  </Label>
                  <Select
                    value={formData.machineCode}
                    onValueChange={(value) => handleInputChange("machineCode", value)}
                  >
                    <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select machine code" />
                    </SelectTrigger>
                    <SelectContent>
                      {machineOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                    Date
                  </Label>
                  <div className="relative">
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Time of Incident */}
                <div className="space-y-2">
                  <Label htmlFor="timeIncident" className="text-sm font-medium text-gray-700">
                    Time of Incident
                  </Label>
                  <div className="relative">
                    <Input
                      id="timeIncident"
                      type="time"
                      value={formData.timeIncident}
                      onChange={(e) => handleInputChange("timeIncident", e.target.value)}
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pl-10"
                    />
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Hold Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="holdQuantity" className="text-sm font-medium text-gray-700">
                    Hold Quantity
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="holdQuantity"
                      type="number"
                      placeholder="Enter quantity"
                      value={formData.holdQuantity}
                      onChange={(e) => handleInputChange("holdQuantity", e.target.value)}
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 flex-1"
                      min="0"
                    />
                    <select
                      value={formData.holdQuantityUOM}
                      onChange={(e) => handleInputChange("holdQuantityUOM", e.target.value)}
                      className="h-11 border border-gray-200 rounded-md px-3 focus:border-blue-500 focus:ring-blue-500 bg-white"
                    >
                      <option value="PCS">PCS</option>
                      <option value="KG">KG</option>
                      <option value="L">L</option>
                      <option value="M">M</option>
                    </select>
                  </div>
                </div>

                {/* QA Leader */}
                <div className="space-y-2">
                  <Label htmlFor="qaLeader" className="text-sm font-medium text-gray-700">
                    Select QA Leader
                  </Label>
                  <Select value={formData.qaLeader} onValueChange={(value) => handleInputChange("qaLeader", value)}>
                    <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select QA Leader" />
                    </SelectTrigger>
                    <SelectContent>
                      {qaLeaderOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Photo Attachment */}
                <div className="space-y-2">
                  <Label htmlFor="photoAttachment" className="text-sm font-medium text-gray-700">
                    Photo Attachment
                  </Label>
                  <div className="relative">
                    <Input
                      id="photoAttachment"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {formData.photoAttachment && (
                    <p className="text-sm text-green-600">Selected: {formData.photoAttachment.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Problem Description - Full Width */}
            <div className="space-y-2">
              <Label htmlFor="problemDescription" className="text-sm font-medium text-gray-700">
                Problem Description
              </Label>
              <Textarea
                id="problemDescription"
                placeholder="Describe the problem in detail..."
                value={formData.problemDescription}
                onChange={(e) => handleInputChange("problemDescription", e.target.value)}
                className="min-h-32 border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                rows={6}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200/50">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="flex-1 h-12 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 bg-transparent"
              >
                Reset
              </Button>
              <Button
                type="button"
                onClick={handlePreview}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Preview
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white"
              >
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  )
}
