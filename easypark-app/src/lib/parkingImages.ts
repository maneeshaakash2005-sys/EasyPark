export interface ParkingImage {
  src: string;
  alt: string;
}

// Unsplash-hosted illustrative parking imagery. Photos are not representations of
// the named Sri Lankan facilities; the labels remain grounded in demo location data.
export const PARKING_IMAGES: Record<string, ParkingImage> = {
  loc1: { src: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1000&q=80', alt: 'Covered multi-level parking structure, illustrative image' },
  loc2: { src: 'https://images.unsplash.com/photo-1506521781263-d8422e82f94f?auto=format&fit=crop&w=1000&q=80', alt: 'Outdoor parking lot, illustrative image' },
  loc3: { src: 'https://images.unsplash.com/photo-1593280405106-e438ebe93f5b?auto=format&fit=crop&w=1000&q=80', alt: 'Parking bays and vehicle access, illustrative image' },
  loc4: { src: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=1000&q=80', alt: 'Modern commercial parking garage, illustrative image' },
  loc5: { src: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1000&q=80', alt: 'Parking facility entrance, illustrative image' },
  loc6: { src: 'https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1000&q=80', alt: 'City street and parked vehicles, illustrative image' },
  loc7: { src: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80', alt: 'Urban vehicle access, illustrative image' },
  loc8: { src: 'https://images.unsplash.com/photo-1604066867775-43f48e3957d8?auto=format&fit=crop&w=1000&q=80', alt: 'Outdoor vehicle parking, illustrative image' },
};

export const PARKING_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1506521781263-d8422e82f94f?auto=format&fit=crop&w=1000&q=80';
