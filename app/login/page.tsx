
import { redirect } from "next/navigation"

export default function LoginPage() {
  // Redirect to the main page which handles authentication
  redirect("/")
}
