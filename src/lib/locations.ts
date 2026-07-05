export type CityId = "mombasa" | "nairobi";

export type CityOption = {
  id: CityId;
  name: string;
  subCounties: string[];
};

export const CITIES: CityOption[] = [
  {
    id: "mombasa",
    name: "Mombasa",
    subCounties: [
      "Mvita",
      "Nyali",
      "Kisauni",
      "Likoni",
      "Changamwe",
      "Jomvu",
    ],
  },
  {
    id: "nairobi",
    name: "Nairobi",
    subCounties: [
      "Westlands",
      "Dagoretti North",
      "Dagoretti South",
      "Lang'ata",
      "Kibra",
      "Roysambu",
      "Kasarani",
      "Ruaraka",
      "Embakasi South",
      "Embakasi North",
      "Embakasi Central",
      "Embakasi East",
      "Embakasi West",
      "Makadara",
      "Kamukunji",
      "Starehe",
      "Mathare",
    ],
  },
];

export function getCityById(id: CityId): CityOption | undefined {
  return CITIES.find((city) => city.id === id);
}

export function getSubCounties(cityId: CityId): string[] {
  return getCityById(cityId)?.subCounties ?? [];
}
