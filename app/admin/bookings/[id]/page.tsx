import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ArrowLeft, Calendar, Clock, Mail, Phone, User } from "lucide-react"
import Link from "next/link"

export default async function BookingDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  
  // Fetch booking details
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      *,
      accommodations (name, type, price_per_night),
      packages (name, price)
    `)
    .eq("id", params.id)
    .single()

  if (error || !booking) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/bookings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Booking Not Found</h1>
        </div>
        <p className="text-muted-foreground">The requested booking could not be found.</p>
      </div>
    )
  }

  // Format dates
  const checkInDate = new Date(booking.check_in_date)
  const checkOutDate = new Date(booking.check_out_date)
  const formattedCheckIn = format(checkInDate, "PPP")
  const formattedCheckOut = format(checkOutDate, "PPP")
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/bookings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Booking Details</h1>
        <Badge className={`ml-2 ${
          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {booking.status}
        </Badge>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Guest Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Guest Name</p>
                  <p className="font-medium">{booking.guest_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{booking.guest_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{booking.guest_phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Check-in / Check-out</p>
                  <p className="font-medium">
                    {formattedCheckIn} - {formattedCheckOut}
                  </p>
                  <p className="text-sm text-muted-foreground">{nights} nights</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Guests</p>
                  <p className="font-medium">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Booking Date</p>
                  <p className="font-medium">
                    {format(new Date(booking.created_at), "PPP")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {booking.accommodations && (
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{booking.accommodations.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.accommodations.type} • {nights} {nights === 1 ? 'night' : 'nights'}
                    </p>
                  </div>
                  <p className="font-medium">
                    ₹{booking.accommodations.price_per_night * nights}
                  </p>
                </div>
              )}
              
              {booking.packages && (
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{booking.packages.name} Package</p>
                    <p className="text-sm text-muted-foreground">
                      All-inclusive package
                    </p>
                  </div>
                  <p className="font-medium">
                    ₹{booking.packages.price}
                  </p>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-medium">
                  <p>Total</p>
                  <p>₹{booking.total_amount}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/bookings">Back to Bookings</Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/bookings/${params.id}/edit`}>Edit Booking</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
