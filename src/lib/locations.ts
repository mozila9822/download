export type LocationNode = {
  code: string;
  name: string;
  city?: string;
  country: string;
  type: 'airport' | 'city';
};

export const locations: LocationNode[] = [
  // Airports
  { code: 'LHR', name: 'Heathrow', city: 'London', country: 'United Kingdom', type: 'airport' },
  { code: 'LGW', name: 'Gatwick', city: 'London', country: 'United Kingdom', type: 'airport' },
  { code: 'LTN', name: 'Luton', city: 'London', country: 'United Kingdom', type: 'airport' },
  { code: 'STN', name: 'Stansted', city: 'London', country: 'United Kingdom', type: 'airport' },
  { code: 'DUB', name: 'Dublin', city: 'Dublin', country: 'Ireland', type: 'airport' },
  { code: 'JFK', name: 'John F. Kennedy', city: 'New York', country: 'United States', type: 'airport' },
  { code: 'LGA', name: 'LaGuardia', city: 'New York', country: 'United States', type: 'airport' },
  { code: 'EWR', name: 'Newark Liberty', city: 'New York', country: 'United States', type: 'airport' },
  { code: 'SFO', name: 'San Francisco', city: 'San Francisco', country: 'United States', type: 'airport' },
  { code: 'LAX', name: 'Los Angeles', city: 'Los Angeles', country: 'United States', type: 'airport' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', type: 'airport' },
  { code: 'ORY', name: 'Orly', city: 'Paris', country: 'France', type: 'airport' },
  { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany', type: 'airport' },
  { code: 'AMS', name: 'Schiphol', city: 'Amsterdam', country: 'Netherlands', type: 'airport' },
  { code: 'MAD', name: 'Barajas', city: 'Madrid', country: 'Spain', type: 'airport' },
  { code: 'BCN', name: 'El Prat', city: 'Barcelona', country: 'Spain', type: 'airport' },
  { code: 'FCO', name: 'Fiumicino', city: 'Rome', country: 'Italy', type: 'airport' },
  { code: 'NRT', name: 'Narita', city: 'Tokyo', country: 'Japan', type: 'airport' },
  { code: 'HND', name: 'Haneda', city: 'Tokyo', country: 'Japan', type: 'airport' },
  { code: 'DXB', name: 'Dubai', city: 'Dubai', country: 'United Arab Emirates', type: 'airport' },
  { code: 'SYD', name: 'Sydney', city: 'Sydney', country: 'Australia', type: 'airport' },

  // Cities
  { code: 'LON', name: 'London', city: 'London', country: 'United Kingdom', type: 'city' },
  { code: 'DUB', name: 'Dublin', city: 'Dublin', country: 'Ireland', type: 'city' },
  { code: 'NYC', name: 'New York', city: 'New York', country: 'United States', type: 'city' },
  { code: 'SFO', name: 'San Francisco', city: 'San Francisco', country: 'United States', type: 'city' },
  { code: 'LAX', name: 'Los Angeles', city: 'Los Angeles', country: 'United States', type: 'city' },
  { code: 'PAR', name: 'Paris', city: 'Paris', country: 'France', type: 'city' },
  { code: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany', type: 'city' },
  { code: 'AMS', name: 'Amsterdam', city: 'Amsterdam', country: 'Netherlands', type: 'city' },
  { code: 'MAD', name: 'Madrid', city: 'Madrid', country: 'Spain', type: 'city' },
  { code: 'BCN', name: 'Barcelona', city: 'Barcelona', country: 'Spain', type: 'city' },
  { code: 'ROM', name: 'Rome', city: 'Rome', country: 'Italy', type: 'city' },
  { code: 'TYO', name: 'Tokyo', city: 'Tokyo', country: 'Japan', type: 'city' },
  { code: 'DXB', name: 'Dubai', city: 'Dubai', country: 'United Arab Emirates', type: 'city' },
  { code: 'SYD', name: 'Sydney', city: 'Sydney', country: 'Australia', type: 'city' },
];

export function formatLocationLabel(loc: LocationNode): string {
  const main = loc.city ? `${loc.city}, ${loc.country}` : `${loc.name}, ${loc.country}`;
  const code = loc.code ? ` (${loc.code})` : '';
  return `${main}${code}`;
}

