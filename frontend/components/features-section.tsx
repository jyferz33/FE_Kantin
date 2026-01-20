import { Utensils, Clock, CreditCard, ShoppingBag, Users, Star, Truck, Shield } from "lucide-react"

const features = [
  {
    icon: Utensils,
    title: "Menu Lengkap",
    description: "Beragam pilihan makanan dan minuman dari berbagai penjual kantin favorit Anda.",
  },
  {
    icon: Clock,
    title: "Pesan Cepat",
    description: "Pesan makanan dengan mudah dan cepat tanpa perlu antri panjang.",
  },
  {
    icon: CreditCard,
    title: "Pembayaran Mudah",
    description: "Berbagai metode pembayaran tersedia, dari e-wallet hingga transfer bank.",
  },
  {
    icon: ShoppingBag,
    title: "Ambil Langsung",
    description: "Pesanan siap diambil tepat waktu, tanpa menunggu lama.",
  },
  {
    icon: Users,
    title: "Menu Baru",
    description: "Temukan menu-menu baru dari penjual kantin setiap minggunya.",
  },
  {
    icon: Star,
    title: "Rating & Review",
    description: "Lihat rating dan ulasan dari pembeli lain untuk memilih menu terbaik.",
  },
  {
    icon: Truck,
    title: "Antar Langsung",
    description: "Tersedia layanan antar ke meja atau ruangan untuk kenyamanan Anda.",
  },
  {
    icon: Shield,
    title: "Transaksi Aman",
    description: "Keamanan transaksi terjamin dengan sistem pembayaran terpercaya.",
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-16 lg:py-24 bg-purple-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-purple-600 font-medium mb-2">Fitur Unggulan</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance">Kenapa Pilih KantinKu?</h2>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-purple-100 hover:border-purple-300"
            >
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <feature.icon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
