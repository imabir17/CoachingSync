import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CoachingSync',
    short_name: 'CoachingSync',
    description: 'Workspace for Study Abroad Consultancy Agency',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#1E1E1E',
    theme_color: '#007ACC',
    icons: [
      {
        src: '/logo.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/logo.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  }
}
