import { HeroSection } from "@/components/hero-section"
import { AboutSection } from "@/components/about-section"
import { AccommodationsSection } from "@/components/accommodations-section"
import { AmenitiesSection } from "@/components/amenities-section"
import { TeamSection } from "@/components/team-section"
import { ContactSection } from "@/components/contact-section"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <AccommodationsSection />
      <AmenitiesSection />
      {/* <TeamSection /> */}
      <ContactSection />
      <Footer />
    </main>
  )
}
