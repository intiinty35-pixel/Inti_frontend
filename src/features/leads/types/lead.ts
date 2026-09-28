<<<<<<< HEAD
export type LeadSource = "web" | "search" | "property" | "project" | "favorites";
=======
export type LeadSource = "PROPERTY_FORM" | "WHATSAPP" | "QUICK_QUESTION" | "PHONE";
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source: LeadSource;
<<<<<<< HEAD
  listingId?: string;
=======
  propertyId: string;
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
  createdAt: string;
}

export interface LeadInput {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source: LeadSource;
<<<<<<< HEAD
  listingId?: string;
  utm?: Record<string, string | undefined>;
}
=======
  propertyId: string;
  utm?: Record<string, string | undefined>;
}
>>>>>>> 9329d94156582eafd16ce5945e63ae0b09f6e33a
