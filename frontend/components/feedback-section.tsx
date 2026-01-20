import Image from "next/image"
import { Star, Heart } from "lucide-react"

const feedbacks = [
  {
    image: "/image/nasigoreng.png",
    title: "Nasi Goreng Spesial",
    description: "Rasanya enak banget! Porsinya pas dan harganya terjangkau. Pasti order lagi!",
    rating: 5,
    author: "Dewi S.",
  },
  {
    image: "/ayam-geprek-crispy-indonesian-food.jpg",
    title: "Ayam Geprek Level 5",
    description: "Pedasnya mantap! Sambalnya fresh dan ayamnya crispy. Recommended!",
    rating: 5,
    author: "Budi K.",
  },
  {
    image: "/mie-ayam-bakso-indonesian-food.jpg",
    title: "Mie Ayam Bakso",
    description: "Mie ayamnya lembut, baksonya besar-besar. Kuahnya juga gurih. Top!",
    rating: 4,
    author: "Siti R.",
  },
]

export default function FeedbackSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-purple-600 font-medium mb-2">Apa Kata Mereka</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance">Ulasan Pelanggan</h2>
          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-4">
            <div className="h-2 w-2 rounded-full bg-purple-600" />
            <div className="h-2 w-2 rounded-full bg-purple-200" />
            <div className="h-2 w-2 rounded-full bg-purple-200" />
          </div>
        </div>

        {/* Feedback Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {feedbacks.map((feedback, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl overflow-hidden border border-purple-100 hover:shadow-lg hover:border-purple-300 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={feedback.image || "/placeholder.svg"}
                  alt={feedback.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors"
                  aria-label="Tambah ke favorit"
                >
                  <Heart className="h-4 w-4 text-purple-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{feedback.title}</h3>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{feedback.description}</p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-600">{feedback.author}</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < feedback.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
