/**
 * Algerian Wilayas coordinates mapping
 * Provides latitude & longitude for all Algerian wilayas for map centering
 */

export interface WilayaCoord {
  code: number;
  name: string;
  nameFr: string;
  lat: number;
  lng: number;
}

export const ALGERIA_WILAYAS_COORDINATES: Record<string, WilayaCoord> = {
  "1": { code: 1, name: "أدرار", nameFr: "Adrar", lat: 27.8742, lng: -0.2939 },
  "2": { code: 2, name: "الشلف", nameFr: "Chlef", lat: 36.1652, lng: 1.3345 },
  "3": { code: 3, name: "الأغواط", nameFr: "Laghouat", lat: 33.8000, lng: 2.8651 },
  "4": { code: 4, name: "أم البواقي", nameFr: "Oum El Bouaghi", lat: 35.8755, lng: 7.1135 },
  "5": { code: 5, name: "باتنة", nameFr: "Batna", lat: 35.5558, lng: 6.1741 },
  "6": { code: 6, name: "بجاية", nameFr: "Béjaïa", lat: 36.7509, lng: 5.0567 },
  "7": { code: 7, name: "بسكرة", nameFr: "Biskra", lat: 34.8504, lng: 5.7281 },
  "8": { code: 8, name: "بشار", nameFr: "Béchar", lat: 31.6167, lng: -2.2167 },
  "9": { code: 9, name: "البليدة", nameFr: "Blida", lat: 36.4702, lng: 2.8277 },
  "10": { code: 10, name: "البويرة", nameFr: "Bouira", lat: 36.3749, lng: 3.9020 },
  "11": { code: 11, name: "تمنراست", nameFr: "Tamanrasset", lat: 22.7850, lng: 5.5228 },
  "12": { code: 12, name: "تبسة", nameFr: "Tébessa", lat: 35.4042, lng: 8.1242 },
  "13": { code: 13, name: "تلمسان", nameFr: "Tlemcen", lat: 34.8783, lng: -1.3150 },
  "14": { code: 14, name: "تيارت", nameFr: "Tiaret", lat: 35.3710, lng: 1.3170 },
  "15": { code: 15, name: "تيزي وزو", nameFr: "Tizi Ouzou", lat: 36.7118, lng: 4.0459 },
  "16": { code: 16, name: "الجزائر", nameFr: "Alger", lat: 36.7538, lng: 3.0588 },
  "17": { code: 17, name: "الجلفة", nameFr: "Djelfa", lat: 34.6728, lng: 3.2503 },
  "18": { code: 18, name: "جيجل", nameFr: "Jijel", lat: 36.8206, lng: 5.7667 },
  "19": { code: 19, name: "سطيف", nameFr: "Sétif", lat: 36.1906, lng: 5.4106 },
  "20": { code: 20, name: "سعيدة", nameFr: "Saïda", lat: 34.8303, lng: 0.1517 },
  "21": { code: 21, name: "سكيكدة", nameFr: "Skikda", lat: 36.8790, lng: 6.9069 },
  "22": { code: 22, name: "سيدي بلعباس", nameFr: "Sidi Bel Abbès", lat: 35.1899, lng: -0.6308 },
  "23": { code: 23, name: "عنابة", nameFr: "Annaba", lat: 36.9000, lng: 7.7667 },
  "24": { code: 24, name: "قالمة", nameFr: "Guelma", lat: 36.4621, lng: 7.4261 },
  "25": { code: 25, name: "قسنطينة", nameFr: "Constantine", lat: 36.3650, lng: 6.6147 },
  "26": { code: 26, name: "المدية", nameFr: "Médéa", lat: 36.2642, lng: 2.7539 },
  "27": { code: 27, name: "مستغانم", nameFr: "Mostaganem", lat: 35.9311, lng: 0.0892 },
  "28": { code: 28, name: "المسيلة", nameFr: "M'Sila", lat: 35.7058, lng: 4.5419 },
  "29": { code: 29, name: "معسكر", nameFr: "Mascara", lat: 35.3967, lng: 0.1403 },
  "30": { code: 30, name: "ورقلة", nameFr: "Ouargla", lat: 31.9539, lng: 5.3204 },
  "31": { code: 31, name: "وهران", nameFr: "Oran", lat: 35.6987, lng: -0.6349 },
  "32": { code: 32, name: "البيض", nameFr: "El Bayadh", lat: 33.6832, lng: 1.0193 },
  "33": { code: 33, name: "إليزي", nameFr: "Illizi", lat: 26.4833, lng: 8.4667 },
  "34": { code: 34, name: "برج بوعريريج", nameFr: "Bordj Bou Arréridj", lat: 36.0732, lng: 4.7611 },
  "35": { code: 35, name: "بومرداس", nameFr: "Boumerdès", lat: 36.7599, lng: 3.4735 },
  "36": { code: 36, name: "الطارف", nameFr: "El Tarf", lat: 36.7672, lng: 8.3138 },
  "37": { code: 37, name: "تندوف", nameFr: "Tindouf", lat: 27.6711, lng: -8.1474 },
  "38": { code: 38, name: "تيسمسيلت", nameFr: "Tissemsilt", lat: 35.6072, lng: 1.8108 },
  "39": { code: 39, name: "الوادي", nameFr: "El Oued", lat: 33.3683, lng: 6.8674 },
  "40": { code: 40, name: "خنشلة", nameFr: "Khenchela", lat: 35.4358, lng: 7.1433 },
  "41": { code: 41, name: "سوق أهراس", nameFr: "Souk Ahras", lat: 36.2864, lng: 7.9511 },
  "42": { code: 42, name: "تيبازة", nameFr: "Tipaza", lat: 36.5897, lng: 2.4475 },
  "43": { code: 43, name: "ميلة", nameFr: "Mila", lat: 36.4503, lng: 6.2644 },
  "44": { code: 44, name: "عين الدفلى", nameFr: "Aïn Defla", lat: 36.2642, lng: 1.9679 },
  "45": { code: 45, name: "النعامة", nameFr: "Naâma", lat: 33.2667, lng: -0.3167 },
  "46": { code: 46, name: "عين تموشنت", nameFr: "Aïn Témouchent", lat: 35.2975, lng: -1.1404 },
  "47": { code: 47, name: "غرداية", nameFr: "Ghardaïa", lat: 32.4909, lng: 3.6735 },
  "48": { code: 48, name: "غليزان", nameFr: "Relizane", lat: 35.7373, lng: 0.5559 },
  "49": { code: 49, name: "تيميمون", nameFr: "Timimoun", lat: 29.2639, lng: 0.2310 },
  "50": { code: 50, name: "برج باجي مختار", nameFr: "Bordj Badji Mokhtar", lat: 21.3283, lng: 0.9547 },
  "51": { code: 51, name: "أولاد جلال", nameFr: "Ouled Djellal", lat: 34.4328, lng: 5.0664 },
  "52": { code: 52, name: "بني عباس", nameFr: "Béni Abbès", lat: 30.1333, lng: -2.1667 },
  "53": { code: 53, name: "عين صالح", nameFr: "In Salah", lat: 27.1935, lng: 2.4607 },
  "54": { code: 54, name: "عين قزام", nameFr: "In Guezzam", lat: 19.5667, lng: 5.7667 },
  "55": { code: 55, name: "تقرت", nameFr: "Touggourt", lat: 33.1065, lng: 6.0644 },
  "56": { code: 56, name: "جانت", nameFr: "Djanet", lat: 24.5539, lng: 9.4858 },
  "57": { code: 57, name: "المغير", nameFr: "El M'Ghair", lat: 33.9500, lng: 5.9200 },
  "58": { code: 58, name: "المنيعة", nameFr: "El Meniaa", lat: 30.5847, lng: 2.8778 },
};

