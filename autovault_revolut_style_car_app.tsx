import React, { useState, useMemo, useEffect } from 'react';
import {
  Car,
  Fuel,
  Wrench,
  Calendar,
  TrendingUp,
  Plus,
  ChevronDown,
  Settings,
  Download,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Search,
  BarChart3,
  MessageSquare,
  Zap,
  ShieldCheck,
  X,
  Info,
  Trash2,
  Edit3,
  RotateCcw
} from 'lucide-react';

const DEFAULT_FUELS = ['Diésel', 'Gasolina', 'GLP', 'Híbrido', 'Híbrido Enchufable', 'Eléctrico', 'GNC'];

const RAW_BRAND_MODELS = {
  Abarth: ['500', '595', '695', '124 Spider', '500e'],
  'Alfa Romeo': ['Giulietta', 'MiTo', 'Giulia', 'Stelvio', 'Tonale', 'Junior', '147', '159'],
  Alpine: ['A110', 'A290'],
  'Aston Martin': ['Vantage', 'DB11', 'DB12', 'DBX'],
  Audi: ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q4 e-tron', 'Q5', 'Q7', 'Q8', 'TT', 'e-tron'],
  Bentley: ['Continental GT', 'Bentayga', 'Flying Spur'],
  BMW: ['Serie 1', 'Serie 2', 'Serie 3', 'Serie 4', 'Serie 5', 'Serie 7', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'i3', 'i4', 'iX1', 'iX3'],
  BYD: ['Atto 3', 'Dolphin', 'Seal', 'Seal U', 'Tang', 'Han'],
  Chevrolet: ['Aveo', 'Cruze', 'Captiva', 'Spark', 'Orlando', 'Camaro', 'Matiz'],
  Chrysler: ['300C', 'Voyager', 'Grand Voyager', 'PT Cruiser', 'Sebring'],
  'Citroën': ['C1', 'C2', 'C3', 'C3 Aircross', 'C4', 'C4 Cactus', 'C4 Picasso', 'C5', 'C5 Aircross', 'Berlingo', 'Saxo', 'Xsara'],
  Cupra: ['Formentor', 'León', 'Born', 'Ateca', 'Tavascan', 'Terramar'],
  Dacia: ['Sandero', 'Sandero Stepway', 'Duster', 'Jogger', 'Spring', 'Logan', 'Lodgy', 'Dokker'],
  Daewoo: ['Matiz', 'Kalos', 'Lanos', 'Nubira', 'Tacuma'],
  Dodge: ['Caliber', 'Journey', 'Nitro', 'Avenger', 'Challenger', 'RAM'],
  DS: ['DS 3', 'DS 4', 'DS 7', 'DS 9'],
  Evo: ['Evo3', 'Evo4', 'Evo5', 'Evo7'],
  Ferrari: ['Roma', 'Portofino', 'F8 Tributo', '296 GTB', '488', '458 Italia', 'Purosangue'],
  Fiat: ['500', '500X', '500L', 'Panda', 'Tipo', 'Punto', 'Grande Punto', 'Bravo', 'Stilo', 'Doblò', '600'],
  Ford: ['Fiesta', 'Focus', 'Kuga', 'Puma', 'Mondeo', 'EcoSport', 'C-Max', 'S-Max', 'Galaxy', 'Mustang', 'Mustang Mach-E', 'Ranger', 'Transit', 'Ka'],
  Honda: ['Civic', 'CR-V', 'HR-V', 'Jazz', 'ZR-V', 'Accord', 'Honda e'],
  Hyundai: ['i10', 'i20', 'i30', 'Tucson', 'Kona', 'Santa Fe', 'Bayon', 'Ioniq', 'Ioniq 5', 'Ioniq 6', 'ix35', 'Getz'],
  Infiniti: ['Q30', 'Q50', 'QX30', 'QX50', 'QX70', 'FX'],
  Isuzu: ['D-Max', 'Trooper'],
  Jaecoo: ['Jaecoo 7', 'Jaecoo 8'],
  Jaguar: ['XE', 'XF', 'XJ', 'F-Pace', 'E-Pace', 'I-Pace', 'F-Type', 'X-Type'],
  Jeep: ['Avenger', 'Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler'],
  KGM: ['Tivoli', 'Korando', 'Torres', 'Rexton', 'Musso'],
  Kia: ['Picanto', 'Rio', 'Ceed', 'XCeed', 'ProCeed', 'Sportage', 'Stonic', 'Niro', 'Sorento', 'EV3', 'EV6', 'EV9', 'Carens', 'Carnival'],
  Lada: ['Niva', '4x4', 'Priora'],
  Lamborghini: ['Urus', 'Huracán', 'Revuelto', 'Aventador', 'Gallardo'],
  Lancia: ['Ypsilon', 'Delta', 'Musa', 'Phedra', 'Voyager'],
  'Land Rover': ['Range Rover Evoque', 'Range Rover Velar', 'Range Rover Sport', 'Range Rover', 'Defender', 'Discovery', 'Discovery Sport', 'Freelander'],
  Leapmotor: ['T03', 'C10'],
  Lexus: ['CT 200h', 'UX', 'NX', 'RX', 'LBX', 'IS', 'ES', 'RZ'],
  LynkCo: ['01', '02'],
  Mahindra: ['KUV100', 'XUV500', 'Goa'],
  Maserati: ['Ghibli', 'Grecale', 'Levante', 'Quattroporte', 'GranTurismo'],
  Maxus: ['eDeliver 3', 'T90', 'Euniq 5'],
  Mazda: ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-60', 'CX-80', 'MX-5', 'MX-30'],
  'Mercedes-Benz': ['Clase A', 'Clase B', 'Clase C', 'Clase E', 'Clase S', 'CLA', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'EQA', 'EQB', 'EQC', 'EQE', 'Vito', 'Clase V'],
  MG: ['ZS', 'HS', 'MG3', 'MG4', 'MG5', 'Marvel R', 'Cyberster'],
  Mini: ['Cooper 3p / 5p', 'Countryman', 'Clubman', 'Cabrio', 'Aceman', 'Paceman'],
  Mitsubishi: ['ASX', 'Eclipse Cross', 'Outlander', 'Colt', 'Space Star', 'Montero', 'L200'],
  Nissan: ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf', 'Ariya', 'Pulsar', 'Note', 'Almera', 'Primera', 'Navara', 'Terrano'],
  Omoda: ['Omoda 5', 'Omoda 5 EV', 'Omoda 7'],
  Opel: ['Corsa', 'Astra', 'Mokka', 'Crossland', 'Grandland', 'Insignia', 'Zafira', 'Meriva', 'Vectra', 'Adam', 'Combo'],
  Peugeot: ['108', '206', '207', '208', '307', '308', '407', '408', '508', '2008', '3008', '5008', 'Rifter', 'Partner'],
  Polestar: ['Polestar 2', 'Polestar 3', 'Polestar 4'],
  Porsche: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', '718 Boxster', '718 Cayman'],
  Renault: ['Clio', 'Mégane', 'Captur', 'Austral', 'Arkana', 'Kadjar', 'Scénic', 'Espace', 'Rafale', 'Symbioz', 'Twingo', 'Zoe', 'Renault 5', 'Kangoo', 'Laguna'],
  Saab: ['9-3', '9-5'],
  Seat: ['Ibiza', 'León', 'Arona', 'Ateca', 'Tarraco', 'Altea', 'Toledo', 'Alhambra', 'Mii', 'Córdoba'],
  'Škoda': ['Fabia', 'Scala', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq', 'Citigo', 'Yeti'],
  Smart: ['Fortwo', 'Forfour', '#1', '#3'],
  SsangYong: ['Tivoli', 'Korando', 'Rexton', 'Rodius', 'Kyron', 'Actyon'],
  Subaru: ['XV', 'Crosstrek', 'Forester', 'Outback', 'Impreza', 'BRZ', 'Solterra'],
  Suzuki: ['Swift', 'Vitara', 'S-Cross', 'Ignis', 'Jimny', 'Across', 'Swace', 'SX4', 'Grand Vitara'],
  SWM: ['G01', 'G01F', 'G03F', 'G05'],
  Tata: ['Indica', 'Vista', 'Aria', 'Xenon'],
  Tesla: ['Model 3', 'Model Y', 'Model S', 'Model X'],
  Toyota: ['Yaris', 'Yaris Cross', 'Corolla', 'C-HR', 'RAV4', 'Auris', 'Avensis', 'Aygo', 'Aygo X', 'Prius', 'Land Cruiser', 'Hilux', 'bZ4X', 'Proace'],
  Volkswagen: ['Polo', 'Golf', 'T-Roc', 'T-Cross', 'Taigo', 'Tiguan', 'Touareg', 'Passat', 'Arteon', 'Touran', 'Caddy', 'Scirocco', 'ID.3', 'ID.4', 'ID.5', 'ID.7', 'Transporter / Multivan'],
  Volvo: ['XC40', 'XC60', 'XC90', 'EX30', 'EX90', 'C40', 'S40', 'S60', 'S90', 'V40', 'V60', 'V90', 'C30'],
  XPeng: ['G6', 'G9', 'P7']
};

const SPECIFIC_MODEL_POWERTRAINS = {
  Ferrari: {
    '488': { Gasolina: ['3.9 V8 Biturbo 670cv (GTB / Spider)', '3.9 V8 Biturbo 720cv (Pista)'] },
    '458 Italia': { Gasolina: ['4.5 V8 Atmosférico 570cv (Italia / Spider)', '4.5 V8 Atmosférico 605cv (Speciale)'] },
    'F8 Tributo': { Gasolina: ['3.9 V8 Biturbo 720cv'] },
    Roma: { Gasolina: ['3.9 V8 Biturbo 620cv'] },
    Portofino: { Gasolina: ['3.9 V8 Biturbo 600cv', '3.9 V8 Biturbo 620cv (Portofino M)'] },
    '296 GTB': { 'Híbrido Enchufable': ['3.0 V6 Biturbo PHEV 830cv'] },
    Purosangue: { Gasolina: ['6.5 V12 Atmosférico 725cv'] }
  },
  Lamborghini: {
    Huracán: { Gasolina: ['5.2 V10 Atmosférico 610cv (LP610-4)', '5.2 V10 Atmosférico 640cv (EVO / STO / Tecnica)'] },
    Aventador: { Gasolina: ['6.5 V12 Atmosférico 700cv (LP700-4)', '6.5 V12 Atmosférico 740cv (S)', '6.5 V12 Atmosférico 770cv (SVJ)'] },
    Gallardo: { Gasolina: ['5.0 V10 500cv', '5.2 V10 560cv (LP560-4)'] },
    Urus: {
      Gasolina: ['4.0 V8 Biturbo 650cv', '4.0 V8 Biturbo 666cv (S / Performante)'],
      'Híbrido Enchufable': ['4.0 V8 Biturbo PHEV 800cv (Urus SE)']
    },
    Revuelto: { 'Híbrido Enchufable': ['6.5 V12 PHEV 1015cv'] }
  },
  Porsche: {
    '911': {
      Gasolina: ['3.0 Bóxer Biturbo 385cv (Carrera)', '3.0 Bóxer Biturbo 450cv (Carrera S)', '4.0 Bóxer Atmosférico 510cv (GT3)', '3.8 Bóxer Biturbo 650cv (Turbo S)'],
      Híbrido: ['3.6 Bóxer T-Hybrid 541cv (Carrera GTS)']
    },
    Taycan: { Eléctrico: ['408cv Performance Battery (79 kWh)', '490cv Taycan 4S', '680cv Taycan Turbo', '761cv Taycan Turbo S'] },
    '718 Boxster': { Gasolina: ['2.0 Bóxer Turbo 300cv', '2.5 Bóxer Turbo 350cv (S)', '4.0 Bóxer 400cv (GTS 4.0)'] },
    '718 Cayman': { Gasolina: ['2.0 Bóxer Turbo 300cv', '2.5 Bóxer Turbo 350cv (S)', '4.0 Bóxer 420cv (GT4)', '4.0 Bóxer 500cv (GT4 RS)'] },
    Cayenne: {
      Gasolina: ['3.0 V6 Turbo 353cv', '4.0 V8 Biturbo 474cv (S)', '4.0 V8 Biturbo 659cv (Turbo GT)'],
      'Híbrido Enchufable': ['3.0 V6 E-Hybrid 470cv', '4.0 V8 Turbo E-Hybrid 739cv'],
      Diésel: ['3.0 V6 TDI 245cv / 262cv', '4.2 V8 TDI 385cv (S Diesel)']
    },
    Macan: {
      Gasolina: ['2.0 Turbo 265cv', '2.9 V6 Biturbo 380cv (S)', '2.9 V6 Biturbo 440cv (GTS)'],
      Diésel: ['3.0 V6 TDI 258cv (S Diesel)'],
      Eléctrico: ['Macan 4 Eléctrico 408cv (100 kWh)', 'Macan Turbo Eléctrico 639cv (100 kWh)']
    }
  },
  Ford: {
    Fiesta: {
      Diésel: ['1.6 TDCi 90cv', '1.4 TDCi 68cv / 70cv', '1.5 TDCi 75cv / 85cv', '1.6 TDCi 95cv', '1.8 TDCi 75cv'],
      Gasolina: ['1.25 82cv', '1.4 16v 80cv / 96cv', '1.0 EcoBoost 100cv', '1.0 EcoBoost 125cv', '1.6 Ti-VCT 120cv', '1.6 EcoBoost 182cv (ST)', '1.5 EcoBoost 200cv (ST)'],
      Híbrido: ['1.0 EcoBoost MHEV 125cv', '1.0 EcoBoost MHEV 155cv'],
      GLP: ['1.4 GLP 92cv', '1.1 Ti-VCT GLP 75cv', '1.0 EcoBoost GLP 100cv']
    },
    Focus: {
      Diésel: ['1.6 TDCi 90cv / 109cv / 115cv', '1.5 EcoBlue 120cv', '1.8 TDCi 115cv', '2.0 TDCi 136cv / 150cv / 185cv (ST)'],
      Gasolina: ['1.0 EcoBoost 100cv / 125cv', '1.5 EcoBoost 150cv / 182cv', '1.6 16v 100cv / 115cv', '2.3 EcoBoost 280cv (ST)', '2.3 EcoBoost 350cv (RS)'],
      Híbrido: ['1.0 EcoBoost MHEV 125cv', '1.0 EcoBoost MHEV 155cv'],
      GLP: ['1.6 Ti-VCT GLP 117cv', '1.4 GLP 90cv']
    },
    Kuga: {
      Diésel: ['2.0 TDCi 140cv / 150cv / 180cv', '1.5 EcoBlue 120cv', '2.0 EcoBlue 190cv'],
      Gasolina: ['1.5 EcoBoost 120cv / 150cv'],
      Híbrido: ['2.5 Duratec FHEV 180cv / 190cv'],
      'Híbrido Enchufable': ['2.5 Duratec PHEV 225cv / 243cv'],
      GLP: ['1.5 EcoBoost GLP 150cv']
    },
    Mustang: { Gasolina: ['5.0 V8 Ti-VCT 450cv (GT)', '5.0 V8 460cv (Mach 1 / Dark Horse)', '2.3 EcoBoost 290cv / 317cv'] },
    'Mustang Mach-E': { Eléctrico: ['RWD Rango Estándar 269cv (75 kWh)', 'RWD Gran Autonomía 294cv (98 kWh)', 'AWD Gran Autonomía 351cv (98 kWh)', 'GT AWD 487cv (98 kWh)'] }
  },
  Toyota: {
    Corolla: {
      Híbrido: ['1.8 Hybrid 122cv (125H)', '1.8 Hybrid 140cv (140H)', '2.0 Hybrid 184cv (180H)', '2.0 Hybrid 196cv (200H)'],
      Gasolina: ['1.2 Turbo 116cv', '1.6 VVT-i 110cv / 132cv', '1.6 Turbo 300cv (GR Corolla)'],
      Diésel: ['1.4 D-4D 90cv', '2.0 D-4D 116cv / 126cv'],
      GLP: ['1.8 Hybrid GLP 122cv / 140cv', '1.6 VVT-i GLP 110cv']
    },
    Yaris: {
      Híbrido: ['1.5 Hybrid 100cv (100H)', '1.5 Hybrid 116cv (120H)', '1.5 Hybrid 130cv (130H)'],
      Gasolina: ['1.0 VVT-i 69cv / 72cv', '1.33 VVT-i 100cv', '1.5 VVT-i 111cv / 125cv', '1.6 Turbo 261cv / 280cv (GR Yaris)'],
      Diésel: ['1.4 D-4D 75cv / 90cv'],
      GLP: ['1.0 / 1.5 VVT-i GLP']
    },
    RAV4: {
      Híbrido: ['2.5 Hybrid 218cv 4x2 (220H)', '2.5 Hybrid 222cv AWD-i (220H)', '2.5 Hybrid 197cv (200H)'],
      'Híbrido Enchufable': ['2.5 Plug-in Hybrid 306cv AWD-i (300PH)'],
      Diésel: ['2.0 D-4D 124cv / 143cv', '2.2 D-4D 136cv / 150cv / 177cv'],
      Gasolina: ['2.0 VVT-i 150cv / 152cv']
    },
    bZ4X: { Eléctrico: ['204cv 4x2 (71,4 kWh)', '218cv AWD 4x4 (71,4 kWh)'] }
  },
  Tesla: {
    'Model 3': { Eléctrico: ['Tracción Trasera RWD 283cv (60 kWh)', 'Gran Autonomía AWD 351cv / 498cv (75 kWh)', 'Performance AWD 460cv / 513cv (75 kWh)'] },
    'Model Y': { Eléctrico: ['Tracción Trasera RWD 299cv (60 kWh)', 'Gran Autonomía RWD / AWD 347cv / 514cv (75 kWh)', 'Performance AWD 534cv (75 kWh)'] },
    'Model S': { Eléctrico: ['Dual Motor AWD 670cv (100 kWh)', 'Plaid Tri-Motor 1020cv (100 kWh)', '85D / 90D / 100D (367cv - 612cv)'] },
    'Model X': { Eléctrico: ['Dual Motor AWD 670cv (100 kWh)', 'Plaid Tri-Motor 1020cv (100 kWh)', '90D / 100D (422cv - 612cv)'] }
  },
  Seat: {
    Ibiza: {
      Gasolina: ['1.0 MPI 80cv', '1.0 TSI 95cv', '1.0 TSI 110cv / 115cv', '1.5 TSI 150cv', '1.2 TSI 90cv / 105cv', '1.4 16v 75cv / 85cv / 100cv'],
      Diésel: ['1.4 TDI 70cv / 80cv / 90cv', '1.6 TDI 90cv / 95cv / 105cv', '1.9 TDI 100cv / 105cv / 130cv'],
      GNC: ['1.0 TGI 90cv (Gas Natural)'],
      GLP: ['1.4 16v GLP 85cv', '1.6 GLP 105cv', '1.0 TSI GLP 95cv']
    },
    'León': {
      Diésel: ['1.6 TDI 90cv / 105cv / 115cv', '1.9 TDI 105cv / 110cv / 150cv (FR)', '2.0 TDI 115cv', '2.0 TDI 140cv / 150cv / 184cv (FR)'],
      Gasolina: ['1.0 TSI 110cv', '1.2 TSI 105cv / 110cv', '1.4 TSI 122cv / 125cv / 150cv', '1.5 TSI 130cv / 150cv', '2.0 TSI 190cv / 290cv / 300cv (Cupra)'],
      Híbrido: ['1.0 eTSI MHEV 110cv', '1.5 eTSI MHEV 115cv / 150cv'],
      'Híbrido Enchufable': ['1.4 e-Hybrid PHEV 204cv', '1.5 e-Hybrid PHEV 204cv'],
      GNC: ['1.4 TGI 110cv', '1.5 TGI 130cv'],
      GLP: ['1.6 GLP 102cv', '1.4 TSI GLP 125cv']
    }
  },
  Dacia: {
    Sandero: {
      GLP: ['1.0 TCe ECO-G 100cv GLP (De fábrica)', '0.9 TCe GLP 90cv', '1.4 / 1.2 GLP 75cv'],
      Gasolina: ['1.0 SCe 65cv / 75cv', '0.9 TCe 90cv', '1.0 TCe 90cv'],
      Diésel: ['1.5 dCi 75cv / 90cv', '1.5 Blue dCi 95cv']
    },
    'Sandero Stepway': {
      GLP: ['1.0 TCe ECO-G 100cv GLP (De fábrica)', '0.9 TCe GLP 90cv'],
      Gasolina: ['0.9 TCe 90cv', '1.0 TCe 90cv / 110cv'],
      Diésel: ['1.5 dCi 90cv', '1.5 Blue dCi 95cv']
    },
    Duster: {
      GLP: ['1.0 TCe ECO-G 100cv GLP', '1.6 GLP 115cv'],
      Diésel: ['1.5 dCi 90cv / 110cv', '1.5 Blue dCi 115cv (4x2 / 4x4)'],
      Gasolina: ['1.2 TCe 125cv', '1.3 TCe 130cv / 150cv', '1.6 16v 105cv / 115cv'],
      Híbrido: ['1.2 TCe MHEV 130cv', '1.6 Hybrid 140cv']
    },
    Spring: { Eléctrico: ['Eléctrico 45cv (26,8 kWh)', 'Eléctrico Extreme 65cv (26,8 kWh)'] }
  }
};

const buildLogicalPowertrains = (brand, modelName) => {
  if (SPECIFIC_MODEL_POWERTRAINS[brand]?.[modelName]) {
    return SPECIFIC_MODEL_POWERTRAINS[brand][modelName];
  }

  const mLower = modelName.toLowerCase();
  const isPureElectricBrand = ['Tesla', 'Polestar', 'XPeng'].includes(brand);
  const isPureElectricModel =
    isPureElectricBrand ||
    /\b(e-tron|id\.3|id\.4|id\.5|id\.7|taycan|born|tavascan|ioniq 5|ioniq 6|ev3|ev6|ev9|zoe|spring|leaf|ariya|enyaq|bz4x|mustang mach-e|500e|honda e|i-pace|eqa|eqb|eqc|eqe|i3|i4|ix1|ix3|ex30|ex90|aceman|mg4|marvel r|cyberster|atto 3|dolphin|t03|edeliver 3|solterra|rz|a290|renault 5)\b/i.test(
      modelName
    );

  if (isPureElectricModel) {
    return {
      Eléctrico: [
        'Eléctrico Rango Estándar (150 kW / 204cv)',
        'Eléctrico Gran Autonomía (210 kW / 286cv)',
        'Eléctrico Dual Motor AWD (300 kW / 408cv)'
      ]
    };
  }

  if (brand === 'Aston Martin') {
    return { Gasolina: ['4.0 V8 Biturbo 510cv / 535cv', '4.0 V8 Biturbo 665cv / 707cv (DBX707 / DB12)', '5.2 V12 Biturbo 608cv / 725cv', '4.7 V8 Atmosférico 426cv'] };
  }
  if (brand === 'Bentley') {
    return {
      Gasolina: ['4.0 V8 Biturbo 550cv', '6.0 W12 Biturbo 635cv / 659cv (Speed)'],
      'Híbrido Enchufable': ['3.0 V6 TFSI Hybrid 462cv', '4.0 V8 Ultra Performance Hybrid 782cv'],
      Diésel: ['4.0 V8 TDI Triple Turbo 435cv (Bentayga Diesel)']
    };
  }
  if (brand === 'Alpine') {
    return { Gasolina: ['1.8 Turbo 252cv (A110)', '1.8 Turbo 300cv (A110 GT / S / R)'] };
  }
  if (brand === 'Maserati') {
    return {
      Gasolina: ['3.0 V6 Biturbo 350cv / 430cv', '3.0 V6 Nettuno 490cv / 530cv (Trofeo)', '3.8 V8 Biturbo 580cv (Trofeo)', '4.7 V8 Atmosférico 460cv'],
      Híbrido: ['2.0 Turbo MHEV 300cv / 330cv'],
      Diésel: ['3.0 V6 MultiJet 250cv / 275cv'],
      Eléctrico: ['Folgore Eléctrico AWD (550cv / 761cv)']
    };
  }

  if (['Volkswagen', 'Audi', 'Seat', 'Škoda', 'Cupra'].includes(brand)) {
    const isSmall = /\b(a1|polo|ibiza|fabia|mii|citigo|arona|kamiq|t-cross|taigo|q2)\b/i.test(mLower);
    return {
      Diésel: isSmall
        ? ['1.4 TDI 75cv / 90cv', '1.6 TDI 90cv / 95cv / 105cv / 115cv', '1.9 TDI 100cv / 105cv / 130cv']
        : ['1.6 TDI 105cv / 115cv', '1.9 TDI 105cv / 130cv', '2.0 TDI 115cv / 140cv / 150cv', '2.0 TDI 184cv / 190cv / 200cv', '3.0 V6 TDI 218cv / 245cv / 286cv'],
      Gasolina: isSmall
        ? ['1.0 MPI / TSI 80cv / 95cv', '1.0 TSI 110cv / 115cv', '1.2 TSI 90cv / 105cv', '1.4 16v 85cv', '1.5 TSI 150cv']
        : ['1.0 TSI 110cv', '1.4 TSI 122cv / 125cv / 150cv', '1.5 TSI 130cv / 150cv', '1.8 TFSI / TSI 160cv / 180cv', '2.0 TFSI / TSI 190cv / 245cv / 300cv'],
      Híbrido: ['1.0 eTSI MHEV 110cv', '1.5 eTSI / TFSI MHEV 115cv / 150cv', '2.0 TDI / TFSI MHEV 163cv / 204cv'],
      'Híbrido Enchufable': ['1.4 e-Hybrid / TFSIe 204cv / 245cv', '1.5 e-Hybrid / TFSIe 204cv / 272cv'],
      GNC: ['1.0 TGI 90cv (GNC)', '1.4 / 1.5 TGI 110cv / 130cv (GNC)'],
      GLP: ['1.4 / 1.6 GLP 85cv / 102cv', '1.0 / 1.4 TSI GLP']
    };
  }

  if (['Peugeot', 'Citroën', 'DS', 'Opel', 'Fiat', 'Alfa Romeo', 'Jeep', 'Lancia', 'Abarth'].includes(brand)) {
    if (brand === 'Abarth') {
      return {
        Gasolina: ['1.4 T-Jet 135cv / 145cv', '1.4 T-Jet 165cv (Turismo)', '1.4 T-Jet 180cv (Competizione / Esseesse)'],
        Eléctrico: ['Eléctrico 155cv (500e)', 'Eléctrico 240cv / 280cv (600e)']
      };
    }
    return {
      Diésel: [
        '1.4 HDi / CDTi 68cv / 70cv',
        '1.5 BlueHDi / Diesel 100cv / 130cv',
        '1.6 HDi / BlueHDi / MultiJet / CDTi 90cv / 100cv / 110cv / 120cv',
        '1.9 / 2.0 HDi / BlueHDi / JTDm / CDTi 136cv / 150cv / 180cv',
        '2.2 MultiJet / BlueHDi 160cv / 210cv'
      ],
      Gasolina: [
        '1.2 PureTech 82cv / 100cv / 110cv / 130cv',
        '1.4 16v / VTi / Turbo 75cv / 95cv / 120cv / 140cv',
        '1.6 VTi / THP / PureTech 120cv / 156cv / 180cv / 200cv',
        '2.0 Turbo 200cv / 280cv'
      ],
      Híbrido: ['1.2 Hybrid MHEV 100cv e-DCS6', '1.2 Hybrid MHEV 136cv e-DCS6', '1.5 Hybrid MHEV 130cv / 160cv'],
      'Híbrido Enchufable': ['1.6 Plug-in Hybrid 180cv / 225cv', '1.6 Plug-in Hybrid AWD 300cv / 360cv', '1.3 4xe PHEV 190cv / 240cv'],
      GLP: ['1.2 / 1.4 GLP 69cv / 95cv / 120cv', '1.2 PureTech GLP 100cv'],
      Eléctrico: ['Eléctrico 100 kW / 136cv (50 kWh)', 'Eléctrico 115 kW / 156cv (54 kWh)']
    };
  }

  if (['Renault', 'Dacia', 'Nissan', 'Mitsubishi'].includes(brand)) {
    return {
      Diésel: [
        '1.5 dCi 75cv / 85cv / 90cv / 105cv / 110cv',
        '1.5 Blue dCi 95cv / 115cv',
        '1.6 dCi 130cv / 160cv',
        '1.9 / 2.0 dCi 120cv / 130cv / 150cv / 175cv',
        '2.2 / 2.5 DI-D / dCi 136cv / 178cv / 190cv'
      ],
      Gasolina: [
        '0.9 TCe / IG-T 90cv',
        '1.0 TCe / DIG-T 90cv / 100cv / 114cv',
        '1.2 16v / TCe / DIG-T 75cv / 115cv / 130cv',
        '1.3 TCe / DIG-T 130cv / 140cv / 160cv',
        '1.6 16v / DIG-T 110cv / 163cv / 200cv'
      ],
      Híbrido: [
        '1.3 TCe Mild Hybrid 140cv / 158cv',
        '1.6 E-Tech Full Hybrid 140cv / 145cv',
        '1.2 E-Tech Full Hybrid 200cv',
        '1.5 e-POWER 190cv / 213cv'
      ],
      'Híbrido Enchufable': ['1.6 E-Tech Plug-in Hybrid 160cv', '1.2 E-Tech 4x4 300cv', '2.4 PHEV 224cv / 252cv'],
      GLP: ['1.0 TCe ECO-G 100cv GLP (De fábrica)', '0.9 TCe GLP 90cv', '1.4 / 1.6 GLP 85cv / 110cv']
    };
  }

  if (['BMW', 'Mini'].includes(brand)) {
    return {
      Diésel: [
        '116d / 216d / Cooper D 1.5 116cv',
        '118d / 318d / X1 sDrive18d 2.0 143cv / 150cv',
        '120d / 320d / 520d / X3 xDrive20d 2.0 163cv / 177cv / 184cv / 190cv',
        '330d / 530d / X5 xDrive30d 3.0 6L 231cv / 258cv / 286cv'
      ],
      Gasolina: [
        '116i / 118i / Cooper 1.5 Turbo 109cv / 136cv / 140cv',
        '120i / 320i / Cooper S 2.0 Turbo 178cv / 184cv / 192cv',
        '330i / 430i 2.0 Turbo 245cv / 258cv',
        'M135i / M240i / M340i / M3 306cv / 374cv / 510cv'
      ],
      Híbrido: ['20d / 20i Mild Hybrid 48V 163cv / 170cv / 190cv', '30d / 40i Mild Hybrid 48V 286cv / 333cv'],
      'Híbrido Enchufable': ['225xe / X1 xDrive25e / Countryman SE 220cv / 245cv', '330e / 530e / X3 xDrive30e 292cv', 'X5 xDrive45e / 50e 394cv / 489cv'],
      Eléctrico: ['eDrive20 / Cooper E 184cv / 204cv', 'eDrive35 / eDrive40 286cv / 340cv', 'xDrive30 / M50 313cv / 544cv']
    };
  }

  if (['Mercedes-Benz', 'Smart'].includes(brand)) {
    if (brand === 'Smart') {
      return {
        Gasolina: ['1.0 71cv (Fortwo / Forfour)', '0.9 Turbo 90cv / 109cv (Brabus)'],
        Diésel: ['0.8 cdi 45cv / 54cv'],
        Eléctrico: ['EQ Fortwo / Forfour 82cv (17,6 kWh)', '#1 / #3 Pro+ 272cv (66 kWh)', '#1 / #3 Brabus AWD 428cv']
      };
    }
    return {
      Diésel: [
        '180 d (1.5 / 2.0 CDI) 109cv / 116cv',
        '200 d (2.0 / 2.1 CDI) 136cv / 150cv',
        '220 d (2.0 / 2.1 CDI) 170cv / 190cv / 194cv / 200cv',
        '250 d / 300 d 204cv / 245cv / 269cv',
        '350 d / 400 d 3.0 6L 258cv / 286cv / 330cv'
      ],
      Gasolina: [
        '180 (1.3 / 1.6 Turbo) 122cv / 136cv',
        '200 (1.3 / 2.0 Turbo) 156cv / 163cv / 184cv',
        '250 / 300 2.0 Turbo 211cv / 224cv / 258cv',
        'AMG 35 / 45 / 43 / 63 (306cv - 612cv)'
      ],
      Híbrido: ['180 / 200 Mild Hybrid EQ Boost 136cv / 163cv / 204cv', '200 d / 220 d Mild Hybrid EQ Boost 163cv / 197cv'],
      'Híbrido Enchufable': ['250 e EQ Power 218cv', '300 e / 300 de EQ Power 306cv / 313cv / 320cv'],
      Eléctrico: ['250+ 190cv (66,5 kWh)', '300 / 350 4MATIC 228cv / 292cv']
    };
  }

  return {
    Diésel: [
      '1.4 / 1.5 CRDi / TDCi / dCi 90cv / 115cv',
      '1.6 CRDi / TDCi / i-DTEC 115cv / 136cv',
      '2.0 CRDi / D / Skyactiv-D 140cv / 150cv / 185cv',
      '2.2 CRDi / i-DTEC / Skyactiv-D 150cv / 175cv / 200cv'
    ],
    Gasolina: [
      '1.0 T-GDI / Turbo 100cv / 120cv',
      '1.2 / 1.4 MPI / VVT 84cv / 100cv',
      '1.5 T-GDI / VTEC / Skyactiv-G 120cv / 150cv / 160cv',
      '1.6 T-GDI / Turbo 150cv / 177cv / 204cv',
      '2.0 Skyactiv-G /Skyactiv-X / Turbo 150cv / 186cv / 245cv'
    ],
    Híbrido: [
      '1.5 / 1.6 HEV Híbrido 141cv / 194cv',
      '1.6 T-GDI HEV Híbrido 215cv / 230cv',
      '2.0 e:HEV / Mild Hybrid 150cv / 184cv'
    ],
    'Híbrido Enchufable': [
      '1.5 / 1.6 PHEV Enchufable 225cv / 252cv / 265cv',
      '2.0 / 2.5 PHEV Enchufable 306cv / 327cv / 455cv'
    ],
    GLP: ['1.2 / 1.4 GLP 85cv / 100cv', '1.5 / 1.6 GLP 115cv / 140cv'],
    Eléctrico: ['Eléctrico Estándar (150 kW / 204cv)', 'Eléctrico Gran Autonomía (160 kW / 218cv)']
  };
};

const CAR_CATALOG = Object.keys(RAW_BRAND_MODELS)
  .sort((a, b) => a.localeCompare(b, 'es'))
  .reduce((acc, brand) => {
    acc[brand] = {};
    RAW_BRAND_MODELS[brand].forEach((modelName) => {
      const enginesByFuel = buildLogicalPowertrains(brand, modelName);
      const fuels = Object.keys(enginesByFuel);
      acc[brand][modelName] = { fuels, enginesByFuel };
    });
    return acc;
  }, {});

const MAINTENANCE_PRESETS = [
  {
    id: 'oil',
    name: 'Cambiar el aceite del motor',
    shortName: 'Cambio de aceite y filtro',
    icon: '🛢️',
    intervalKm: 15000,
    purpose: 'Sirve para que el motor esté bien lubricado y no se caliente ni se rompa.'
  },
  {
    id: 'tires',
    name: 'Cambiar las ruedas (Neumáticos)',
    shortName: 'Ruedas / Neumáticos nuevos',
    icon: '🛞',
    intervalKm: 35000,
    purpose: 'Fundamental para que el coche agarre bien en curva y frene a tiempo con lluvia.'
  },
  {
    id: 'brakes',
    name: 'Pastillas o discos de freno',
    shortName: 'Pastillas o discos de freno',
    icon: '🛑',
    intervalKm: 45000,
    purpose: 'Evita que los frenos chirríen y garantiza que el coche frene en pocos metros.'
  },
  {
    id: 'belt',
    name: 'Correa de distribución',
    shortName: 'Correa de distribución',
    icon: '⚙️',
    intervalKm: 120000,
    purpose: 'Si se rompe con el coche en marcha puede causar una avería muy grave en el motor.'
  },
  {
    id: 'battery',
    name: 'Batería de arranque (12V)',
    shortName: 'Batería nueva (12V)',
    icon: '🔋',
    intervalKm: 60000,
    purpose: 'Necesaria para que el coche arranque a la primera, sobre todo en días fríos.'
  },
  {
    id: 'itv',
    name: 'Pasar la revisión ITV',
    shortName: 'Revisión ITV / Pre-ITV',
    icon: '✅',
    intervalKm: 15000,
    purpose: 'Inspección obligatoria para comprobar seguridad, luces, frenos y emisiones.'
  },
  {
    id: 'breakdown',
    name: 'Historial de Averías (Reparaciones)',
    shortName: 'Avería (Reparación correctiva)',
    icon: '🚨',
    intervalKm: 0,
    isCorrective: true,
    purpose: 'Registro de averías imprevistas para recordar qué le pasó al coche y cómo se solucionó.'
  }
];

const parseFlexibleDecimal = (val) => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  let str = String(val).trim().replace(/\s/g, '');
  if (str.includes('.') && str.includes(',')) {
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  }
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
};

