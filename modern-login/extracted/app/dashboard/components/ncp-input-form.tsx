"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Calendar,
  Upload,
  Clock,
  ArrowLeft,
  Eye,
  FileText,
  User,
  Hash,
  Settings,
  Timer,
  Package,
  CheckCircle,
  Copy,
  ImageIcon,
} from "lucide-react"

const machineOptions = ["SC1", "DC1A", "MAX", "DC1B", "SC2", "DC2", "HLP1", "HLP2", "HLP3", "HLP4", "SC3", "DC2"]

const qaLeaderOptions = ["QA Leader 1", "QA Leader 2"]

const uomOptions = ["Tray", "Pack", "Carton", "Mastercase"]

interface NCPInputFormProps {
  onBack: () => void
}

export function NCPInputForm({ onBack }: NCPInputFormProps) {
  const [formData, setFormData] = useState({
    skuCode: "",
    machineCode: "",
    date: "",
    timeIncident: "",
    holdQuantity: "",
    holdQuantityUOM: "",
    problemDescription: "",
    photoAttachment: null as File | null,
    qaLeader: "",
  })

  const [showPreview, setShowPreview] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedNCPId, setSubmittedNCPId] = useState("")
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleInputChange("photoAttachment", file)

    // Create preview URL for image
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setPreviewImageUrl(url)
    } else {
      setPreviewImageUrl(null)
    }
  }

  const handleReset = () => {
    setFormData({
      skuCode: "",
      machineCode: "",
      date: "",
      timeIncident: "",
      holdQuantity: "",
      holdQuantityUOM: "",
      problemDescription: "",
      photoAttachment: null,
      qaLeader: "",
    })
    setPreviewImageUrl(null)

    // Reset file input
    const fileInput = document.getElementById("photoAttachment") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const handlePreview = () => {
    setShowPreview(true)
  }

  const handleSubmitFromPreview = async () => {
    setIsSubmitting(true)

    try {
      const submitFormData = new FormData()

      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          if (key === "photoAttachment" && value instanceof File) {
            submitFormData.append(key, value, value.name)
          } else {
            submitFormData.append(key, value as string)
          }
        }
      })

      const response = await fetch("/api/ncp/submit", {
        method: "POST",
        body: submitFormData,
      })

      const result = await response.json()

      if (result.success) {
        setSubmittedNCPId(result.ncpId)
        setShowPreview(false)
        setShowSuccess(true)
        handleReset()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error("Submit error:", error)
      alert("Failed to submit NCP report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyNCPId = () => {
    navigator.clipboard.writeText(submittedNCPId)
    alert("NCP ID copied to clipboard!")
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified"
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return "Not specified"
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="text-gray-600 hover:text-gray-900 p-0 h-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-2xl ring-1 ring-gray-200/50">
          <CardHeader className="pb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold text-center">NCP Input Form</CardTitle>
            <p className="text-center text-blue-100 mt-2">Non-Conformance Product Report</p>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6 bg-white/50 p-6 rounded-xl border border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Basic Information</h3>

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
              <div className="space-y-6 bg-white/50 p-6 rounded-xl border border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Details & Assignment
                </h3>

                {/* Hold Quantity with UOM */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Hold Quantity</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      id="holdQuantity"
                      type="number"
                      placeholder="Enter quantity"
                      value={formData.holdQuantity}
                      onChange={(e) => handleInputChange("holdQuantity", e.target.value)}
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      min="0"
                    />
                    <Select
                      value={formData.holdQuantityUOM}
                      onValueChange={(value) => handleInputChange("holdQuantityUOM", value)}
                    >
                      <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select UOM" />
                      </SelectTrigger>
                      <SelectContent>
                        {uomOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <div className="mt-2">
                      <p className="text-sm text-green-600 mb-2">Selected: {formData.photoAttachment.name}</p>
                      {previewImageUrl && (
                        <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={previewImageUrl || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Problem Description - Full Width */}
            <div className="space-y-2 bg-white/50 p-6 rounded-xl border border-gray-200/50">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Problem Description</h3>
              <Textarea
                id="problemDescription"
                placeholder="Describe the problem in detail..."
                value={formData.problemDescription}
                onChange={(e) => handleInputChange("problemDescription", e.target.value)}
                className="min-h-32 border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none bg-white/80"
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
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              NCP Report Preview
            </DialogTitle>
            <DialogDescription>
              Please review all information before submitting the Non-Conformance Product report.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Information Section */}
            <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-200/50">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Hash className="h-5 w-5 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">SKU Code</Label>
                  <p className="text-gray-800 font-medium">{formData.skuCode || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Machine Code</Label>
                  <p className="text-gray-800 font-medium">{formData.machineCode || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date</Label>
                  <p className="text-gray-800 font-medium">{formatDate(formData.date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Time of Incident</Label>
                  <p className="text-gray-800 font-medium">{formatTime(formData.timeIncident)}</p>
                </div>
              </div>
            </div>

            {/* Details & Assignment Section */}
            <div className="bg-green-50/50 p-6 rounded-lg border border-green-200/50">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-green-600" />
                Details & Assignment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Hold Quantity</Label>
                  <p className="text-gray-800 font-medium flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    {formData.holdQuantity || "0"} {formData.holdQuantityUOM || "units"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">QA Leader</Label>
                  <p className="text-gray-800 font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    {formData.qaLeader || "Not assigned"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-600">Photo Attachment</Label>
                  {formData.photoAttachment ? (
                    <div className="mt-2">
                      <p className="text-gray-800 font-medium mb-2 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-gray-500" />
                        {formData.photoAttachment.name}
                      </p>
                      {previewImageUrl && (
                        <div className="relative w-full max-w-md h-48 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={previewImageUrl || "/placeholder.svg"}
                            alt="Attachment Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-800 font-medium">No file attached</p>
                  )}
                </div>
              </div>
            </div>

            {/* Problem Description Section */}
            <div className="bg-orange-50/50 p-6 rounded-lg border border-orange-200/50">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                Problem Description
              </h3>
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {formData.problemDescription || "No description provided"}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowPreview(false)} disabled={isSubmitting}>
              Edit Form
            </Button>
            <Button
              onClick={handleSubmitFromPreview}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Timer className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog with NCP Number */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              NCP Submitted Successfully!
            </DialogTitle>
            <DialogDescription>
              Your Non-Conformance Product report has been submitted and assigned an ID.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <Label className="text-sm font-medium text-gray-600">NCP ID</Label>
              <div className="flex items-center gap-3 mt-2">
                <div className="bg-white px-4 py-3 rounded border border-green-300 flex-1">
                  <p className="text-2xl font-bold text-green-700 font-mono tracking-wider">{submittedNCPId}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyNCPId}
                  className="border-green-300 text-green-600 hover:bg-green-50 bg-transparent"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Please save this NCP ID for future reference.</p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowSuccess(false)} className="w-full bg-green-600 hover:bg-green-700 text-white">
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
