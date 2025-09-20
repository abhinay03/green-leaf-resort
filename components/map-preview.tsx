"use client"

export default function MapPreview() {
  return (
    <a 
      href="https://www.google.com/maps/place/THE+GREEN+LEAF+RESORTS/@18.3460793,73.5377973,15z/data=!4m6!3m5!1s0x3bc2990071b12e87:0x13dee3ec9ee56f6b!8m2!3d18.3460793!4d73.5377973!16s%2Fg%2F11q2q9q9q9?entry=ttu"
      target="_blank"
      rel="noopener noreferrer"
      className="block relative group"
    >
      <div className="w-full aspect-video relative overflow-hidden">
        <img 
          src="/map-preview.jpg" 
          alt="Map showing the location of The Green Leaf Resorts"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://maps.googleapis.com/maps/api/staticmap?center=18.3460793,73.5377973&zoom=15&size=800x400&markers=color:red%7C18.3460793,73.5377973&key=YOUR_GOOGLE_MAPS_API_KEY';
          }}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 text-emerald-700 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>View on Google Maps</span>
          </div>
        </div>
      </div>
    </a>
  )
}
