import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-8">
            <CardTitle className="text-3xl font-bold text-center text-gray-800">User Login</CardTitle>
            <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username Anda"
                className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password Anda"
                className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base transition-colors shadow-lg hover:shadow-xl"
            >
              Login
            </Button>
            <div className="text-center">
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                Lupa password?
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
