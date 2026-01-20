import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-purple-100 bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-purple-500" />
            <span className="text-lg font-bold text-purple-600">KantinKu</span>
          </div>

          <p className="text-sm text-gray-500">© 2026 KantinKu. All rights reserved.</p>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
              Terms of Service
            </Link>
            <Link
              href="mailto:support@kantinku.id"
              className="text-sm text-gray-500 hover:text-purple-600 transition-colors"
            >
              support@kantinku.id
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