/**
 * Get accurate coordinates by Wilaya name, code, or city in Algeria
 */
export function getAlgeriaCoordinates(
  wilayaNameOrCode?: string | number,
  city?: string,
  currentLat?: number,
  currentLng?: number
): [number, number] {
  // If already accurate coordinates (not generic default [36, 3] or [0, 0])
  if (
    typeof currentLat === "number" &&
    typeof currentLng === "number" &&
    currentLat > 18 &&
    currentLat < 38 &&
    currentLng > -9 &&
    currentLng < 12 &&
    !(currentLat === 36 && currentLng === 3) &&
    !(currentLat === 0 && currentLng === 0)
  ) {
    return [currentLat, currentLng];
  }

  const query = `${wilayaNameOrCode || ""} ${city || ""}`.toLowerCase().trim();

  // Match by wilaya code or name
  for (const key in ALGERIA_WILAYAS_COORDINATES) {
    const item = ALGERIA_WILAYAS_COORDINATES[key];
    if (
      String(item.code) === String(wilayaNameOrCode) ||
      query.includes(item.name.toLowerCase()) ||
      query.includes(item.nameFr.toLowerCase()) ||
      (city && item.nameFr.toLowerCase().includes(city.toLowerCase()))
    ) {
      return [item.lat, item.lng];
    }
  }

  // Default to Algiers center
  return [36.7538, 3.0588];
}

export const ALGERIAN_WILAYAS_LIST = Object.values(ALGERIA_WILAYAS_COORDINATES).map((w) => ({
  code: w.code.toString().padStart(2, "0"),
  id: w.code.toString(),
  name: w.name,
  nameFr: w.nameFr,
  lat: w.lat,
  lng: w.lng,
}));