const parseFlexibleKm = (val) => {
  if (typeof val === 'number') return Math.round(val);
  if (!val) return 0;
  const digitsOnly = String(val).replace(/[^0-9]/g, '');
  const parsed = parseInt(digitsOnly, 10);
  return isNaN(parsed) ? 0 : parsed;
};

const formatEuro = (num) => {
  const n = parseFlexibleDecimal(num);
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatKm = (num) => {
  const n = parseFlexibleKm(num);
  return n.toLocaleString('es-ES');
};

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const isoToSpanishDate = (isoStr) => {
  if (!isoStr || !isoStr.includes('-')) return isoStr || '16 Oct 2026';
  const [year, month, day] = isoStr.split('-');
  const mIndex = parseInt(month, 10) - 1;
  const monthName = MESES_CORTOS[mIndex] || 'Oct';
  return `${parseInt(day, 10)} ${monthName} ${year}`;
};

const spanishDateToIso = (dateStr) => {
  if (!dateStr) return '2026-10-16';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const parts = String(dateStr).trim().split(/\s+/);
  if (parts.length === 3) {
    const day = String(parts[0]).padStart(2, '0');
    const monthIdx = MESES_CORTOS.findIndex(
      (m) => m.toLowerCase() === parts[1].toLowerCase().replace('.', '')
    );
    const month = monthIdx >= 0 ? String(monthIdx + 1).padStart(2, '0') : '10';
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return '2026-10-16';
};

const getTodayIso = () => '2026-10-16';
const getYesterdayIso = () => '2026-10-15';

export default function App() {
  const SHOW_COMMUNITY_TABS_DEFAULT = false;

  const [showCommunityTabs, setShowCommunityTabs] = useState(() => {
    try {
      const saved = localStorage.getItem('autovault_show_tabs');
      return saved ? JSON.parse(saved) : SHOW_COMMUNITY_TABS_DEFAULT;
    } catch {
      return SHOW_COMMUNITY_TABS_DEFAULT;
    }
  });

  const [activeTab, setActiveTab] = useState('home');
  const [costUnitMode, setCostUnitMode] = useState('100km');

  const [cars, setCars] = useState(() => {
    try {
      const saved = localStorage.getItem('autovault_cars_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [selectedCarId, setSelectedCarId] = useState(() => {
    try {
      return localStorage.getItem('autovault_selected_car_v2') || null;
    } catch {
      return null;
    }
  });

  const [isCarDropdownOpen, setIsCarDropdownOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);
  const [expenseModalType, setExpenseModalType] = useState(null);
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  const [newCarAlias, setNewCarAlias] = useState('');
  const [newCarBrand, setNewCarBrand] = useState('Ford');
  const [customBrand, setCustomBrand] = useState('');
  const [newCarModel, setNewCarModel] = useState('Fiesta');
  const [customModel, setCustomModel] = useState('');
  const [newCarFuel, setNewCarFuel] = useState('Diésel');
  const [newCarEngine, setNewCarEngine] = useState('1.6 TDCi 90cv');
  const [customEngine, setCustomEngine] = useState('');
  const [newCarMonth, setNewCarMonth] = useState('11');
  const [newCarYear, setNewCarYear] = useState('2006');
  const [newCarKm, setNewCarKm] = useState('');
  const [newCarBatteryKwh, setNewCarBatteryKwh] = useState('60');

  const [expCost, setExpCost] = useState('');
  const [expLiters, setExpLiters] = useState('');
  const [expKm, setExpKm] = useState('');
  const [expDate, setExpDate] = useState('2026-10-16');
  const [evChargePlace, setEvChargePlace] = useState('casa');
  const [evPercentArrival, setEvPercentArrival] = useState('20');
  const [evPercentDeparture, setEvPercentDeparture] = useState('80');
  const [workshopPresetId, setWorkshopPresetId] = useState('oil');
  const [workshopWho, setWorkshopWho] = useState('taller');
  const [workshopNote, setWorkshopNote] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('autovault_cars_v2', JSON.stringify(cars));
    } catch (e) {
      console.error(e);
    }
  }, [cars]);

  useEffect(() => {
    try {
      if (selectedCarId) {
        localStorage.setItem('autovault_selected_car_v2', selectedCarId);
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedCarId]);

  useEffect(() => {
    try {
      localStorage.setItem('autovault_show_tabs', JSON.stringify(showCommunityTabs));
    } catch (e) {
      console.error(e);
    }
  }, [showCommunityTabs]);

  const activeCar = useMemo(() => {
    if (!cars.length) return null;
    return cars.find((c) => c.id === selectedCarId) || cars[0];
  }, [cars, selectedCarId]);

  const normalizedExpenses = useMemo(() => {
    if (!activeCar || !Array.isArray(activeCar.expenses)) return [];

    const items = activeCar.expenses.map((exp) => ({
      ...exp,
      numericCost: parseFlexibleDecimal(exp.cost),
      numericLiters: parseFlexibleDecimal(exp.liters),
      numericKm: parseFlexibleKm(exp.km)
    }));

    const fuelAscending = items
      .filter((e) => e.type === 'fuel' && e.numericKm > 0)
      .sort((a, b) => a.numericKm - b.numericKm);

    const consumptionById = {};
    for (let i = 0; i < fuelAscending.length; i++) {
      const current = fuelAscending[i];
      if (i === 0) {
        consumptionById[current.id] = {
          consumptionPer100: 0,
          costPer100: 0,
          deltaKm: 0,
          isBaseline: true
        };
      } else {
        const prev = fuelAscending[i - 1];
        const deltaKm = current.numericKm - prev.numericKm;
        if (deltaKm > 0 && current.numericLiters > 0) {
          const cons100 = (current.numericLiters / deltaKm) * 100;
          const cost100 = (current.numericCost / deltaKm) * 100;
          consumptionById[current.id] = {
            consumptionPer100: cons100,
            costPer100: cost100,
            deltaKm,
            isBaseline: false
          };
        } else {
          consumptionById[current.id] = {
            consumptionPer100: 0,
            costPer100: 0,
            deltaKm: 0,
            isBaseline: false
          };
        }
      }
    }

    return items
      .sort((a, b) => b.numericKm - a.numericKm)
      .map((item) => {
        if (item.type === 'fuel' && consumptionById[item.id]) {
          return {
            ...item,
            calculatedConsumption: consumptionById[item.id].consumptionPer100,
            calculatedCostPer100: consumptionById[item.id].costPer100,
            deltaKm: consumptionById[item.id].deltaKm,
            isBaseline: consumptionById[item.id].isBaseline
          };
        }
        return item;
      });
  }, [activeCar]);

  const fuelStats = useMemo(() => {
    if (!activeCar) {
      return { avgLitersPer100: 0, avgEuroPer100: 0, validIntervalsCount: 0 };
    }

    const fuelAscending = normalizedExpenses
      .filter((e) => e.type === 'fuel' && e.numericKm > 0)
      .sort((a, b) => a.numericKm - b.numericKm);

    if (fuelAscending.length >= 2) {
      const firstKm = fuelAscending[0].numericKm;
      const lastKm = fuelAscending[fuelAscending.length - 1].numericKm;
      const totalDistance = lastKm - firstKm;

      if (totalDistance > 0) {
        let totalLitersAfterFirst = 0;
        let totalEurosAfterFirst = 0;
        for (let i = 1; i < fuelAscending.length; i++) {
          totalLitersAfterFirst += fuelAscending[i].numericLiters;
          totalEurosAfterFirst += fuelAscending[i].numericCost;
        }

        return {
          avgLitersPer100: (totalLitersAfterFirst / totalDistance) * 100,
          avgEuroPer100: (totalEurosAfterFirst / totalDistance) * 100,
          validIntervalsCount: fuelAscending.length - 1,
          totalDistance
        };
      }
    }

    return { avgLitersPer100: 0, avgEuroPer100: 0, validIntervalsCount: 0, totalDistance: 0 };
  }, [activeCar, normalizedExpenses]);

  const availableFuelsForSelection = useMemo(() => {
    const modelData = CAR_CATALOG[newCarBrand]?.[newCarModel];
    if (modelData && modelData.fuels && modelData.fuels.length > 0) {
      return modelData.fuels;
    }
    return DEFAULT_FUELS;
  }, [newCarBrand, newCarModel]);

  const availableEnginesForSelection = useMemo(() => {
    const modelData = CAR_CATALOG[newCarBrand]?.[newCarModel];
    if (modelData && modelData.enginesByFuel) {
      const list = modelData.enginesByFuel[newCarFuel];
      if (list && list.length > 0) return list;
      const firstFuel = modelData.fuels?.[0];
      if (firstFuel && modelData.enginesByFuel[firstFuel]) {
        return modelData.enginesByFuel[firstFuel];
      }
    }
    return ['Motor Estándar'];
  }, [newCarBrand, newCarModel, newCarFuel]);

  const handleBrandChange = (brand) => {
    setNewCarBrand(brand);
    if (brand === '__custom__') {
      setNewCarModel('__custom__');
      setNewCarEngine('__custom__');
      return;
    }
    const models = Object.keys(CAR_CATALOG[brand] || {});
    const firstModel = models[0] || '';
    setNewCarModel(firstModel);
    const modelData = CAR_CATALOG[brand]?.[firstModel];
    if (modelData) {
      const firstFuel = modelData.fuels[0] || 'Gasolina';
      setNewCarFuel(firstFuel);
      const enginesForFuel = modelData.enginesByFuel?.[firstFuel] || [];
      setNewCarEngine(enginesForFuel[0] || '__custom__');
    }
  };

  const handleModelChange = (model) => {
    setNewCarModel(model);
    if (model === '__custom__') {
      setNewCarEngine('__custom__');
      return;
    }
    const modelData = CAR_CATALOG[newCarBrand]?.[model];
    if (modelData) {
      const nextFuel = modelData.fuels.includes(newCarFuel)
        ? newCarFuel
        : modelData.fuels[0] || 'Gasolina';
      setNewCarFuel(nextFuel);
      const enginesForFuel = modelData.enginesByFuel?.[nextFuel] || [];
      setNewCarEngine(enginesForFuel[0] || '__custom__');
    }
  };

  const handleFuelChange = (fuel) => {
    setNewCarFuel(fuel);
    if (newCarBrand === '__custom__' || newCarModel === '__custom__') {
      setNewCarEngine('__custom__');
      return;
    }
    const modelData = CAR_CATALOG[newCarBrand]?.[newCarModel];
    if (modelData && modelData.enginesByFuel?.[fuel]) {
      const enginesForFuel = modelData.enginesByFuel[fuel];
      setNewCarEngine(enginesForFuel[0] || '__custom__');
    } else {
      setNewCarEngine('__custom__');
    }
  };

  const handleCreateCar = (e) => {
    e.preventDefault();
    const initialKm = parseFlexibleKm(newCarKm);
    if (!initialKm || initialKm <= 0) return;

    const finalBrand = newCarBrand === '__custom__' ? (customBrand.trim() || 'Otra Marca') : newCarBrand;
    const finalModel = newCarModel === '__custom__' ? (customModel.trim() || 'Otro Modelo') : newCarModel;
    const finalEngine = newCarEngine === '__custom__' ? (customEngine.trim() || 'Estándar') : newCarEngine;

    const newCarObj = {
      id: 'car_' + Date.now(),
      alias: newCarAlias.trim() || `${finalBrand} ${finalModel}`,
      brand: finalBrand,
      model: finalModel,
      engine: finalEngine,
      fuel: newCarFuel,
      regMonth: newCarMonth,
      regYear: newCarYear,
      km: initialKm,
      batteryKwh: newCarFuel === 'Eléctrico' ? parseFlexibleDecimal(newCarBatteryKwh) || 60 : null,
      maintenances: [
        {
          id: 'oil',
          name: 'Cambiar el aceite del motor',
          icon: '🛢️',
          lastKm: initialKm,
          intervalKm: 15000,
          purpose: 'Sirve para que el motor esté bien lubricado y no se caliente ni se rompa.',
          notes: []
        }
      ],
      expenses: []
    };

    setCars((prev) => [...prev, newCarObj]);
    setSelectedCarId(newCarObj.id);
    setIsAddCarModalOpen(false);
    setIsCarDropdownOpen(false);
    setNewCarAlias('');
    setNewCarKm('');
    setCustomBrand('');
    setCustomModel('');
    setCustomEngine('');
  };

  const openExpenseModal = (type, expenseToEdit = null) => {
    if (!activeCar) return;
    setExpenseModalType(type);

    if (expenseToEdit) {
      setEditingExpenseId(expenseToEdit.id);
      setExpCost(String(expenseToEdit.numericCost).replace('.', ','));
      setExpLiters(expenseToEdit.numericLiters ? String(expenseToEdit.numericLiters).replace('.', ',') : '');
      setExpKm(String(expenseToEdit.numericKm));
      setExpDate(expenseToEdit.rawIsoDate || spanishDateToIso(expenseToEdit.date));
      if (type === 'workshop') {
        setWorkshopPresetId(expenseToEdit.presetId || 'oil');
        setWorkshopWho(expenseToEdit.who || 'taller');
        setWorkshopNote(expenseToEdit.note || '');
      }
    } else {
      setEditingExpenseId(null);
      setExpCost('');
      setExpLiters('');
      setExpKm(String(activeCar.km));
      setExpDate(getTodayIso());
      setWorkshopPresetId('oil');
      setWorkshopWho('taller');
      setWorkshopNote('');
    }
  };

  const handleCostChange = (rawVal) => {
    const cleaned = rawVal.replace(/[^0-9.,]/g, '');
    setExpCost(cleaned);

    if (expenseModalType === 'fuel' && activeCar?.fuel !== 'Eléctrico' && !editingExpenseId) {
      const euros = parseFlexibleDecimal(cleaned);
      if (euros > 0) {
        const estPricePerLiter =
          activeCar?.fuel === 'GLP'
            ? 0.95
            : activeCar?.fuel === 'Diésel'
            ? 1.45
            : 1.58;
        const estimatedLiters = (euros / estPricePerLiter).toFixed(2).replace('.', ',');
        setExpLiters(estimatedLiters);
      } else {
        setExpLiters('');
      }
    }
  };

  const handleLitersChange = (rawVal) => {
    const cleaned = rawVal.replace(/[^0-9.,]/g, '');
    setExpLiters(cleaned);
  };

  const handleKmInputChange = (rawVal) => {
    const cleaned = rawVal.replace(/[^0-9.,]/g, '');
    setExpKm(cleaned);
  };

  const liveFuelPreview = useMemo(() => {
    if (!activeCar || expenseModalType !== 'fuel') return null;

    const inputCost = parseFlexibleDecimal(expCost);
    const inputKm = parseFlexibleKm(expKm);
    let inputLiters = parseFlexibleDecimal(expLiters);

    if (activeCar.fuel === 'Eléctrico') {
      const cap = activeCar.batteryKwh || 60;
      const arr = parseFlexibleDecimal(evPercentArrival);
      const dep = parseFlexibleDecimal(evPercentDeparture);
      inputLiters = Math.max(0, ((dep - arr) / 100) * cap);
    }

    const previousFuels = normalizedExpenses
      .filter((e) => e.type === 'fuel' && e.id !== editingExpenseId && e.numericKm < inputKm)
      .sort((a, b) => b.numericKm - a.numericKm);

    const prevFuel = previousFuels[0];
    if (!prevFuel) {
      return {
        isFirstFuel: true,
        inputLiters,
        inputCost,
        inputKm
      };
    }

    const deltaKm = inputKm - prevFuel.numericKm;
    if (deltaKm <= 0 || inputLiters <= 0) return null;

    const litersPer100 = (inputLiters / deltaKm) * 100;
    const euroPer100 = (inputCost / deltaKm) * 100;

    return {
      isFirstFuel: false,
      deltaKm,
      litersPer100,
      euroPer100,
      prevKm: prevFuel.numericKm
    };
  }, [
    activeCar,
    expenseModalType,
    expCost,
    expLiters,
    expKm,
    evPercentArrival,
    evPercentDeparture,
    normalizedExpenses,
    editingExpenseId
  ]);

  const handleSaveExpense = (e) => {
    e.preventDefault();
    if (!activeCar) return;

    const costNum = parseFlexibleDecimal(expCost);
    const kmNum = parseFlexibleKm(expKm) || activeCar.km;
    const formattedSpanishDate = isoToSpanishDate(expDate);

    if (costNum <= 0 || kmNum <= 0) return;

    if (expenseModalType === 'fuel') {
      let litersNum = parseFlexibleDecimal(expLiters);
      if (activeCar.fuel === 'Eléctrico') {
        const cap = activeCar.batteryKwh || 60;
        const arr = parseFlexibleDecimal(evPercentArrival);
        const dep = parseFlexibleDecimal(evPercentDeparture);
        litersNum = Math.max(0, Number((((dep - arr) / 100) * cap).toFixed(2)));
      }

      const newExpenseObj = {
        id: editingExpenseId || 'exp_' + Date.now(),
        type: 'fuel',
        title: activeCar.fuel === 'Eléctrico' ? `Recarga (${evChargePlace === 'casa' ? 'En Casa' : 'Fuera'})` : 'Repostaje',
        cost: costNum,
        liters: litersNum,
        km: kmNum,
        date: formattedSpanishDate,
        rawIsoDate: expDate
      };

      setCars((prevCars) =>
        prevCars.map((car) => {
          if (car.id !== activeCar.id) return car;
          const updatedExpenses = editingExpenseId
            ? car.expenses.map((ex) => (ex.id === editingExpenseId ? newExpenseObj : ex))
            : [newExpenseObj, ...car.expenses];

          const highestKm = Math.max(
            car.km,
            kmNum,
            ...updatedExpenses.map((ex) => parseFlexibleKm(ex.km))
          );

          return {
            ...car,
            km: highestKm,
            expenses: updatedExpenses
          };
        })
      );
    } else if (expenseModalType === 'workshop') {
      const preset = MAINTENANCE_PRESETS.find((p) => p.id === workshopPresetId) || MAINTENANCE_PRESETS[0];

      const newExpenseObj = {
        id: editingExpenseId || 'exp_' + Date.now(),
        type: 'workshop',
        presetId: preset.id,
        title: preset.shortName,
        cost: costNum,
        liters: 0,
        km: kmNum,
        date: formattedSpanishDate,
        rawIsoDate: expDate,
        who: workshopWho,
        note: workshopNote.trim()
      };

      setCars((prevCars) =>
        prevCars.map((car) => {
          if (car.id !== activeCar.id) return car;

          const updatedExpenses = editingExpenseId
            ? car.expenses.map((ex) => (ex.id === editingExpenseId ? newExpenseObj : ex))
            : [newExpenseObj, ...car.expenses];

          const existingMaint = car.maintenances.find((m) => m.id === preset.id);
          let updatedMaintenances;

          const newNoteEntry = workshopNote.trim()
            ? [{ date: formattedSpanishDate, text: workshopNote.trim(), km: kmNum, who: workshopWho }]
            : [];

          if (existingMaint) {
            updatedMaintenances = car.maintenances.map((m) =>
              m.id === preset.id
                ? {
                    ...m,
                    lastKm: Math.max(m.lastKm, kmNum),
                    notes: [...newNoteEntry, ...(m.notes || [])]
                  }
                : m
            );
          } else {
            updatedMaintenances = [
              ...car.maintenances,
              {
                id: preset.id,
                name: preset.name,
                icon: preset.icon,
                lastKm: kmNum,
                intervalKm: preset.intervalKm,
                purpose: preset.purpose,
                notes: newNoteEntry
              }
            ];
          }

          const highestKm = Math.max(car.km, kmNum);

          return {
            ...car,
            km: highestKm,
            maintenances: updatedMaintenances,
            expenses: updatedExpenses
          };
        })
      );
    }

    setExpenseModalType(null);
    setEditingExpenseId(null);
  };

  const handleDeleteExpense = (expenseId) => {
    if (!activeCar) return;
    setCars((prevCars) =>
      prevCars.map((car) => {
        if (car.id !== activeCar.id) return car;
        const remaining = car.expenses.filter((e) => e.id !== expenseId);
        return {
          ...car,
          expenses: remaining
        };
      })
    );
  };

  const handleExportCSV = () => {
    if (!activeCar) return;
    const headers = ['Fecha', 'Tipo', 'Concepto', 'Kilometros', 'Litros_o_kWh', 'Consumo_100km', 'Euros'];
    const rows = normalizedExpenses.map((e) => [
      e.date,
      e.type === 'fuel' ? 'Combustible' : 'Taller',
      `"${e.title}"`,
      e.numericKm,
      String(e.numericLiters || 0).replace('.', ','),
      String((e.calculatedConsumption || 0).toFixed(2)).replace('.', ','),
      String(e.numericCost.toFixed(2)).replace('.', ',')
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gastos_${activeCar.alias.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!activeCar) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between max-w-md mx-auto shadow-2xl border-x border-slate-200">
        <div className="p-6 pt-12 flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-lg mb-6">
            <Car className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
            Tu garaje está a 0
          </h1>
          <p className="text-slate-600 text-base mb-8 max-w-xs leading-relaxed">
            Añade tu coche con los desplegables para llevar el control exacto del combustible, tus litros cada 100 km y los cambios de aceite.
          </p>
          <button
            onClick={() => setIsAddCarModalOpen(true)}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-lg rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-6 h-6" />
            <span>Añadir mi coche ahora</span>
          </button>
        </div>

        {isAddCarModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold text-slate-900">Añadir mi coche</h2>
                <button
                  onClick={() => setIsAddCarModalOpen(false)}
                  className="p-2 rounded-full bg-slate-100 text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCar} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Apodo de tu coche (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: forfi, Mi Fiesta..."
                    value={newCarAlias}
                    onChange={(e) => setNewCarAlias(e.target.value)}
                    className="w-full p-3.5 rounded-xl border-2 border-slate-200 font-semibold text-slate-900 focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">1. Marca</label>
                    <select
                      value={newCarBrand}
                      onChange={(e) => handleBrandChange(e.target.value)}
                      className="w-full p-3.5 rounded-xl border-2 border-slate-200 bg-white font-bold text-slate-900"
                    >
                      {Object.keys(CAR_CATALOG).map((brand) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                      <option value="__custom__">✏️ Otra marca...</option>
                    </select>
                    {newCarBrand === '__custom__' && (
                      <input
                        type="text"
                        required
                        placeholder="Escribe la marca..."
                        value={customBrand}
                        onChange={(e) => setCustomBrand(e.target.value)}
                        className="w-full mt-2 p-2.5 rounded-xl border-2 border-blue-400 text-sm font-bold text-slate-900"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">2. Modelo</label>
                    <select
                      value={newCarModel}
                      onChange={(e) => handleModelChange(e.target.value)}
                      className="w-full p-3.5 rounded-xl border-2 border-slate-200 bg-white font-bold text-slate-900"
                    >
                      {Object.keys(CAR_CATALOG[newCarBrand] || {}).map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                      <option value="__custom__">✏️ Otro modelo...</option>
                    </select>
                    {newCarModel === '__custom__' && (
                      <input
                        type="text"
                        required
                        placeholder="Escribe el modelo..."
                        value={customModel}
                        onChange={(e) => setCustomModel(e.target.value)}
                        className="w-full mt-2 p-2.5 rounded-xl border-2 border-blue-400 text-sm font-bold text-slate-900"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">3. Combustible</label>
                    <select
                      value={newCarFuel}
                      onChange={(e) => handleFuelChange(e.target.value)}
                      className="w-full p-3.5 rounded-xl border-2 border-slate-200 bg-white font-bold text-slate-900"
                    >
                      {availableFuelsForSelection.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">4. Motorización</label>
                    <select
                      value={newCarEngine}
                      onChange={(e) => setNewCarEngine(e.target.value)}
                      className="w-full p-3.5 rounded-xl border-2 border-slate-200 bg-white font-bold text-slate-900"
                    >
                      {availableEnginesForSelection.map((eng) => (
                        <option key={eng} value={eng}>{eng}</option>
                      ))}
                      <option value="__custom__">✏️ Otra motorización...</option>
                    </select>
                    {newCarEngine === '__custom__' && (
                      <input
                        type="text"
                        required
                        placeholder="Ej: 1.9 TDI 130cv"
                        value={customEngine}
                        onChange={(e) => setCustomEngine(e.target.value)}
                        className="w-full mt-2 p-2.5 rounded-xl border-2 border-blue-400 text-sm font-bold text-slate-900"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    5. Fecha de 1ª Matriculación
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={newCarMonth}
                      onChange={(e) => setNewCarMonth(e.target.value)}
                      className="w-full p-3.5 rounded-xl border-2 border-slate-200 bg-white font-bold text-slate-900"
                    >
                      {['01','02','03','04','05','06','07','08','09','10','11','12'].map((m) => (
                        <option key={m} value={m}>Mes {m}</option>
                      ))}
                    </select>
                    <select
                      value={newCarYear}
                      onChange={(e) => setNewCarYear(e.target.value)}
                      className="w-full p-3.5 rounded-xl border-2 border-slate-200 bg-white font-bold text-slate-900"
                    >
                      {Array.from({ length: 45 }, (_, i) => String(2026 - i)).map((y) => (
                        <option key={y} value={y}>Año {y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    6. Kilómetros actuales del marcador
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="Ej: 256.866 o 256866"
                    value={newCarKm}
                    onChange={(e) => setNewCarKm(e.target.value.replace(/[^0-9.,]/g, ''))}
                    className="w-full p-4 rounded-xl border-2 border-blue-400 bg-blue-50/40 font-extrabold text-xl text-slate-900 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg rounded-2xl shadow-lg"
                >
                  Guardar Coche
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  const displayCostValue =
    costUnitMode === '100km' ? fuelStats.avgEuroPer100 : fuelStats.avgEuroPer100 / 100;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 max-w-md mx-auto shadow-2xl border-x border-slate-200 pb-24 relative">
      <header className="bg-slate-900 text-white p-4 pt-5 rounded-b-3xl shadow-lg relative z-20">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setIsCarDropdownOpen(!isCarDropdownOpen)}
            className="flex-1 text-left bg-slate-800/90 hover:bg-slate-800 border border-slate-700 p-3 rounded-2xl transition flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  {activeCar.alias}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Cambiar ▾
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {formatKm(activeCar.km)} km • {activeCar.engine} ({activeCar.fuel})
              </p>
            </div>
          </button>

          <button
            onClick={() => setIsOptionsModalOpen(true)}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex flex-col items-center justify-center text-xs font-bold"
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span>Opciones</span>
          </button>
        </div>

        {isCarDropdownOpen && (
          <div className="mt-3 bg-slate-800 border border-slate-700 rounded-2xl p-2 space-y-1.5 shadow-2xl">
            {cars.map((car) => (
              <button
                key={car.id}
                onClick={() => {
                  setSelectedCarId(car.id);
                  setIsCarDropdownOpen(false);
                }}
                className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition ${
                  car.id === activeCar.id
                    ? 'bg-blue-600 text-white font-bold'
                    : 'hover:bg-slate-700 text-slate-200'
                }`}
              >
                <div>
                  <div className="text-sm font-bold">{car.alias}</div>
                  <div className="text-xs opacity-80">
                    {car.brand} {car.model} • {formatKm(car.km)} km
                  </div>
                </div>
                {car.id === activeCar.id && <CheckCircle2 className="w-5 h-5" />}
              </button>
            ))}

            <button
              onClick={() => {
                setIsCarDropdownOpen(false);
                setIsAddCarModalOpen(true);
              }}
              className="w-full p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 mt-2 shadow"
            >
              <Plus className="w-5 h-5" />
              <span>Añadir coche nuevo</span>
            </button>
          </div>
        )}
      </header>

      {activeTab === 'home' && (
        <main className="p-4 space-y-5">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                {activeCar.brand} {activeCar.model} • {activeCar.engine}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Matriculado en {activeCar.regMonth}/{activeCar.regYear} • Motor {activeCar.engine}
              </p>
            </div>
            <span className="text-2xl">🚗</span>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-5 shadow-xl">
            <div className="flex bg-slate-800/80 p-1 rounded-xl mb-4 border border-slate-700">
              <button
                onClick={() => setCostUnitMode('100km')}
                className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition ${
                  costUnitMode === '100km'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Gasto cada 100 km
              </button>
              <button
                onClick={() => setCostUnitMode('1km')}
                className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition ${
                  costUnitMode === '1km'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Gasto por 1 km
              </button>
            </div>

            <p className="text-xs text-slate-300 font-medium">
              Mover tu coche te cuesta de media:
            </p>
            <div className="text-3xl font-black tracking-tight mt-1 text-white">
              {formatEuro(displayCostValue)} €{' '}
              <span className="text-base font-bold text-blue-300">
                {costUnitMode === '100km' ? 'cada 100 km' : 'por cada 1 km'}
              </span>
            </div>

            <div className="mt-3 inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-300">
              <span>
                ⛽ Consumo real:{' '}
                {fuelStats.avgLitersPer100.toLocaleString('es-ES', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}{' '}
                {activeCar.fuel === 'Eléctrico' ? 'kWh' : 'Litros'} / 100 km
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                onClick={() => openExpenseModal('fuel')}
                className="py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
              >
                <Fuel className="w-5 h-5" />
                <span>{activeCar.fuel === 'Eléctrico' ? 'Apuntar Recarga' : 'Apuntar Gasolina'}</span>
              </button>

              <button
                onClick={() => openExpenseModal('workshop')}
                className="py-3.5 px-4 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-slate-950 font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
              >
                <Wrench className="w-5 h-5" />
                <span>Apuntar Taller</span>
              </button>
            </div>
          </div>

          <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>📅 Próximos cuidados de tu coche</span>
              </h2>
              <span className="text-xs font-bold text-slate-500">
                Kilometraje actual: {formatKm(activeCar.km)} km
              </span>
            </div>

            <div className="space-y-3">
              {activeCar.maintenances.map((item) => {
                const isBreakdown = item.id === 'breakdown' || item.intervalKm === 0;
                const nextDueKm = item.lastKm + (item.intervalKm || 0);
                const remainingKm = nextDueKm - activeCar.km;
                const remainingMonths = Math.max(1, Math.round(remainingKm / 1050));
                const isUrgent = !isBreakdown && remainingKm <= 1500;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border-2 transition ${
                      isBreakdown
                        ? 'border-amber-300 bg-amber-50/40'
                        : isUrgent
                        ? 'border-red-300 bg-red-50/50'
                        : 'border-emerald-200 bg-emerald-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm">
                            {item.name}
                          </h3>
                          {isBreakdown ? (
                            <p className="text-xs font-bold text-amber-900 mt-0.5">
                              Última avería registrada a los {formatKm(item.lastKm)} km
                            </p>
                          ) : (
                            <>
                              <p className="text-xs font-bold text-slate-700 mt-0.5">
                                {remainingKm > 0
                                  ? `Dentro de ${formatKm(remainingKm)} km (aprox. en ${remainingMonths} meses)`
                                  : `¡Toca cambiarlo ya! (Pasado por ${formatKm(Math.abs(remainingKm))} km)`}
                              </p>
                              <p className="text-xs text-slate-500">
                                Toca a los {formatKm(nextDueKm)} km
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-xs font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                          isBreakdown
                            ? 'bg-amber-600 text-white'
                            : isUrgent
                            ? 'bg-red-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isBreakdown ? 'Mantenimiento correctivo' : isUrgent ? 'Revisar pronto' : 'Todo en orden'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2.5 bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                      <strong>{isBreakdown ? '📌 Registro:' : '¿Para qué sirve?'}</strong> {item.purpose}
                    </p>

                    {item.notes && item.notes.length > 0 && (
                      <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-xl p-2.5 space-y-1">
                        <p className="text-[11px] font-extrabold uppercase text-amber-800">
                          {isBreakdown
                            ? '🩺 Qué le pasó y solución realizada:'
                            : '📝 Observaciones de veces anteriores:'}
                        </p>
                        {item.notes.map((n, idx) => (
                          <p key={idx} className="text-xs text-slate-800">
                            <span className="font-bold">“{n.date}”</span>
                            {n.km ? <span className="text-slate-500 font-semibold"> ({formatKm(n.km)} km)</span> : null} : “{n.text}”
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900">
                📒 Últimos gastos apuntados
              </h2>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Excel</span>
              </button>
            </div>

            {normalizedExpenses.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Aún no has apuntado ningún gasto. Pulsa en <strong>Apuntar Gasolina</strong> o <strong>Apuntar Taller</strong> arriba.
              </div>
            ) : (
              <div className="space-y-3">
                {normalizedExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg shrink-0 shadow-sm">
                        {exp.type === 'fuel' ? '⛽' : exp.presetId === 'breakdown' ? '🚨' : '🔧'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-slate-900 text-sm truncate">
                            {exp.title}
                          </p>
                        </div>
                        <p className="text-xs font-bold text-blue-700 mt-0.5">
                          📍 A los {formatKm(exp.numericKm)} km
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {exp.date}
                          {exp.type === 'fuel' && (
                            <>
                              {' • '}
                              {exp.numericLiters.toLocaleString('es-ES', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}{' '}
                              {activeCar.fuel === 'Eléctrico' ? 'kWh' : 'litros echados'}
                              {' • '}
                              {exp.isBaseline ? (
                                <span className="text-slate-600 font-semibold">
                                  1er repostaje base
                                </span>
                              ) : (
                                <span className="text-emerald-700 font-bold">
                                  Consumo:{' '}
                                  {exp.calculatedConsumption.toLocaleString('es-ES', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}{' '}
                                  {activeCar.fuel === 'Eléctrico' ? 'kWh' : 'L'}/100km
                                </span>
                              )}
                            </>
                          )}
                        </p>
                        {exp.note && (
                          <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg mt-1.5">
                            <strong>“{exp.date}”</strong> : “{exp.note}”
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1.5">
                      <span className="font-black text-base text-slate-900">
                        {formatEuro(exp.numericCost)} €
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openExpenseModal(exp.type, exp)}
                          title="Editar este apunte"
                          className="p-1.5 rounded-lg bg-white hover:bg-blue-50 text-slate-500 hover:text-blue-600 border border-slate-200 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          title="Borrar este apunte"
                          className="p-1.5 rounded-lg bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {expenseModalType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-slate-900">
                {editingExpenseId
                  ? 'Editar apunte'
                  : expenseModalType === 'fuel'
                  ? activeCar.fuel === 'Eléctrico'
                    ? '⚡ Apuntar Recarga'
                    : '⛽ Apuntar Gasolina'
                  : '🔧 Apuntar Taller'}
              </h2>
              <button
                onClick={() => {
                  setExpenseModalType(null);
                  setEditingExpenseId(null);
                }}
                className="p-2 rounded-full bg-slate-100 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4">
              {expenseModalType === 'workshop' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      1. ¿Qué mantenimiento le has hecho?
                    </label>
                    <select
                      value={workshopPresetId}
                      onChange={(e) => setWorkshopPresetId(e.target.value)}
                      className="w-full p-3.5 rounded-xl border-2 border-slate-200 bg-white font-bold text-slate-900"
                    >
                      {MAINTENANCE_PRESETS.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.icon} {preset.shortName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      2.{' '}
                      {workshopPresetId === 'itv'
                        ? '¿Quién ha llevado el vehículo?'
                        : '¿Quién lo ha realizado?'}
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setWorkshopWho('yo')}
                        className={`py-3 px-3 rounded-xl font-extrabold text-xs border-2 transition ${
                          workshopWho === 'yo'
                            ? 'border-blue-600 bg-blue-50 text-blue-800'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {workshopPresetId === 'itv'
                          ? '🚗 Lo he llevado yo'
                          : '🔨 Lo he hecho yo (DIY)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setWorkshopWho('taller')}
                        className={`py-3 px-3 rounded-xl font-extrabold text-xs border-2 transition ${
                          workshopWho === 'taller'
                            ? 'border-blue-600 bg-blue-50 text-blue-800'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        Lo he llevado al taller
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {expenseModalType === 'fuel'
                    ? '1. ¿Cuánto has pagado en total? (€)'
                    : '3. ¿Cuánto ha costado en total? (€)'}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  placeholder="Ej: 39,92 o 39.92"
                  value={expCost}
                  onChange={(e) => handleCostChange(e.target.value)}
                  className="w-full p-3.5 rounded-xl border-2 border-slate-300 font-extrabold text-lg text-slate-900 focus:border-blue-600 outline-none"
                />
              </div>

              {expenseModalType === 'fuel' && activeCar.fuel !== 'Eléctrico' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    2. ¿Cuántos litros has echado? (L)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    placeholder="Ej: 32,22 o 32.22"
                    value={expLiters}
                    onChange={(e) => handleLitersChange(e.target.value)}
                    className="w-full p-3.5 rounded-xl border-2 border-slate-300 font-extrabold text-lg text-slate-900 focus:border-blue-600 outline-none"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    {['20', '35', '45', '60'].map((presetL) => (
                      <button
                        key={presetL}
                        type="button"
                        onClick={() => setExpLiters(presetL)}
                        className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700"
                      >
                        {presetL} L
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {expenseModalType === 'fuel'
                    ? '3. Kilómetros que marca el coche en ese momento'
                    : '4. Kilómetros que marcaba el coche'}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="Ej: 257.453 o 257453"
                  value={expKm}
                  onChange={(e) => handleKmInputChange(e.target.value)}
                  className="w-full p-3.5 rounded-xl border-2 border-blue-400 bg-blue-50/40 font-extrabold text-lg text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>
                    {expenseModalType === 'fuel'
                      ? '4. ¿Qué día echaste gasolina?'
                      : '5. ¿En qué fecha se hizo el mantenimiento?'}
                  </span>
                </label>
                <input
                  type="date"
                  required
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full p-3.5 rounded-xl border-2 border-slate-300 bg-white font-extrabold text-base text-slate-900 focus:border-blue-600 outline-none"
                />
                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpDate(getTodayIso())}
                      className={`px-3 py-1 rounded-lg text-xs font-extrabold border transition ${
                        expDate === getTodayIso()
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      Hoy
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpDate(getYesterdayIso())}
                      className={`px-3 py-1 rounded-lg text-xs font-extrabold border transition ${
                        expDate === getYesterdayIso()
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      Ayer
                    </button>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    Se guardará como: <strong className="text-slate-800">{isoToSpanishDate(expDate)}</strong>
                  </span>
                </div>
              </div>

              {expenseModalType === 'fuel' && liveFuelPreview && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                  {liveFuelPreview.isFirstFuel ? (
                    <p className="font-bold">
                      ✅ Este repostaje servirá como punto de partida ({formatKm(liveFuelPreview.inputKm)} km) para calcular el consumo en el siguiente repostaje.
                    </p>
                  ) : (
                    <p className="font-bold">
                      ⛽ En estos <strong>{formatKm(liveFuelPreview.deltaKm)} km</strong> (desde los {formatKm(liveFuelPreview.prevKm)} km) tu coche ha consumido{' '}
                      <strong className="text-emerald-700">
                        {liveFuelPreview.litersPer100.toLocaleString('es-ES', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}{' '}
                        L/100km
                      </strong>{' '}
                      ({formatEuro(liveFuelPreview.euroPer100)} € cada 100 km).
                    </p>
                  )}
                </div>
              )}

              {expenseModalType === 'workshop' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    {workshopPresetId === 'breakdown'
                      ? '6. ¿Qué le pasó al coche y qué solución se ha realizado?'
                      : '6. Observaciones para acordarte la próxima vez (opcional)'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      workshopPresetId === 'breakdown'
                        ? 'Ej: Perdía fuerza en cuestas y salía fallo motor. Solución: Se cambió el tubo del turbo rajado y se limpió la EGR.'
                        : 'Ej: Puse aceite Total 5W30 y cambié filtro...'
                    }
                    value={workshopNote}
                    onChange={(e) => setWorkshopNote(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:border-blue-600 outline-none"
                  />
                  {workshopPresetId === 'breakdown' && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-lg mt-1.5">
                      💡 Apuntar aquí el síntoma y cómo se arregló te servirá de historial clínico del coche si vuelve a fallar en el futuro.
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base rounded-2xl shadow-lg"
              >
                {editingExpenseId ? 'Guardar Cambios' : 'Guardar Apunte'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isAddCarModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-slate-900">Añadir coche nuevo</h2>
              <button
                onClick={() => setIsAddCarModalOpen(false)}
                className="p-2 rounded-full bg-slate-100 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCar} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Apodo de tu coche (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: forfi, Coche nuevo..."
                  value={newCarAlias}
                  onChange={(e) => setNewCarAlias(e.target.value)}
                  className="w-full p-3.5 rounded-xl border-2 border-slate-200 font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">1. Marca</label>
                  <select
                    value={newCarBrand}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="w-full p-3.5 rounded-xl border-2 border-slate-200 bg-white font-bold"
                  >
                    {Object.keys(CAR_CATALOG).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="__custom__">✏️ Otra marca...</option>
                  </select>
                  {newCarBrand === '__custom__' && (
                    <input
                      type="text"
                      required
                      placeholder="Escribe la marca..."
                      value={customBrand}
                      onChange={(e) => setCustomBrand(e.target.value)}
                      className="w-full mt-2 p-2.5 rounded-xl border-2 border-blue-400 text-sm font-bold text-slate-900"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">2. Modelo</label>
                  <select
                    value={newCarModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full p-3.5 rounded-xl border-2 border-slate-200 bg-white font-bold"
                  >
                    {Object.keys(CAR_CATALOG[newCarBrand] || {}).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="__custom__">✏️ Otro modelo...</option>
                  </select>
                  {newCarModel === '__custom__' && (
                    <input
                      type="text"
                      required
                      placeholder="Escribe el modelo..."
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      className="w-full mt-2 p-2.5 rounded-xl border-2 border-blue-400 text-sm font-bold text-slate-900"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">3. Combustible</label>
                  <select
                    value={newCarFuel}
                    onChange={(e) => handleFuelChange(e.target.value)}
                    className="w-full p-3.5 rounded-xl border-2 border-slate-200 bg-white font-bold"
                  >
                    {availableFuelsForSelection.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">4. Motorización</label>
                  <select
                    value={newCarEngine}
                    onChange={(e) => setNewCarEngine(e.target.value)}
                    className="w-full p-3.5 rounded-xl border-2 border-slate-200 bg-white font-bold"
                  >
                    {availableEnginesForSelection.map((eng) => (
                      <option key={eng} value={eng}>{eng}</option>
                    ))}
                    <option value="__custom__">✏️ Otra motorización...</option>
                  </select>
                  {newCarEngine === '__custom__' && (
                    <input
                      type="text"
                      required
                      placeholder="Ej: 1.9 TDI 130cv"
                      value={customEngine}
                      onChange={(e) => setCustomEngine(e.target.value)}
                      className="w-full mt-2 p-2.5 rounded-xl border-2 border-blue-400 text-sm font-bold text-slate-900"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  5. Fecha de 1ª Matriculación
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newCarMonth}
                    onChange={(e) => setNewCarMonth(e.target.value)}
                    className="w-full p-3.5 rounded-xl border-2 border-slate-200 bg-white font-bold text-slate-900"
                  >
                    {['01','02','03','04','05','06','07','08','09','10','11','12'].map((m) => (
                      <option key={m} value={m}>Mes {m}</option>
                    ))}
                  </select>
                  <select
                    value={newCarYear}
                    onChange={(e) => setNewCarYear(e.target.value)}
                    className="w-full p-3.5 rounded-xl border-2 border-slate-200 bg-white font-bold text-slate-900"
                  >
                    {Array.from({ length: 45 }, (_, i) => String(2026 - i)).map((y) => (
                      <option key={y} value={y}>Año {y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  6. Kilómetros actuales
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="Ej: 257.453 o 257453"
                  value={newCarKm}
                  onChange={(e) => setNewCarKm(e.target.value.replace(/[^0-9.,]/g, ''))}
                  className="w-full p-3.5 rounded-xl border-2 border-blue-400 font-extrabold text-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg"
              >
                Guardar Coche
              </button>
            </form>
          </div>
        </div>
      )}

      {isOptionsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">⚙️ Opciones</h3>
              <button
                onClick={() => setIsOptionsModalOpen(false)}
                className="p-2 rounded-full bg-slate-100 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-extrabold text-slate-900">
                  🛠️ Modo Desarrollador
                </p>
                <p className="text-xs text-slate-500">
                  Mostrar las 3 pestañas de Comunidad
                </p>
              </div>
              <button
                onClick={() => {
                  const next = !showCommunityTabs;
                  setShowCommunityTabs(next);
                  if (!next) setActiveTab('home');
                }}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs ${
                  showCommunityTabs
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {showCommunityTabs ? 'Activado' : 'Oculto'}
              </button>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem('autovault_cars_v2');
                localStorage.removeItem('autovault_selected_card_v2');
                setCars([]);
                setSelectedCarId(null);
                setIsOptionsModalOpen(false);
              }}
              className="w-full py-3 px-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs flex items-center justify-center gap-2 border border-red-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Borrar datos y reiniciar app a 0</span>
            </button>
          </div>
        </div>
      )}

      {showCommunityTabs && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 px-2 py-2 flex justify-around z-30">
          {[
            { id: 'home', label: 'Mi Coche', icon: Car },
            { id: 'compare', label: 'Comparar', icon: BarChart3 },
            { id: 'showroom', label: 'Ver Coches', icon: Search },
            { id: 'help', label: 'Ayuda', icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-1 px-3 rounded-xl font-bold text-xs ${
                  isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}