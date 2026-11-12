/**
 * Calculadora de ahorro AMPERIA.
 * Compara el costo mensual de un carro a gasolina contra un híbrido, un enchufable o un eléctrico,
 * con factores ajustados a Bogotá (2.600 m de altitud y tráfico pesado).
 */
export type CompareWith = 'hibrido' | 'enchufable' | 'electrico';

export type CalcInput = {
  kmPerMonth: number;
  gasolinePerGallon: number; // COP
  currentKmPerGallon: number; // consumo del carro actual
  compareWith: CompareWith;
  homeKWhPrice: number; // COP/kWh en casa
  homeChargeShare: number; // 0..1 proporción de carga en casa
  stationKWhPrice: number; // COP/kWh en estación
};

export const defaultCalcInput: CalcInput = {
  kmPerMonth: 1200,
  gasolinePerGallon: 15800,
  currentKmPerGallon: 35,
  compareWith: 'hibrido',
  homeKWhPrice: 890,
  homeChargeShare: 0.8,
  stationKWhPrice: 1290,
};

/** Bogotá: la altitud baja la eficiencia de combustión ~6 %. El tráfico favorece al híbrido. */
const ALTITUDE_PENALTY = 0.94;
const HYBRID_GAIN_IN_TRAFFIC = 1.62; // híbrido rinde ~62 % más km por galón en ciudad
const EV_KWH_PER_100KM = 15.5;
const PHEV_ELECTRIC_SHARE = 0.75; // % de km que un enchufable hace en eléctrico en uso urbano
const MAINTENANCE_PER_KM = { gasolina: 95, hibrido: 70, enchufable: 60, electrico: 35 } as const;
const CO2_KG_PER_GALLON = 8.9;

export type CalcResult = {
  currentMonthly: number;
  newMonthly: number;
  monthlySavings: number;
  yearlySavings: number;
  fiveYearSavings: number;
  co2SavedKgYear: number;
  energyBreakdown: { fuel: number; electricity: number; maintenance: number };
};

export function calculate(i: CalcInput): CalcResult {
  const effectiveKmPerGallon = Math.max(5, i.currentKmPerGallon * ALTITUDE_PENALTY);
  const currentGallons = i.kmPerMonth / effectiveKmPerGallon;
  const currentFuel = currentGallons * i.gasolinePerGallon;
  const currentMaint = i.kmPerMonth * MAINTENANCE_PER_KM.gasolina;
  const currentMonthly = currentFuel + currentMaint;

  const kwhPrice = i.homeKWhPrice * i.homeChargeShare + i.stationKWhPrice * (1 - i.homeChargeShare);

  let fuel = 0;
  let electricity = 0;
  let newGallons = 0;

  if (i.compareWith === 'hibrido') {
    newGallons = i.kmPerMonth / (effectiveKmPerGallon * HYBRID_GAIN_IN_TRAFFIC);
    fuel = newGallons * i.gasolinePerGallon;
  } else if (i.compareWith === 'enchufable') {
    const evKm = i.kmPerMonth * PHEV_ELECTRIC_SHARE;
    const gasKm = i.kmPerMonth - evKm;
    newGallons = gasKm / (effectiveKmPerGallon * 1.45);
    fuel = newGallons * i.gasolinePerGallon;
    electricity = (evKm / 100) * (EV_KWH_PER_100KM * 1.1) * kwhPrice;
  } else {
    electricity = (i.kmPerMonth / 100) * EV_KWH_PER_100KM * kwhPrice;
  }

  const maintenance = i.kmPerMonth * MAINTENANCE_PER_KM[i.compareWith];
  const newMonthly = fuel + electricity + maintenance;
  const monthlySavings = Math.max(0, currentMonthly - newMonthly);

  return {
    currentMonthly,
    newMonthly,
    monthlySavings,
    yearlySavings: monthlySavings * 12,
    fiveYearSavings: monthlySavings * 60,
    co2SavedKgYear: Math.max(0, (currentGallons - newGallons) * CO2_KG_PER_GALLON * 12 * (i.compareWith === 'electrico' ? 0.9 : 1)),
    energyBreakdown: { fuel, electricity, maintenance },
  };
}

/** Costo mensual estimado para un vehículo concreto del catálogo. */
export function monthlyCostForVehicle(
  v: { powertrain: string; kmPerL?: number; evRangeKm?: number },
  kmPerMonth = defaultCalcInput.kmPerMonth,
) {
  const gal = defaultCalcInput.gasolinePerGallon;
  const kwh = defaultCalcInput.homeKWhPrice * 0.8 + defaultCalcInput.stationKWhPrice * 0.2;
  if (v.powertrain === 'electrico') return (kmPerMonth / 100) * EV_KWH_PER_100KM * kwh;
  const kmPerGallon = (v.kmPerL ?? 15) * 3.785 * ALTITUDE_PENALTY;
  if (v.powertrain === 'enchufable') {
    const evKm = kmPerMonth * PHEV_ELECTRIC_SHARE;
    return ((kmPerMonth - evKm) / kmPerGallon) * gal + (evKm / 100) * EV_KWH_PER_100KM * 1.1 * kwh;
  }
  return (kmPerMonth / kmPerGallon) * gal;
}
