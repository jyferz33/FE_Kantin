import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function CtaSection() {
  return (
    <section className="py-16 lg:py-24 bg-purple-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <p className="text-purple-600 font-medium">Mulai Sekarang</p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900 text-balance">
              Siap untuk menikmati kemudahan pesan makanan?
            </h2>
            <p className="text-gray-500 leading-relaxed max-w-md">
              Bergabung dengan ribuan pengguna KantinKu yang sudah merasakan kemudahan memesan makanan favorit tanpa
              perlu antri. Daftar sekarang dan nikmati berbagai promo menarik!
            </p>
            <Button size="lg" className="rounded-full px-8 bg-purple-600 hover:bg-purple-700 text-white" asChild>
              <Link href="/daftar">Daftar Sekarang</Link>
            </Button>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden">
              <Image
                src="/image/3dKantin.png"
                alt="Berbagai makanan lezat"
                width={500}
                height={400}
                className="object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
