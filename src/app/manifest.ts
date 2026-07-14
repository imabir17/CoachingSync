import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CoachingSync',
    short_name: 'CoachingSync',
    description: 'Workspace for Study Abroad Consultancy Agency',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#1B1E23',
    theme_color: '#4855E4',
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
