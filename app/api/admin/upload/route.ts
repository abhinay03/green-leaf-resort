import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      )
    }

    const uploadedUrls: string[] = []
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `packages/${fileName}`
      
      const { data, error } = await supabase.storage
        .from('packages')
        .upload(filePath, file)
      
      if (error) {
        console.error('Error uploading file:', error)
        continue
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('packages')
        .getPublicUrl(filePath)
      
      if (publicUrl) {
        uploadedUrls.push(publicUrl)
      }
    }
    
    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: "Failed to upload files" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ urls: uploadedUrls })
    
  } catch (error) {
    console.error('Error in upload API route:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
