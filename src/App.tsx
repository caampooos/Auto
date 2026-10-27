import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, runTransaction, setDoc } from 'firebase/firestore'
import { useEffect, useMemo, useRef, useState } from 'react'
import { db, firebaseAuth, firebaseReady } from './firebase'
import './App.css'

type UserProfile = {
  id: string
  name: string
  email: string
  avatar?: string
}

type DrivingProfile = 'city' | 'mixed' | 'highway'

type VehicleProfile = {
  id: string
  alias: string
  brand: string
  model: string
  year: string
  registrationDate?: string
  fuel: string
  engine: string
  odometer: number
  drivingProfile: DrivingProfile
  maintenanceIntervals: Record<string, number>
}

type VehicleActivity = {
  id: string
  vehicleId: string
  type: 'fuel' | 'workshop'
  title: string
  cost: number
  liters: number
  kwh?: number
  odometer: number
  date: string
  maintenanceId?: string
  breakdownType?: string
  notes?: string
  serviceMode?: 'diy' | 'workshop'
}

const RAW_BRAND_MODELS: Record<string, string[]> = {
  Abarth: ['500', '595', '695', '124 Spider', '500e'],
  'Alfa Romeo': ['Giulietta', 'MiTo', 'Giulia', 'Stelvio', 'Tonale', 'Junior', '147', '159', '147 GTA', '156', '166', 'Brera', 'Spider'],
  Alpine: ['A110', 'A290', 'A310'],
  'Aston Martin': ['Vantage', 'DB11', 'DB12', 'DBX', 'DB9', 'Rapide', 'Vanquish', 'One-77'],
  Audi: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q1', 'Q2', 'Q3', 'Q4 e-tron', 'Q4 Sportback e-tron', 'Q5', 'Q6 e-tron', 'Q7', 'Q8', 'TT', 'R8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'SQ5', 'SQ7', 'S3', 'S4', 'S5', 'S6', 'S7', 'e-tron', 'e-tron GT'],
  Bentley: ['Continental GT', 'Bentayga', 'Flying Spur', 'Mulsanne', 'Arnage', 'Continental Flying Spur', 'Batur'],
  BMW: ['Serie 1', 'Serie 2', 'Serie 3', 'Serie 4', 'Serie 5', 'Serie 6', 'Serie 7', 'M2', 'M3', 'M4', 'M5', 'M8', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'XM', 'Z4', 'i3', 'i4', 'i7', 'iX1', 'iX2', 'iX3', 'iX', 'iX5'],
  BYD: ['Atto 3', 'Dolphin', 'Seal', 'Seal U', 'Tang', 'Han', 'Song', 'Yuan Plus', 'Seagull'],
  Chevrolet: ['Aveo', 'Cruze', 'Captiva', 'Spark', 'Orlando', 'Camaro', 'Matiz', 'Corvette', 'Malibu', 'Impala', 'Volt', 'Bolt EV'],
  Chrysler: ['300C', 'Voyager', 'Grand Voyager', 'PT Cruiser', 'Sebring', 'Town & Country'],
  'Citroën': ['C1', 'C2', 'C3', 'C3 Aircross', 'C4', 'C4 Cactus', 'C4 Picasso', 'C5', 'C5 Aircross', 'C5 X', 'C6', 'Berlingo', 'Jumpy', 'Dispatch', 'SpaceTourer', 'Saxo', 'Xsara', 'C-Zero', 'e-C4', 'e-C3', 'e-C5'],
  Cupra: ['Formentor', 'León', 'Born', 'Ateca', 'Tavascan', 'Terramar', 'Ronda'],
  Dacia: ['Sandero', 'Sandero Stepway', 'Duster', 'Jogger', 'Spring', 'Logan', 'Lodgy', 'Dokker', 'Bigster', 'Nova', 'Lodgy', 'Duster 4x4'],
  Daewoo: ['Matiz', 'Kalos', 'Lanos', 'Nubira', 'Tacuma', 'Leganza'],
  Dodge: ['Caliber', 'Journey', 'Nitro', 'Avenger', 'Challenger', 'RAM', 'Durango', 'Viper'],
  DS: ['DS 3', 'DS 4', 'DS 7', 'DS 9', 'DS 5'],
  Evo: ['Evo3', 'Evo4', 'Evo5', 'Evo7', 'Evo9'],
  Ferrari: ['Roma', 'Portofino', 'F8 Tributo', '296 GTB', '488', '458 Italia', 'Purosangue', 'SF90', 'F40', 'F50', '599 GTB', '812 Superfast', 'Monza SP1'],
  Fiat: ['500', '500X', '500L', 'Panda', 'Tipo', 'Punto', 'Grande Punto', 'Bravo', 'Stilo', 'Doblò', '600', 'Doblo', 'Qubo', 'Ulysse', 'Scudo', 'Talento', 'Multipla', '124 Spider', '124', 'Fullback', 'E-Ulysse'],
  Ford: ['Fiesta', 'Focus', 'Kuga', 'Puma', 'Mondeo', 'EcoSport', 'C-Max', 'S-Max', 'Galaxy', 'Mustang', 'Mustang Mach-E', 'Ranger', 'Transit', 'Transit Custom', 'Transit Connect', 'Tourneo Custom', 'Tourneo Connect', 'Ka', 'Ka Plus', 'Capri', 'Explorer', 'Puma Gen-E'],
  Honda: ['Civic', 'CR-V', 'HR-V', 'Jazz', 'ZR-V', 'Accord', 'Honda e', 'City', 'BR-V', 'Element', 'Prelude', 'S2000', 'CR-Z', 'e:Ny1'],
  Hyundai: ['i10', 'i20', 'i30', 'Tucson', 'Kona', 'Santa Fe', 'Bayon', 'Ioniq', 'Ioniq 5', 'Ioniq 6', 'ix35', 'Getz', 'Creta', 'Staria', 'Staria Lounge', 'Palisade', 'Nexo', 'Elantra', 'Azera'],
  Infiniti: ['Q30', 'Q50', 'QX30', 'QX50', 'QX70', 'FX', 'Q60'],
  Isuzu: ['D-Max', 'Trooper', 'MU-X'],
  Jaecoo: ['Jaecoo 7', 'Jaecoo 8', 'Jaecoo 5'],
  Jaguar: ['XE', 'XF', 'XJ', 'F-Pace', 'E-Pace', 'I-Pace', 'F-Type', 'X-Type', 'S-Type'],
  Jeep: ['Avenger', 'Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Commander'],
  KGM: ['Tivoli', 'Korando', 'Torres', 'Rexton', 'Musso'],
  Kia: ['Picanto', 'Rio', 'Ceed', 'XCeed', 'ProCeed', 'Sportage', 'Stonic', 'Niro', 'Sorento', 'EV3', 'EV6', 'EV9', 'Carens', 'Carnival', 'Optima', 'Cerato', 'Sedona', 'K5', 'K8', 'Soul', 'EV5', 'Palisade'],
  Lada: ['Niva', '4x4', 'Priora', 'Vesta', 'Granta'],
  Lamborghini: ['Urus', 'Huracán', 'Revuelto', 'Aventador', 'Gallardo', 'Diablo', 'Murciélago', 'Countach'],
  Lancia: ['Ypsilon', 'Delta', 'Musa', 'Phedra', 'Voyager', 'Thema', 'Flavia'],
  'Land Rover': ['Range Rover Evoque', 'Range Rover Velar', 'Range Rover Sport', 'Range Rover', 'Defender', 'Discovery', 'Discovery Sport', 'Freelander', 'Series'],
  Leapmotor: ['T03', 'C10', 'C11'],
  Lexus: ['CT 200h', 'UX', 'NX', 'RX', 'LBX', 'IS', 'ES', 'RZ', 'LF-ZC', 'GX', 'LC'],
  LynkCo: ['01', '02'],
  Mahindra: ['KUV100', 'XUV500', 'Goa', 'Scorpio', 'Thar', 'Bolero'],
  Maserati: ['Ghibli', 'Grecale', 'Levante', 'Quattroporte', 'GranTurismo', 'Granturismo MC', 'Maserati 3200 GT'],
  Maxus: ['eDeliver 3', 'T90', 'Euniq 5', 'MIFA 9', 'D90'],
  Mazda: ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-60', 'CX-80', 'MX-5', 'MX-30', 'RX-8', 'RX-7', 'CX-7', 'CX-9', 'BT-50'],
  'Mercedes-Benz': ['Clase A', 'Clase B', 'Clase C', 'Clase E', 'Clase G', 'Clase S', 'CLA', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class', 'AMG GT', 'SL', 'SLC', 'Citan', 'Vito', 'Vito Tourer', 'Clase V', 'Sprinter', 'EQA', 'EQB', 'EQC', 'EQE', 'EQE SUV', 'EQS', 'EQS SUV'],
  MG: ['ZS', 'HS', 'MG3', 'MG4', 'MG5', 'Marvel R', 'Cyberster', 'One', '4', '5', 'EHS'],
  Mini: ['Cooper 3p / 5p', 'Countryman', 'Clubman', 'Cabrio', 'Aceman', 'Paceman', 'One', 'Cooper S'],
  Mitsubishi: ['ASX', 'Eclipse Cross', 'Outlander', 'Colt', 'Space Star', 'Montero', 'L200', 'Pajero', 'Lancer', 'Mirage'],
  Nissan: ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf', 'Ariya', 'Pulsar', 'Note', 'Almera', 'Primera', 'Navara', 'Terrano', 'GT-R', '350Z', '370Z', 'JUKE EV', 'Sentra', 'Sunny', 'Patrol', 'Murano'],
  Omoda: ['Omoda 5', 'Omoda 5 EV', 'Omoda 7'],
  Opel: ['Corsa', 'Astra', 'Mokka', 'Crossland', 'Grandland', 'Insignia', 'Zafira', 'Meriva', 'Vectra', 'Adam', 'Combo', 'Vivaro', 'Movano', 'Frontera', 'Karl', 'Omega', 'Signum', 'Cascada', 'Mokka Electric', 'Astra Electric'],
  Peugeot: ['106', '107', '108', '205', '206', '207', '208', '307', '308', '405', '406', '407', '408', '508', '2008', '3008', '4007', '5008', '508 SW', 'Rifter', 'Partner', 'Expert', 'Boxer', 'e-208', 'e-2008', 'e-308', 'e-408', 'C5 X'],
  Polestar: ['Polestar 2', 'Polestar 3', 'Polestar 4', 'Polestar 1'],
  Porsche: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', '718 Boxster', '718 Cayman', 'Carrera GT', '918 Spyder'],
  Renault: ['Clio', 'Mégane', 'Captur', 'Austral', 'Arkana', 'Kadjar', 'Scénic', 'Espace', 'Rafale', 'Symbioz', 'Twingo', 'Zoe', 'Renault 5', 'Kangoo', 'Laguna', 'Talisman', 'Koleos', 'Trafic', 'Master', 'Alpine A110', 'Megane RS'],
  Saab: ['9-3', '9-5', '900'],
  Seat: ['Ibiza', 'León', 'Arona', 'Ateca', 'Tarraco', 'Altea', 'Toledo', 'Alhambra', 'Mii', 'Córdoba', 'Exeo', 'Cupra Formentor', 'Cupra Leon', 'Cupra Born', 'Cupra Ateca', 'Cupra Tavascan'],
  'Škoda': ['Fabia', 'Scala', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq', 'Citigo', 'Yeti', 'Roomster', 'Rapid'],
  Smart: ['Fortwo', 'Forfour', '#1', '#3', 'Roadster'],
  SsangYong: ['Tivoli', 'Korando', 'Rexton', 'Rodius', 'Kyron', 'Actyon', 'Torres'],
  Subaru: ['XV', 'Crosstrek', 'Forester', 'Outback', 'Impreza', 'BRZ', 'Solterra', 'Legacy', 'WRX', 'STI'],
  Suzuki: ['Swift', 'Vitara', 'S-Cross', 'Ignis', 'Jimny', 'Across', 'Swace', 'SX4', 'Grand Vitara', 'Baleno'],
  SWM: ['G01', 'G01F', 'G03F', 'G05'],
  Tata: ['Indica', 'Vista', 'Aria', 'Xenon', 'Harrier', 'Safari', 'Punch', 'Nexon'],
  Tesla: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Roadster', 'Cybertruck'],
  Toyota: ['Yaris', 'Yaris Cross', 'Corolla', 'Corolla Cross', 'C-HR', 'RAV4', 'Auris', 'Avensis', 'Aygo', 'Aygo X', 'Prius', 'Prius Plus', 'Land Cruiser', 'Hilux', 'Hilux Revo', 'Supra', 'Proace', 'Proace City', 'Proace Verso', 'bZ4X', 'GR86', 'GR Yaris', 'Camry'],
  Volkswagen: ['Polo', 'Up!', 'Golf', 'Golf GTI', 'Golf R', 'T-Roc', 'T-Cross', 'Taigo', 'Tiguan', 'Tiguan Allspace', 'Touareg', 'Passat', 'Passat Variant', 'Arteon', 'Touran', 'Sharan', 'Caddy', 'Multivan', 'California', 'Transporter', 'Amarok', 'Scirocco', 'ID.3', 'ID.4', 'ID.5', 'ID.7', 'ID. Buzz', 'ID. Buzz Cargo', 'Transporter / Multivan'],
  Volvo: ['XC40', 'XC60', 'XC90', 'EX30', 'EX90', 'C40', 'S40', 'S60', 'S90', 'V40', 'V60', 'V90', 'C30', 'V70', 'V50'],
  XPeng: ['G6', 'G9', 'P7', 'P5', 'G3'],
}

const SPECIFIC_MODEL_POWERTRAINS: Record<string, Record<string, Record<string, string[]>>> = {
  Ferrari: {
    '488': { Gasolina: ['3.9 V8 Biturbo 670cv (GTB / Spider)', '3.9 V8 Biturbo 720cv (Pista)'] },
    '458 Italia': { Gasolina: ['4.5 V8 Atmosférico 570cv (Italia / Spider)', '4.5 V8 Atmosférico 605cv (Speciale)'] },
    'F8 Tributo': { Gasolina: ['3.9 V8 Biturbo 720cv'] },
    Roma: { Gasolina: ['3.9 V8 Biturbo 620cv'] },
    Portofino: { Gasolina: ['3.9 V8 Biturbo 600cv', '3.9 V8 Biturbo 620cv (Portofino M)'] },
    '296 GTB': { 'Híbrido Enchufable': ['3.0 V6 Biturbo PHEV 830cv'] },
    Purosangue: { Gasolina: ['6.5 V12 Atmosférico 725cv'] },
  },
  Lamborghini: {
    Huracán: { Gasolina: ['5.2 V10 Atmosférico 610cv (LP610-4)', '5.2 V10 Atmosférico 640cv (EVO / STO / Tecnica)'] },
    Aventador: { Gasolina: ['6.5 V12 Atmosférico 700cv (LP700-4)', '6.5 V12 Atmosférico 740cv (S)', '6.5 V12 Atmosférico 770cv (SVJ)'] },
    Gallardo: { Gasolina: ['5.0 V10 500cv', '5.2 V10 560cv (LP560-4)'] },
    Urus: {
      Gasolina: ['4.0 V8 Biturbo 650cv', '4.0 V8 Biturbo 666cv (S / Performante)'],
      'Híbrido Enchufable': ['4.0 V8 Biturbo PHEV 800cv (Urus SE)'],
    },
    Revuelto: { 'Híbrido Enchufable': ['6.5 V12 PHEV 1015cv'] },
  },
  Porsche: {
    '911': {
      Gasolina: ['3.0 Bóxer Biturbo 385cv (Carrera)', '3.0 Bóxer Biturbo 450cv (Carrera S)', '4.0 Bóxer Atmosférico 510cv (GT3)', '3.8 Bóxer Biturbo 650cv (Turbo S)'],
      Híbrido: ['3.6 Bóxer T-Hybrid 541cv (Carrera GTS)'],
    },
    Taycan: { Eléctrico: ['408cv Performance Battery (79 kWh)', '490cv Taycan 4S', '680cv Taycan Turbo', '761cv Taycan Turbo S'] },
    '718 Boxster': { Gasolina: ['2.0 Bóxer Turbo 300cv', '2.5 Bóxer Turbo 350cv (S)', '4.0 Bóxer 400cv (GTS 4.0)'] },
    '718 Cayman': { Gasolina: ['2.0 Bóxer Turbo 300cv', '2.5 Bóxer Turbo 350cv (S)', '4.0 Bóxer 420cv (GT4)', '4.0 Bóxer 500cv (GT4 RS)'] },
    Cayenne: {
      Gasolina: ['3.0 V6 Turbo 353cv', '4.0 V8 Biturbo 474cv (S)', '4.0 V8 Biturbo 659cv (Turbo GT)'],
      'Híbrido Enchufable': ['3.0 V6 E-Hybrid 470cv', '4.0 V8 Turbo E-Hybrid 739cv'],
      Diésel: ['3.0 V6 TDI 245cv / 262cv', '4.2 V8 TDI 385cv (S Diesel)'],
    },
    Macan: {
      Gasolina: ['2.0 Turbo 265cv', '2.9 V6 Biturbo 380cv (S)', '2.9 V6 Biturbo 440cv (GTS)'],
      Diésel: ['3.0 V6 TDI 258cv (S Diesel)'],
      Eléctrico: ['Macan 4 Eléctrico 408cv (100 kWh)', 'Macan Turbo Eléctrico 639cv (100 kWh)'],
    },
  },
  Ford: {
    Fiesta: {
      Diésel: ['1.6 TDCi 90cv', '1.4 TDCi 68cv / 70cv', '1.5 TDCi 75cv / 85cv', '1.6 TDCi 95cv', '1.8 TDCi 75cv'],
      Gasolina: ['1.25 82cv', '1.4 16v 80cv / 96cv', '1.0 EcoBoost 100cv', '1.0 EcoBoost 125cv', '1.6 Ti-VCT 120cv', '1.6 EcoBoost 182cv (ST)', '1.5 EcoBoost 200cv (ST)'],
      Híbrido: ['1.0 EcoBoost MHEV 125cv', '1.0 EcoBoost MHEV 155cv'],
      GLP: ['1.4 GLP 92cv', '1.1 Ti-VCT GLP 75cv', '1.0 EcoBoost GLP 100cv'],
    },
    Focus: {
      Diésel: ['1.6 TDCi 90cv / 109cv / 115cv', '1.5 EcoBlue 120cv', '1.8 TDCi 115cv', '2.0 TDCi 136cv / 150cv / 185cv (ST)'],
      Gasolina: ['1.0 EcoBoost 100cv / 125cv', '1.5 EcoBoost 150cv / 182cv', '1.6 16v 100cv / 115cv', '2.3 EcoBoost 280cv (ST)', '2.3 EcoBoost 350cv (RS)'],
      Híbrido: ['1.0 EcoBoost MHEV 125cv', '1.0 EcoBoost MHEV 155cv'],
      GLP: ['1.6 Ti-VCT GLP 117cv', '1.4 GLP 90cv'],
    },
    Kuga: {
      Diésel: ['2.0 TDCi 140cv / 150cv / 180cv', '1.5 EcoBlue 120cv', '2.0 EcoBlue 190cv'],
      Gasolina: ['1.5 EcoBoost 120cv / 150cv'],
      Híbrido: ['2.5 Duratec FHEV 180cv / 190cv'],
      'Híbrido Enchufable': ['2.5 Duratec PHEV 225cv / 243cv'],
      GLP: ['1.5 EcoBoost GLP 150cv'],
    },
    Mustang: { Gasolina: ['5.0 V8 Ti-VCT 450cv (GT)', '5.0 V8 460cv (Mach 1 / Dark Horse)', '2.3 EcoBoost 290cv / 317cv'] },
    'Mustang Mach-E': { Eléctrico: ['RWD Rango Estándar 269cv (75 kWh)', 'RWD Gran Autonomía 294cv (98 kWh)', 'AWD Gran Autonomía 351cv (98 kWh)', 'GT AWD 487cv (98 kWh)'] },
  },
  Toyota: {
    Corolla: {
      Híbrido: ['1.8 Hybrid 122cv (125H)', '1.8 Hybrid 140cv (140H)', '2.0 Hybrid 184cv (180H)', '2.0 Hybrid 196cv (200H)'],
      Gasolina: ['1.2 Turbo 116cv', '1.6 VVT-i 110cv / 132cv', '1.6 Turbo 300cv (GR Corolla)'],
      Diésel: ['1.4 D-4D 90cv', '2.0 D-4D 116cv / 126cv'],
      GLP: ['1.8 Hybrid GLP 122cv / 140cv', '1.6 VVT-i GLP 110cv'],
    },
    Yaris: {
      Híbrido: ['1.5 Hybrid 100cv (100H)', '1.5 Hybrid 116cv (120H)', '1.5 Hybrid 130cv (130H)'],
      Gasolina: ['1.0 VVT-i 69cv / 72cv', '1.33 VVT-i 100cv', '1.5 VVT-i 111cv / 125cv', '1.6 Turbo 261cv / 280cv (GR Yaris)'],
      Diésel: ['1.4 D-4D 75cv / 90cv'],
      GLP: ['1.0 / 1.5 VVT-i GLP'],
    },
    RAV4: {
      Híbrido: ['2.5 Hybrid 218cv 4x2 (220H)', '2.5 Hybrid 222cv AWD-i (220H)', '2.5 Hybrid 197cv (200H)'],
      'Híbrido Enchufable': ['2.5 Plug-in Hybrid 306cv AWD-i (300PH)'],
      Diésel: ['2.0 D-4D 124cv / 143cv', '2.2 D-4D 136cv / 150cv / 177cv'],
      Gasolina: ['2.0 VVT-i 150cv / 152cv'],
    },
    bZ4X: { Eléctrico: ['204cv 4x2 (71,4 kWh)', '218cv AWD 4x4 (71,4 kWh)'] },
  },
  Tesla: {
    'Model 3': { Eléctrico: ['Tracción Trasera RWD 283cv (60 kWh)', 'Gran Autonomía AWD 351cv / 498cv (75 kWh)', 'Performance AWD 460cv / 513cv (75 kWh)'] },
    'Model Y': { Eléctrico: ['Tracción Trasera RWD 299cv (60 kWh)', 'Gran Autonomía RWD / AWD 347cv / 514cv (75 kWh)', 'Performance AWD 534cv (75 kWh)'] },
    'Model S': { Eléctrico: ['Dual Motor AWD 670cv (100 kWh)', 'Plaid Tri-Motor 1020cv (100 kWh)', '85D / 90D / 100D (367cv - 612cv)'] },
    'Model X': { Eléctrico: ['Dual Motor AWD 670cv (100 kWh)', 'Plaid Tri-Motor 1020cv (100 kWh)', '90D / 100D (422cv - 612cv)'] },
  },
  Seat: {
    Ibiza: {
      Gasolina: ['1.0 MPI 80cv', '1.0 TSI 95cv', '1.0 TSI 110cv / 115cv', '1.5 TSI 150cv', '1.2 TSI 90cv / 105cv', '1.4 16v 75cv / 85cv / 100cv'],
      Diésel: ['1.4 TDI 70cv / 80cv / 90cv', '1.6 TDI 90cv / 95cv / 105cv', '1.9 TDI 100cv / 105cv / 130cv'],
      GNC: ['1.0 TGI 90cv (Gas Natural)'],
      GLP: ['1.4 16v GLP 85cv', '1.6 GLP 105cv', '1.0 TSI GLP 95cv'],
    },
    León: {
      Diésel: ['1.6 TDI 90cv / 105cv / 115cv', '1.9 TDI 105cv / 110cv / 150cv (FR)', '2.0 TDI 115cv', '2.0 TDI 140cv / 150cv / 184cv (FR)'],
      Gasolina: ['1.0 TSI 110cv', '1.2 TSI 105cv / 110cv', '1.4 TSI 122cv / 125cv / 150cv', '1.5 TSI 130cv / 150cv', '2.0 TSI 190cv / 290cv / 300cv (Cupra)'],
      Híbrido: ['1.0 eTSI MHEV 110cv', '1.5 eTSI MHEV 115cv / 150cv'],
      'Híbrido Enchufable': ['1.4 e-Hybrid PHEV 204cv', '1.5 e-Hybrid PHEV 204cv'],
      GNC: ['1.4 TGI 110cv', '1.5 TGI 130cv'],
      GLP: ['1.6 GLP 102cv', '1.4 TSI GLP 125cv'],
    },
  },
}

const buildLogicalPowertrains = (brand: string, modelName: string): Record<string, string[]> => {
  if (SPECIFIC_MODEL_POWERTRAINS[brand]?.[modelName]) {
    return SPECIFIC_MODEL_POWERTRAINS[brand][modelName]
  }

  const lowerModel = modelName.toLowerCase()
  const isElectricModel = /\b(e-tron|id\.3|id\.4|id\.5|id\.7|taycan|born|tavascan|ioniq 5|ioniq 6|ev3|ev6|ev9|zoe|spring|leaf|ariya|enyaq|bz4x|mustang mach-e|500e|honda e|i-pace|eqa|eqb|eqc|eqe|i3|i4|ix1|ix3|ex30|ex90|aceman|mg4|marvel r|cyberster|atto 3|dolphin|t03|edeliver 3|solterra|rz|a290|renault 5|c10|e-c4|e-c3|e-c5)\b/i.test(modelName)

  if (isElectricModel || ['Tesla', 'Polestar', 'XPeng'].includes(brand)) {
    return {
      Eléctrico: ['Eléctrico Rango Estándar (150 kW / 204cv)', 'Eléctrico Gran Autonomía (210 kW / 286cv)', 'Eléctrico Dual Motor AWD (300 kW / 408cv)'],
    }
  }

  if (brand === 'Aston Martin') {
    return { Gasolina: ['4.0 V8 Biturbo 510cv / 535cv', '4.0 V8 Biturbo 665cv / 707cv (DBX707 / DB12)', '5.2 V12 Biturbo 608cv / 725cv', '4.7 V8 Atmosférico 426cv'] }
  }
  if (brand === 'Bentley') {
    return {
      Gasolina: ['4.0 V8 Biturbo 550cv', '6.0 W12 Biturbo 635cv / 659cv (Speed)'],
      'Híbrido Enchufable': ['3.0 V6 TFSI Hybrid 462cv', '4.0 V8 Ultra Performance Hybrid 782cv'],
      Diésel: ['4.0 V8 TDI Triple Turbo 435cv (Bentayga Diesel)'],
    }
  }
  if (brand === 'Alpine') {
    return { Gasolina: ['1.8 Turbo 252cv (A110)', '1.8 Turbo 300cv (A110 GT / S / R)'] }
  }
  if (brand === 'Maserati') {
    return {
      Gasolina: ['3.0 V6 Biturbo 350cv / 430cv', '3.0 V6 Nettuno 490cv / 530cv (Trofeo)', '3.8 V8 Biturbo 580cv (Trofeo)', '4.7 V8 Atmosférico 460cv'],
      Híbrido: ['2.0 Turbo MHEV 300cv / 330cv'],
      Diésel: ['3.0 V6 MultiJet 250cv / 275cv'],
      Eléctrico: ['Folgore Eléctrico AWD (550cv / 761cv)'],
    }
  }

  if (['Volkswagen', 'Audi', 'Seat', 'Škoda', 'Cupra'].includes(brand)) {
    const isSmall = /\b(a1|polo|ibiza|fabia|mii|citigo|arona|kamiq|t-cross|taigo|q2)\b/i.test(lowerModel)
    return {
      Diésel: isSmall ? ['1.4 TDI 75cv / 90cv', '1.6 TDI 90cv / 95cv / 105cv / 115cv', '1.9 TDI 100cv / 105cv / 130cv'] : ['1.6 TDI 105cv / 115cv', '1.9 TDI 105cv / 130cv', '2.0 TDI 115cv / 140cv / 150cv', '2.0 TDI 184cv / 190cv / 200cv', '3.0 V6 TDI 218cv / 245cv / 286cv'],
      Gasolina: isSmall ? ['1.0 MPI / TSI 80cv / 95cv', '1.0 TSI 110cv / 115cv', '1.2 TSI 90cv / 105cv', '1.4 16v 85cv', '1.5 TSI 150cv'] : ['1.0 TSI 110cv', '1.4 TSI 122cv / 125cv / 150cv', '1.5 TSI 130cv / 150cv', '1.8 TFSI / TSI 160cv / 180cv', '2.0 TFSI / TSI 190cv / 245cv / 300cv'],
      Híbrido: ['1.0 eTSI MHEV 110cv', '1.5 eTSI / TFSI MHEV 115cv / 150cv', '2.0 TDI / TFSI MHEV 163cv / 204cv'],
      'Híbrido Enchufable': ['1.4 e-Hybrid / TFSIe 204cv / 245cv', '1.5 e-Hybrid / TFSIe 204cv / 272cv'],
      GNC: ['1.0 TGI 90cv (GNC)', '1.4 / 1.5 TGI 110cv / 130cv (GNC)'],
      GLP: ['1.4 / 1.6 GLP 85cv / 102cv', '1.0 / 1.4 TSI GLP'],
    }
  }

  if (['Peugeot', 'Citroën', 'DS', 'Opel', 'Fiat', 'Alfa Romeo', 'Jeep', 'Lancia', 'Abarth'].includes(brand)) {
    if (brand === 'Abarth') {
      return {
        Gasolina: ['1.4 T-Jet 135cv / 145cv', '1.4 T-Jet 165cv (Turismo)', '1.4 T-Jet 180cv (Competizione / Esseesse)'],
        Eléctrico: ['Eléctrico 155cv (500e)', 'Eléctrico 240cv / 280cv (600e)'],
      }
    }
    if (brand === 'Peugeot' && modelName === '406') {
      return {
        Diésel: ['2.0 HDi 90cv / 110cv'],
        Gasolina: ['1.8 16v 110cv', '2.0 16v 136cv', '2.2 16v 158cv', '3.0 V6 194cv / 210cv'],
      }
    }
    return {
      Diésel: ['1.4 HDi / CDTi 68cv / 70cv', '1.5 BlueHDi / Diesel 100cv / 130cv', '1.6 HDi / BlueHDi / MultiJet / CDTi 90cv / 100cv / 110cv / 120cv', '1.9 / 2.0 HDi / BlueHDi / JTDm / CDTi 136cv / 150cv / 180cv', '2.2 MultiJet / BlueHDi 160cv / 210cv'],
      Gasolina: ['1.2 PureTech 82cv / 100cv / 110cv / 130cv', '1.4 16v / VTi / Turbo 75cv / 95cv / 120cv / 140cv', '1.6 VTi / THP / PureTech 120cv / 156cv / 180cv / 200cv', '2.0 Turbo 200cv / 280cv'],
      Híbrido: ['1.2 Hybrid MHEV 100cv e-DCS6', '1.2 Hybrid MHEV 136cv e-DCS6', '1.5 Hybrid MHEV 130cv / 160cv'],
      'Híbrido Enchufable': ['1.6 Plug-in Hybrid 180cv / 225cv', '1.6 Plug-in Hybrid AWD 300cv / 360cv', '1.3 4xe PHEV 190cv / 240cv'],
      GLP: ['1.2 / 1.4 GLP 69cv / 95cv / 120cv', '1.2 PureTech GLP 100cv'],
      Eléctrico: ['Eléctrico 100 kW / 136cv (50 kWh)', 'Eléctrico 115 kW / 156cv (54 kWh)'],
    }
  }

  if (['Renault', 'Dacia', 'Nissan', 'Mitsubishi'].includes(brand)) {
    return {
      Diésel: ['1.5 dCi 75cv / 85cv / 90cv / 105cv / 110cv', '1.5 Blue dCi 95cv / 115cv', '1.6 dCi 130cv / 160cv', '1.9 / 2.0 dCi 120cv / 130cv / 150cv / 175cv', '2.2 / 2.5 DI-D / dCi 136cv / 178cv / 190cv'],
      Gasolina: ['0.9 TCe / IG-T 90cv', '1.0 TCe / DIG-T 90cv / 100cv / 114cv', '1.2 16v / TCe / DIG-T 75cv / 115cv / 130cv', '1.3 TCe / DIG-T 130cv / 140cv / 160cv', '1.6 16v / DIG-T 110cv / 163cv / 200cv'],
      Híbrido: ['1.3 TCe Mild Hybrid 140cv / 158cv', '1.6 E-Tech Full Hybrid 140cv / 145cv', '1.2 E-Tech Full Hybrid 200cv', '1.5 e-POWER 190cv / 213cv'],
      'Híbrido Enchufable': ['1.6 E-Tech Plug-in Hybrid 160cv', '1.2 E-Tech 4x4 300cv', '2.4 PHEV 224cv / 252cv'],
      GLP: ['1.0 TCe ECO-G 100cv GLP (De fábrica)', '0.9 TCe GLP 90cv', '1.4 / 1.6 GLP 85cv / 110cv'],
    }
  }

  if (['BMW', 'Mini'].includes(brand)) {
    return {
      Diésel: ['116d / 216d / Cooper D 1.5 116cv', '118d / 318d / X1 sDrive18d 2.0 143cv / 150cv', '120d / 320d / 520d / X3 xDrive20d 2.0 163cv / 177cv / 184cv / 190cv', '330d / 530d / X5 xDrive30d 3.0 6L 231cv / 258cv / 286cv'],
      Gasolina: ['116i / 118i / Cooper 1.5 Turbo 109cv / 136cv / 140cv', '120i / 320i / Cooper S 2.0 Turbo 178cv / 184cv / 192cv', '330i / 430i 2.0 Turbo 245cv / 258cv', 'M135i / M240i / M340i / M3 306cv / 374cv / 510cv'],
      Híbrido: ['20d / 20i Mild Hybrid 48V 163cv / 170cv / 190cv', '30d / 40i Mild Hybrid 48V 286cv / 333cv'],
      'Híbrido Enchufable': ['225xe / X1 xDrive25e / Countryman SE 220cv / 245cv', '330e / 530e / X3 xDrive30e 292cv', 'X5 xDrive45e / 50e 394cv / 489cv'],
      Eléctrico: ['eDrive20 / Cooper E 184cv / 204cv', 'eDrive35 / eDrive40 286cv / 340cv', 'xDrive30 / M50 313cv / 544cv'],
    }
  }

  if (['Mercedes-Benz', 'Smart'].includes(brand)) {
    if (brand === 'Smart') {
      return {
        Gasolina: ['1.0 71cv (Fortwo / Forfour)', '0.9 Turbo 90cv / 109cv (Brabus)'],
        Diésel: ['0.8 cdi 45cv / 54cv'],
        Eléctrico: ['EQ Fortwo / Forfour 82cv (17,6 kWh)', '#1 / #3 Pro+ 272cv (66 kWh)', '#1 / #3 Brabus AWD 428cv'],
      }
    }
    return {
      Diésel: ['180 d (1.5 / 2.0 CDI) 109cv / 116cv', '200 d (2.0 / 2.1 CDI) 136cv / 150cv', '220 d (2.0 / 2.1 CDI) 170cv / 190cv / 194cv / 200cv', '250 d / 300 d 204cv / 245cv / 269cv', '350 d / 400 d 3.0 6L 258cv / 286cv / 330cv'],
      Gasolina: ['180 (1.3 / 1.6 Turbo) 122cv / 136cv', '200 (1.3 / 2.0 Turbo) 156cv / 163cv / 184cv', '250 / 300 2.0 Turbo 211cv / 224cv / 258cv', 'AMG 35 / 45 / 43 / 63 (306cv - 612cv)'],
      Híbrido: ['180 / 200 Mild Hybrid EQ Boost 136cv / 163cv / 204cv', '200 d / 220 d Mild Hybrid EQ Boost 163cv / 197cv'],
      'Híbrido Enchufable': ['250 e EQ Power 218cv', '300 e / 300 de EQ Power 306cv / 313cv / 320cv'],
      Eléctrico: ['250+ 190cv (66,5 kWh)', '300 / 350 4MATIC 228cv / 292cv'],
    }
  }

  return {
    Diésel: ['1.4 / 1.5 CRDi / TDCi / dCi 90cv / 115cv', '1.6 CRDi / TDCi / i-DTEC 115cv / 136cv', '2.0 CRDi / D / Skyactiv-D 140cv / 150cv / 185cv', '2.2 CRDi / i-DTEC / Skyactiv-D 150cv / 175cv / 200cv'],
    Gasolina: ['1.0 T-GDI / Turbo 100cv / 120cv', '1.2 / 1.4 MPI / VVT 84cv / 100cv', '1.5 T-GDI / VTEC / Skyactiv-G 120cv / 150cv / 160cv', '1.6 T-GDI / Turbo 150cv / 177cv / 204cv', '2.0 Skyactiv-G /Skyactiv-X / Turbo 150cv / 186cv / 245cv'],
    Híbrido: ['1.5 / 1.6 HEV Híbrido 141cv / 194cv', '1.6 T-GDI HEV Híbrido 215cv / 230cv', '2.0 e:HEV / Mild Hybrid 150cv / 184cv'],
    'Híbrido Enchufable': ['1.5 / 1.6 PHEV Enchufable 225cv / 252cv / 265cv', '2.0 / 2.5 PHEV Enchufable 306cv / 327cv / 455cv'],
    GLP: ['1.2 / 1.4 GLP 85cv / 100cv', '1.5 / 1.6 GLP 115cv / 140cv'],
    Eléctrico: ['Eléctrico Estándar (150 kW / 204cv)', 'Eléctrico Gran Autonomía (160 kW / 218cv)'],
  }
}

export const CAR_CATALOG = Object.keys(RAW_BRAND_MODELS)
  .sort((a, b) => a.localeCompare(b, 'es'))
  .reduce<Record<string, Record<string, { fuels: string[]; enginesByFuel: Record<string, string[]> }>>>(
    (acc, brand) => {
      acc[brand] = {}
      RAW_BRAND_MODELS[brand].forEach((modelName) => {
        const enginesByFuel = buildLogicalPowertrains(brand, modelName)
        const fuels = Object.keys(enginesByFuel)
        acc[brand][modelName] = { fuels, enginesByFuel }
      })
      return acc
    },
    {},
  )

const APP_CONFIG = {
  appName: 'AutoVault',
  bundleId: 'com.tuempresa.autovault',
  version: '1.0.0',
  platforms: ['iOS', 'Android'],
  requiredPermissions: ['Internet', 'Storage'],
}

const DRIVING_PROFILES: Record<DrivingProfile, { label: string; intervalFactor: number; guidance: string }> = {
  city: { label: 'Ciudad y trayectos cortos', intervalFactor: 0.8, guidance: 'Uso exigente: conviene revisar antes los intervalos orientativos.' },
  mixed: { label: 'Uso mixto', intervalFactor: 0.9, guidance: 'Adelanta ligeramente la revisión como margen preventivo.' },
  highway: { label: 'Carretera y autovía', intervalFactor: 1, guidance: 'No se amplían los intervalos del fabricante.' },
}

const MAINTENANCE_PRESETS = [
  { id: 'oil', label: 'Cambio de aceite y filtro', intervalKm: 15000, icon: '🛢️' },
  { id: 'brakes', label: 'Revisión / cambio de frenos', intervalKm: 40000, icon: '🛑' },
  { id: 'tires', label: 'Cambio de neumáticos', intervalKm: 40000, icon: '🛞' },
  { id: 'timing-belt', label: 'Correa de distribución', intervalKm: 100000, icon: '⚙️' },
  { id: 'battery', label: 'Batería', intervalKm: 60000, icon: '🔋' },
  { id: 'inspection', label: 'Revisión general', intervalKm: 20000, icon: '🧰' },
  { id: 'breakdown', label: 'Avería / reparación', intervalKm: 0, icon: '🚨' },
]

const BREAKDOWN_TYPES = ['Motor', 'Frenos', 'Neumáticos', 'Batería', 'Sistema eléctrico', 'Refrigeración', 'Transmisión', 'Otro']

const defaultMaintenanceIntervals = () => Object.fromEntries(
  MAINTENANCE_PRESETS.filter((preset) => preset.id !== 'breakdown').map((preset) => [preset.id, preset.intervalKm]),
)

function toUserProfile(firebaseUser: FirebaseUser): UserProfile {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario AutoVault',
    email: firebaseUser.email || '',
    avatar: firebaseUser.photoURL || undefined,
  }
}

function firebaseAuthErrorMessage(error: unknown): string {
  const code = error instanceof Error && 'code' in error ? String(error.code) : ''
  if (code === 'auth/email-already-in-use') return 'Ya existe una cuenta con ese correo.'
  if (code === 'auth/invalid-email') return 'El correo electrónico no es válido.'
  if (code === 'auth/weak-password') return 'La contraseña debe tener al menos 6 caracteres.'
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') return 'Correo o contraseña incorrectos.'
  if (code === 'auth/popup-closed-by-user') return 'Se cerró la ventana de Google antes de completar el acceso.'
  if (code === 'auth/operation-not-allowed') return 'Activa este método de acceso en Firebase Authentication.'
  return 'No se pudo completar la autenticación. Revisa la configuración de Firebase.'
}

function stripUndefinedFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedFields(item)) as T
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const entries = Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, stripUndefinedFields(item)])
    return Object.fromEntries(entries) as T
  }
  return value
}

function readLegacyGarage(userId: string): { vehicles: VehicleProfile[]; activities: VehicleActivity[] } | null {
  try {
    const saved = localStorage.getItem(`autovault_initial_data_${userId}`)
    if (!saved) return null
    const garage = JSON.parse(saved) as {
      vehicles?: VehicleProfile[]
      activities?: VehicleActivity[]
      expenses?: VehicleActivity[]
      vehicle?: VehicleProfile
    }
    const vehicles = garage.vehicles || (garage.vehicle ? [{ ...garage.vehicle, id: garage.vehicle.id || `car_${userId}` }] : [])
    const activities = garage.expenses || garage.activities || []
    if (!Array.isArray(vehicles) || !Array.isArray(activities)) {
      console.error('Los datos locales antiguos del garaje tienen un formato no válido.')
      return null
    }
    return {
      vehicles: vehicles.map((item) => ({
        ...item,
        maintenanceIntervals: item.maintenanceIntervals || defaultMaintenanceIntervals(),
      })),
      activities,
    }
  } catch (legacyDataError) {
    console.error('No se pudieron leer los datos locales antiguos del garaje.', legacyDataError)
    return null
  }
}

function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true)
  const [showDirectRegistration, setShowDirectRegistration] = useState(false)
  const [directAuthMode, setDirectAuthMode] = useState<'signup' | 'login'>('signup')
  const [registrationDraft, setRegistrationDraft] = useState({ name: '', email: '', password: '' })
  const [user, setUser] = useState<UserProfile | null>(null)
  const [error, setError] = useState('')
  const [vehicles, setVehicles] = useState<VehicleProfile[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [activities, setActivities] = useState<VehicleActivity[]>([])
  const [cloudLoadedUserId, setCloudLoadedUserId] = useState('')
  const [cloudSaveStatus, setCloudSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [cloudSaveError, setCloudSaveError] = useState('')
  const cloudSaveQueue = useRef<Promise<void>>(Promise.resolve())
  const cloudSaveSequence = useRef(0)
  const [cloudSaveRetryToken, setCloudSaveRetryToken] = useState(0)
  const [isVehicleMenuOpen, setIsVehicleMenuOpen] = useState(false)
  const [isAddingVehicle, setIsAddingVehicle] = useState(false)
  const [isEditingVehicle, setIsEditingVehicle] = useState(false)
  const [activeTab, setActiveTab] = useState<'car' | 'history'>('car')
  const [costUnitMode, setCostUnitMode] = useState<'100km' | '1km'>('100km')
  const [activeEntryType, setActiveEntryType] = useState<VehicleActivity['type'] | null>(null)
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null)
  const [entryDraft, setEntryDraft] = useState({ title: '', cost: '', liters: '', odometer: '', date: new Date().toISOString().slice(0, 10), maintenanceId: 'oil', breakdownType: '', notes: '', serviceMode: 'workshop' as 'diy' | 'workshop' })
  const [vehicleDraft, setVehicleDraft] = useState({ alias: '', brand: 'Ford', model: 'Fiesta', year: '2006', registrationDate: '', fuel: 'Diésel', engine: '1.6 TDCi 90cv', odometer: '', drivingProfile: 'mixed' as DrivingProfile })

  const vehicle = vehicles.find((item) => item.id === selectedVehicleId) || vehicles[0] || null
  const vehicleActivities = activities.filter((activity) => activity.vehicleId === vehicle?.id)
  const modelOptions = Object.keys(CAR_CATALOG[vehicleDraft.brand] || {})
  const selectedModelData = CAR_CATALOG[vehicleDraft.brand]?.[vehicleDraft.model]
  const fuelOptions = selectedModelData?.fuels || ['Gasolina', 'Diésel', 'Híbrido', 'Híbrido Enchufable', 'Eléctrico', 'GLP', 'GNC']
  const engineOptions = selectedModelData?.enginesByFuel[vehicleDraft.fuel] || ['Motor estándar']

  useEffect(() => {
    const timerId = window.setTimeout(() => setIsSplashVisible(false), 1800)
    return () => window.clearTimeout(timerId)
  }, [])

  const fuelStats = useMemo(() => {
    if (!vehicle) return null
    const fuelRecords = vehicleActivities
      .filter((activity) => activity.type === 'fuel' && activity.odometer > 0)
      .sort((first, second) => first.odometer - second.odometer)
    if (fuelRecords.length < 2) return null

    const distance = fuelRecords[fuelRecords.length - 1].odometer - fuelRecords[0].odometer
    if (distance <= 0) return null
    const liters = fuelRecords.slice(1).reduce((total, record) => total + (record.kwh || record.liters), 0)
    const cost = fuelRecords.slice(1).reduce((total, record) => total + record.cost, 0)
    return { litersPer100: (liters / distance) * 100, costPer100: (cost / distance) * 100 }
  }, [vehicleActivities, vehicle])

  const fuelConsumptionByActivityId = useMemo(() => {
    const recordsByVehicle = new Map<string, VehicleActivity[]>()
    activities.filter((activity) => activity.type === 'fuel').forEach((activity) => {
      const vehicleRecords = recordsByVehicle.get(activity.vehicleId) || []
      vehicleRecords.push(activity)
      recordsByVehicle.set(activity.vehicleId, vehicleRecords)
    })

    const consumptionByActivityId = new Map<string, { consumption: number; trend: 'lower' | 'higher' | 'same' }>()
    recordsByVehicle.forEach((records) => {
      records.sort((first, second) => first.date.localeCompare(second.date) || first.odometer - second.odometer)
      let previousRecord: VehicleActivity | undefined
      let previousConsumption: number | undefined
      records.forEach((record) => {
        const quantity = record.kwh || record.liters
        if (previousRecord && quantity > 0 && Boolean(record.kwh) === Boolean(previousRecord.kwh)) {
          const distance = record.odometer - previousRecord.odometer
          if (distance > 0) {
            const consumption = (quantity / distance) * 100
            const trend = previousConsumption === undefined || consumption === previousConsumption
              ? 'same'
              : consumption < previousConsumption ? 'lower' : 'higher'
            consumptionByActivityId.set(record.id, { consumption, trend })
            previousConsumption = consumption
          }
        }
        previousRecord = record
      })
    })
    return consumptionByActivityId
  }, [activities])

  const enterWithProfile = async (firebaseUser: FirebaseUser) => {
    const profile = toUserProfile(firebaseUser)
    setCloudLoadedUserId('')
    setCloudSaveStatus('idle')
    setCloudSaveError('')
    setVehicles([])
    setSelectedVehicleId('')
    setActivities([])
    if (!db) {
      setError('Configura las variables VITE_FIREBASE_* para habilitar Cloud Firestore.')
      return
    }
    try {
      const userRef = doc(db, 'users', profile.id)
      const snapshot = await getDoc(userRef)
      if (firebaseAuth?.currentUser?.uid !== profile.id) return
      const legacyGarage = readLegacyGarage(profile.id)
      let savedVehicles: VehicleProfile[]
      let savedActivities: VehicleActivity[]
      if (snapshot.exists()) {
        const data = snapshot.data()
        const cloudVehicles = Array.isArray(data.vehicles) ? data.vehicles as VehicleProfile[] : []
        const cloudActivities = Array.isArray(data.expenses) ? data.expenses as VehicleActivity[] : []
        const shouldMigrateLocal = cloudVehicles.length === 0 && cloudActivities.length === 0 && legacyGarage !== null
        const sourceVehicles = shouldMigrateLocal ? legacyGarage?.vehicles || [] : cloudVehicles
        savedVehicles = sourceVehicles.map((item) => ({
          ...item,
          maintenanceIntervals: item.maintenanceIntervals || defaultMaintenanceIntervals(),
        }))
        savedActivities = shouldMigrateLocal ? legacyGarage?.activities || [] : cloudActivities
        if (shouldMigrateLocal) {
          console.info('Importando datos antiguos del garaje local a Cloud Firestore.')
          await setDoc(userRef, stripUndefinedFields({
            vehicles: savedVehicles,
            expenses: savedActivities,
            updatedAt: new Date().toISOString(),
          }), { merge: true })
        }
        savedVehicles = savedVehicles.map((item) => ({
          ...item,
          odometer: Math.max(item.odometer, ...savedActivities.filter((activity) => activity.vehicleId === item.id).map((activity) => activity.odometer)),
        }))
      } else {
        savedVehicles = legacyGarage?.vehicles || []
        savedActivities = legacyGarage?.activities || []
        await setDoc(userRef, stripUndefinedFields({
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          vehicles: savedVehicles,
          expenses: savedActivities,
          createdAt: new Date().toISOString(),
        }))
        if (firebaseAuth?.currentUser?.uid !== profile.id) return
        if (legacyGarage) console.info('Importando datos antiguos del garaje local a Cloud Firestore.')
      }
      setVehicles(savedVehicles)
      setSelectedVehicleId(savedVehicles[0]?.id || '')
      setActivities(savedActivities)
      setCloudLoadedUserId(profile.id)
      setUser(profile)
      setCloudSaveStatus('saved')
      setCloudSaveError('')
      setError('')
    } catch (firestoreError) {
      console.error('No se pudo cargar el garaje de Firestore.', firestoreError)
      const code = firestoreError instanceof Error && 'code' in firestoreError ? String(firestoreError.code) : ''
      setCloudSaveStatus('error')
      setCloudSaveError(code ? `Firestore rechazó la carga (${code}). Comprueba las reglas y la conexión.` : 'No se pudo conectar con Firestore. Comprueba la configuración y la conexión.')
      setError('No se pudieron cargar los datos del garaje desde Firestore. Comprueba las reglas de users/{userId} y vuelve a intentarlo.')
      setUser(null)
    }
  }

  useEffect(() => {
    if (!firebaseAuth) return
    return onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (firebaseUser) {
        void enterWithProfile(firebaseUser)
      } else {
        setUser(null)
        setCloudLoadedUserId('')
        setCloudSaveStatus('idle')
        setCloudSaveError('')
        setVehicles([])
        setSelectedVehicleId('')
        setActivities([])
      }
    })
  }, [])

  useEffect(() => {
    if (!user || cloudLoadedUserId !== user.id || !db) return
    const firestore = db
    const saveSequence = ++cloudSaveSequence.current
    const saveOperation = cloudSaveQueue.current
      .catch(() => undefined)
      .then(async () => {
        if (saveSequence === cloudSaveSequence.current) setCloudSaveStatus('saving')
        await setDoc(doc(firestore, 'users', user.id), stripUndefinedFields({
          vehicles,
          expenses: activities,
          updatedAt: new Date().toISOString(),
        }), { merge: true })
      })
      .then(() => {
        if (saveSequence === cloudSaveSequence.current) {
          setCloudSaveStatus('saved')
          setCloudSaveError('')
        }
      })
      .catch((firestoreError: unknown) => {
        console.error('No se pudieron guardar los cambios del garaje en Firestore.', firestoreError)
        if (saveSequence === cloudSaveSequence.current) {
          const code = firestoreError instanceof Error && 'code' in firestoreError ? String(firestoreError.code) : ''
          setCloudSaveStatus('error')
          setCloudSaveError(code ? `Firestore rechazó el guardado (${code}). Comprueba las reglas y la conexión.` : 'No se pudo confirmar el guardado en Firestore. Comprueba la configuración y la conexión.')
        }
      })
    cloudSaveQueue.current = saveOperation
  }, [vehicles, activities, user, cloudLoadedUserId, cloudSaveRetryToken])

  const saveCommunityStat = async (vehicle: VehicleProfile, activity: VehicleActivity) => {
    if (!db) return
    const brandModelEngine = `${vehicle.brand}_${vehicle.model}_${vehicle.engine}`.trim().toLocaleLowerCase()
    const communityDocId = encodeURIComponent(brandModelEngine)
    const communityRef = doc(db, 'community_stats', communityDocId)
    const isFuel = activity.type === 'fuel'
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(communityRef)
      const current = snapshot.exists() ? snapshot.data() : {}
      const incremented = (field: string, amount: number) => (typeof current[field] === 'number' ? current[field] as number : 0) + amount
      transaction.set(communityRef, {
        marca_modelo_motor: brandModelEngine,
        brand: vehicle.brand,
        model: vehicle.model,
        engine: vehicle.engine,
        ...(isFuel ? {
          fuelCount: incremented('fuelCount', 1),
          fuelLitersTotal: incremented('fuelLitersTotal', activity.liters),
          fuelKwhTotal: incremented('fuelKwhTotal', activity.kwh || 0),
          fuelCostLitersTotal: incremented('fuelCostLitersTotal', activity.kwh ? 0 : activity.cost),
          fuelCostKwhTotal: incremented('fuelCostKwhTotal', activity.kwh ? activity.cost : 0),
        } : {
          workshopCount: incremented('workshopCount', 1),
          workshopCostTotal: incremented('workshopCostTotal', activity.cost),
        }),
        updatedAt: new Date().toISOString(),
      }, { merge: true })
    })
  }

  const saveCommunityStatSafely = (vehicle: VehicleProfile, activity: VehicleActivity) => {
    void saveCommunityStat(vehicle, activity).catch((communityError: unknown) => {
      console.error('No se pudo actualizar la estadística comunitaria anónima.', communityError)
      setError('El registro se guardó en tu garaje, pero no se pudo actualizar la estadística comunitaria.')
    })
  }

  const updateCommunityStat = async (vehicle: VehicleProfile, previous: VehicleActivity, next?: VehicleActivity) => {
    if (!db) return
    const brandModelEngine = `${vehicle.brand}_${vehicle.model}_${vehicle.engine}`.trim().toLocaleLowerCase()
    const communityRef = doc(db, 'community_stats', encodeURIComponent(brandModelEngine))
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(communityRef)
      const current = snapshot.exists() ? snapshot.data() : {}
      if (!snapshot.exists() && next) {
        transaction.set(communityRef, {
          marca_modelo_motor: brandModelEngine,
          brand: vehicle.brand,
          model: vehicle.model,
          engine: vehicle.engine,
          ...(previous.type === 'fuel' ? {
            fuelCount: 1,
            fuelLitersTotal: next.liters,
            fuelKwhTotal: next.kwh || 0,
            fuelCostLitersTotal: next.kwh ? 0 : next.cost,
            fuelCostKwhTotal: next.kwh ? next.cost : 0,
          } : {
            workshopCount: 1,
            workshopCostTotal: next.cost,
          }),
          updatedAt: new Date().toISOString(),
        }, { merge: true })
        return
      }
      if (!snapshot.exists()) return
      const updated: Record<string, string | number> = {
        marca_modelo_motor: brandModelEngine,
        brand: vehicle.brand,
        model: vehicle.model,
        engine: vehicle.engine,
        updatedAt: new Date().toISOString(),
      }
      if (previous.type === 'fuel') {
        const delta = next ? 0 : -1
        updated.fuelCount = Math.max(0, (Number(current.fuelCount) || 0) + delta)
        updated.fuelLitersTotal = Math.max(0, (Number(current.fuelLitersTotal) || 0) + (next?.liters || 0) - previous.liters)
        updated.fuelKwhTotal = Math.max(0, (Number(current.fuelKwhTotal) || 0) + (next?.kwh || 0) - (previous.kwh || 0))
        updated.fuelCostLitersTotal = Math.max(0, (Number(current.fuelCostLitersTotal) || 0) + (next?.kwh ? 0 : next?.cost || 0) - (previous.kwh ? 0 : previous.cost))
        updated.fuelCostKwhTotal = Math.max(0, (Number(current.fuelCostKwhTotal) || 0) + (next?.kwh ? next.cost : 0) - (previous.kwh ? previous.cost : 0))
      } else {
        updated.workshopCount = Math.max(0, (Number(current.workshopCount) || 0) - (next ? 0 : 1))
        updated.workshopCostTotal = Math.max(0, (Number(current.workshopCostTotal) || 0) + (next?.cost || 0) - previous.cost)
      }
      transaction.set(communityRef, updated, { merge: true })
    })
  }

  const handleGoogleSignIn = async () => {
    if (!firebaseAuth) {
      setError('Configura las variables VITE_FIREBASE_* para habilitar el acceso.')
      return
    }

    try {
      const result = await signInWithPopup(firebaseAuth, new GoogleAuthProvider())
      void result
    } catch (authError) {
      setError(firebaseAuthErrorMessage(authError))
    }
  }

  const handleDirectAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = registrationDraft.name.trim()
    const email = registrationDraft.email.trim().toLowerCase()
    const password = registrationDraft.password
    if (!firebaseAuth) {
      setError('Configura las variables VITE_FIREBASE_* para habilitar el acceso.')
      return
    }

    try {
      const credential = directAuthMode === 'signup'
        ? await createUserWithEmailAndPassword(firebaseAuth, email, password)
        : await signInWithEmailAndPassword(firebaseAuth, email, password)
      if (directAuthMode === 'signup' && name) await updateProfile(credential.user, { displayName: name })
      setShowDirectRegistration(false)
      setRegistrationDraft({ name: '', email: '', password: '' })
    } catch (authError) {
      setError(firebaseAuthErrorMessage(authError))
    }
  }

  const handleSaveInitialData = () => {
    const odometer = Number(vehicleDraft.odometer)
    if (odometer <= 0 || !vehicleDraft.registrationDate) {
      setError('Completa los datos del coche, incluida la fecha de matriculación y un kilometraje válido.')
      return
    }

    try {
      const newVehicle: VehicleProfile = {
        id: `car_${Date.now()}`,
        ...vehicleDraft,
        alias: vehicleDraft.alias.trim() || `Mi coche (${vehicleDraft.brand} ${vehicleDraft.model})`,
        odometer,
        maintenanceIntervals: defaultMaintenanceIntervals(),
      }
      setVehicles((current) => [...current, newVehicle])
      setSelectedVehicleId(newVehicle.id)
      setActiveTab('car')
      setError('')
    } catch {
      setError('No se pudieron guardar los datos en este dispositivo.')
    }
  }

  const handleBrandChange = (brand: string) => {
    const models = Object.keys(CAR_CATALOG[brand] || {})
    const model = models[0] || ''
    const data = CAR_CATALOG[brand]?.[model]
    const fuel = data?.fuels[0] || 'Gasolina'
    setVehicleDraft((current) => ({
      ...current,
      brand,
      model,
      fuel,
      engine: data?.enginesByFuel[fuel]?.[0] || 'Motor estándar',
    }))
  }

  const handleModelChange = (model: string) => {
    const data = CAR_CATALOG[vehicleDraft.brand]?.[model]
    const fuel = data?.fuels[0] || 'Gasolina'
    setVehicleDraft((current) => ({
      ...current,
      model,
      fuel,
      engine: data?.enginesByFuel[fuel]?.[0] || 'Motor estándar',
    }))
  }

  const startAddingVehicle = () => {
    setVehicleDraft({ alias: '', brand: 'Ford', model: 'Fiesta', year: '2006', registrationDate: '', fuel: 'Diésel', engine: '1.6 TDCi 90cv', odometer: '', drivingProfile: 'mixed' })
    setIsVehicleMenuOpen(false)
    setIsAddingVehicle(true)
    setError('')
  }

  const handleAddVehicle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const odometer = Number(vehicleDraft.odometer)
    if (odometer <= 0 || !vehicleDraft.registrationDate) {
      setError('Añade una fecha de matriculación y un kilometraje válido para el coche.')
      return
    }

    const newVehicle: VehicleProfile = {
      id: `car_${Date.now()}`,
      ...vehicleDraft,
      alias: vehicleDraft.alias.trim() || `Mi coche (${vehicleDraft.brand} ${vehicleDraft.model})`,
      odometer,
      maintenanceIntervals: defaultMaintenanceIntervals(),
    }
    const nextVehicles = [...vehicles, newVehicle]
    setVehicles(nextVehicles)
    setSelectedVehicleId(newVehicle.id)
    setIsAddingVehicle(false)
    setActiveTab('car')
    setError('')
  }

  const openVehicleEditor = () => {
    if (!vehicle) return
    setVehicleDraft({
      alias: vehicle.alias,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      registrationDate: vehicle.registrationDate || '',
      fuel: vehicle.fuel,
      engine: vehicle.engine,
      odometer: String(vehicle.odometer),
      drivingProfile: vehicle.drivingProfile,
    })
    setIsEditingVehicle(true)
    setError('')
  }

  const handleEditVehicle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!vehicle) return
    const odometer = Number(vehicleDraft.odometer)
    if (odometer <= 0 || !vehicleDraft.registrationDate) {
      setError('Indica una fecha de matriculación y un kilometraje válido.')
      return
    }
    setVehicles((current) => current.map((item) => item.id === vehicle.id ? {
      ...item,
      ...vehicleDraft,
      alias: vehicleDraft.alias.trim() || `Mi coche (${vehicleDraft.brand} ${vehicleDraft.model})`,
      odometer,
    } : item))
    setIsEditingVehicle(false)
    setError('')
  }

  const handleDeleteVehicle = () => {
    if (!vehicle) return
    const vehicleActivitiesToDelete = activities.filter((activity) => activity.vehicleId === vehicle.id)
    const confirmed = window.confirm(`¿Eliminar "${vehicle.alias}" y sus ${vehicleActivitiesToDelete.length} registros? Esta acción no se puede deshacer.`)
    if (!confirmed) return
    setVehicles((current) => current.filter((item) => item.id !== vehicle.id))
    setActivities((current) => current.filter((item) => item.vehicleId !== vehicle.id))
    setSelectedVehicleId(vehicles.find((item) => item.id !== vehicle.id)?.id || '')
    setIsVehicleMenuOpen(false)
    vehicleActivitiesToDelete.forEach((activity) => {
      void updateCommunityStat(vehicle, activity).catch((communityError: unknown) => {
        console.error('No se pudo retirar el registro eliminado de las estadísticas comunitarias.', communityError)
        setError('El coche se eliminó del garaje, pero las estadísticas comunitarias no pudieron actualizarse.')
      })
    })
    setError('')
  }

  const handleDeleteActivity = (activity: VehicleActivity) => {
    const confirmed = window.confirm(`¿Eliminar "${activity.title}" del historial? Esta acción no se puede deshacer.`)
    if (!confirmed) return
    setActivities((current) => current.filter((item) => item.id !== activity.id))
    const activityVehicle = vehicles.find((item) => item.id === activity.vehicleId)
    if (activityVehicle) {
      const remainingOdometers = activities
        .filter((item) => item.vehicleId === activity.vehicleId && item.id !== activity.id)
        .map((item) => item.odometer)
      const otherVehicleRecords = activities.some((item) => item.vehicleId === activity.vehicleId && item.id !== activity.id)
      setVehicles((current) => current.map((item) => item.id === activity.vehicleId && otherVehicleRecords
        ? { ...item, odometer: Math.max(item.odometer, ...remainingOdometers) }
        : item))
      void updateCommunityStat(activityVehicle, activity).catch((communityError: unknown) => {
        console.error('No se pudo retirar el registro eliminado de las estadísticas comunitarias.', communityError)
        setError('El registro se eliminó del historial, pero las estadísticas comunitarias no pudieron actualizarse.')
      })
    }
    setError('')
  }

  const handleDrivingProfileChange = (drivingProfile: DrivingProfile) => {
    if (!vehicle) return
    const nextVehicles = vehicles.map((item) => item.id === vehicle.id ? { ...item, drivingProfile } : item)
    setVehicles(nextVehicles)
  }

  const openEntryForm = (type: VehicleActivity['type']) => {
    setEditingActivityId(null)
    setActiveEntryType(type)
    setEntryDraft({
      title: '',
      cost: '',
      liters: '',
      odometer: vehicle ? String(vehicle.odometer) : '',
      date: new Date().toISOString().slice(0, 10),
      maintenanceId: 'oil',
      breakdownType: '',
      notes: '',
      serviceMode: 'workshop',
    })
  }

  const openActivityForEdit = (activity: VehicleActivity) => {
    setEditingActivityId(activity.id)
    setSelectedVehicleId(activity.vehicleId)
    setActiveEntryType(activity.type)
    setEntryDraft({
      title: activity.title,
      cost: String(activity.cost),
      liters: String(activity.kwh || activity.liters || ''),
      odometer: String(activity.odometer),
      date: activity.date,
      maintenanceId: activity.maintenanceId || 'oil',
      breakdownType: activity.breakdownType || '',
      notes: activity.notes || '',
      serviceMode: activity.serviceMode || 'workshop',
    })
    setError('')
  }

  const handleSaveActivity = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeEntryType) return
    const previousActivity = editingActivityId ? activities.find((activity) => activity.id === editingActivityId) : undefined
    const activityVehicle = vehicles.find((item) => item.id === previousActivity?.vehicleId) || vehicle
    if (!activityVehicle) return

    const cost = Number(entryDraft.cost.replace(',', '.'))
    const liters = activeEntryType === 'fuel' ? Number(entryDraft.liters.replace(',', '.')) : 0
    const odometer = Number(entryDraft.odometer)
    const selectedMaintenance = MAINTENANCE_PRESETS.find((preset) => preset.id === entryDraft.maintenanceId)
    const isBreakdown = activeEntryType === 'workshop' && entryDraft.maintenanceId === 'breakdown'
    if (cost <= 0 || odometer <= 0 || (activeEntryType === 'fuel' && liters <= 0) || (isBreakdown && !entryDraft.notes.trim()) || (isBreakdown && !entryDraft.breakdownType)) {
      setError(activeEntryType === 'workshop' ? 'Selecciona el trabajo y completa las observaciones.' : 'Revisa el importe, el kilometraje y los litros.')
      return
    }

    const activity: VehicleActivity = {
      id: previousActivity?.id || `activity_${Date.now()}`,
      vehicleId: activityVehicle.id,
      type: activeEntryType,
      title: activeEntryType === 'fuel' ? entryDraft.title.trim() || 'Repostaje' : isBreakdown ? `Avería: ${entryDraft.breakdownType}` : selectedMaintenance?.label || 'Mantenimiento',
      cost,
      liters: activeEntryType === 'fuel' && !/eléctrico/i.test(activityVehicle.fuel) ? liters : 0,
      ...(activeEntryType === 'fuel' && /eléctrico/i.test(activityVehicle.fuel) ? { kwh: liters } : {}),
      odometer,
      date: entryDraft.date,
      maintenanceId: activeEntryType === 'workshop' ? entryDraft.maintenanceId : undefined,
      breakdownType: isBreakdown ? entryDraft.breakdownType : undefined,
      notes: activeEntryType === 'workshop' ? entryDraft.notes.trim() : undefined,
      serviceMode: activeEntryType === 'workshop' ? entryDraft.serviceMode : undefined,
    }
    const nextActivities = previousActivity
      ? activities.map((item) => item.id === previousActivity.id ? activity : item)
      : [activity, ...activities]
    const vehicleActivityOdometers = nextActivities
      .filter((item) => item.vehicleId === activityVehicle.id)
      .map((item) => item.odometer)
    const nextVehicle = {
      ...activityVehicle,
      odometer: Math.max(activityVehicle.odometer, odometer, ...vehicleActivityOdometers),
    }
    setActivities(nextActivities)
    setVehicles((current) => current.map((item) => item.id === activityVehicle.id ? nextVehicle : item))
    if (previousActivity) {
      void updateCommunityStat(activityVehicle, previousActivity, activity).catch((communityError: unknown) => {
        console.error('No se pudo corregir la estadística comunitaria tras editar el registro.', communityError)
        setError('El historial se actualizó, pero no se pudo corregir la estadística comunitaria.')
      })
    } else {
      saveCommunityStatSafely(nextVehicle, activity)
    }
    setEditingActivityId(null)
    setActiveEntryType(null)
    setError('')
  }

  const handleSignOut = async () => {
    if (firebaseAuth) {
      try {
        await firebaseSignOut(firebaseAuth)
      } catch {
        setError('No se pudo cerrar la sesión de Firebase.')
        return
      }
    }
    setUser(null)
    setCloudLoadedUserId('')
    setVehicles([])
    setSelectedVehicleId('')
    setActivities([])
  }

  if (isSplashVisible) {
    return (
      <main className="splash-screen" aria-label="AutoVault está iniciando">
        <img src="/autovault-lockup.svg" className="splash-lockup" alt="AutoVault" />
        <span className="splash-loader" aria-hidden="true" />
      </main>
    )
  }

  if (!user) {
    return (
      <main className="app-shell">
        <section className="app-card">
          <div className="login-brand"><img src="/autovault-mark.svg" alt="" /><span>Acceso a AutoVault</span></div>

          <div className="info-block">
            <span className="badge">{APP_CONFIG.version}</span>
            <span className="badge muted">{APP_CONFIG.platforms.join(' / ')}</span>
          </div>

          <div className="login-panel">
            <h2>{showDirectRegistration ? 'Crear perfil' : 'Accede a tu garaje'}</h2>
            <p>Guarda los datos de tus coches y lleva el control del mantenimiento.</p>

            {showDirectRegistration ? (
              <form className="direct-registration" onSubmit={handleDirectAuth}>
                {!firebaseReady && <div className="warning-box auth-setup-warning"><strong>Firebase todavía no está configurado.</strong><p>Añade las variables VITE_FIREBASE_* en el entorno local o en Vercel y vuelve a iniciar/desplegar la app.</p></div>}
                {directAuthMode === 'signup' && <label>Nombre<input required autoComplete="name" value={registrationDraft.name} onChange={(event) => setRegistrationDraft({ ...registrationDraft, name: event.target.value })} placeholder="Tu nombre" /></label>}
                <label>Correo electrónico<input required type="email" autoComplete="email" value={registrationDraft.email} onChange={(event) => setRegistrationDraft({ ...registrationDraft, email: event.target.value })} placeholder="nombre@correo.com" /></label>
                <label>Contraseña<input required type="password" minLength={6} autoComplete={directAuthMode === 'signup' ? 'new-password' : 'current-password'} value={registrationDraft.password} onChange={(event) => setRegistrationDraft({ ...registrationDraft, password: event.target.value })} placeholder="Mínimo 6 caracteres" /></label>
                <p className="local-profile-note">La cuenta y los datos del garaje se sincronizan con Firebase Cloud Firestore.</p>
                {error && <div className="error-box">{error}</div>}
                <button type="submit" className="primary-button" disabled={!firebaseReady}>{directAuthMode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión'}</button>
                <button type="button" className="text-button registration-back" onClick={() => { setDirectAuthMode(directAuthMode === 'signup' ? 'login' : 'signup'); setError('') }}>{directAuthMode === 'signup' ? 'Ya tengo una cuenta' : 'Crear una cuenta nueva'}</button>
                <button type="button" className="text-button registration-back" onClick={() => { setShowDirectRegistration(false); setError('') }}>Volver a los métodos de acceso</button>
              </form>
            ) : (
              <>
                {firebaseReady ? (
                  <button type="button" className="google-auth-button" onClick={handleGoogleSignIn}><span aria-hidden="true">G</span>Continuar con Google</button>
                ) : (
                  <div className="warning-box"><strong>Autenticación sin configurar.</strong><p>Añade la configuración web de Firebase en las variables VITE_FIREBASE_* para habilitar Google y correo.</p></div>
                )}
                <button type="button" className="registration-button" onClick={() => { setDirectAuthMode('signup'); setShowDirectRegistration(true); setError('') }}>Crear cuenta con correo</button>
              </>
            )}
          </div>

          {error && !showDirectRegistration && <div className="error-box">{error}</div>}

          <div className="store-panel">
            <h3>Preparación para App Store y Play Store</h3>
            <ul>
              <li>Bundle ID: {APP_CONFIG.bundleId}</li>
              <li>Permisos: {APP_CONFIG.requiredPermissions.join(', ')}</li>
              <li>Plataformas: {APP_CONFIG.platforms.join(', ')}</li>
            </ul>
          </div>
        </section>
      </main>
    )
  }

  if (!vehicle) {
    return (
      <main className="app-shell app-shell--dashboard">
        <section className="dashboard-frame setup-frame">
          <header className="dashboard-topbar">
            <div className="brand-row"><img src="/autovault-mark.svg" className="app-mark-image" alt="" /><div><p className="eyebrow">Configuración inicial</p><h1>Tu coche</h1></div></div>
            <button type="button" className="text-button" onClick={handleSignOut}>Salir</button>
          </header>
          <div className={`cloud-save-status cloud-save-status--${cloudSaveStatus}`} role="status">
            <span>{cloudSaveStatus === 'saving' ? 'Guardando cambios en la base de datos de AutoVault Garage…' : cloudSaveStatus === 'saved' ? 'Guardado en la base de datos de AutoVault Garage.' : cloudSaveStatus === 'error' ? cloudSaveError || 'No se pudieron guardar los datos en la base de datos de AutoVault Garage.' : 'Conectando con la base de datos de AutoVault Garage…'}</span>
            {cloudSaveStatus === 'error' && <button type="button" onClick={() => setCloudSaveRetryToken((token) => token + 1)}>Reintentar</button>}
          </div>

          <form className="setup-form" onSubmit={(event) => { event.preventDefault(); handleSaveInitialData() }}>
            <section className="setup-section">
              <p className="section-kicker">01 / Vehículo</p>
              <h2>Empieza por tu coche</h2>
              <div className="form-grid">
                <label>Apodo (opcional)<input value={vehicleDraft.alias} onChange={(event) => setVehicleDraft({ ...vehicleDraft, alias: event.target.value })} placeholder={`Mi coche (${vehicleDraft.brand} ${vehicleDraft.model})`} /></label>
                <label>Marca<select value={vehicleDraft.brand} onChange={(event) => handleBrandChange(event.target.value)}>{Object.keys(CAR_CATALOG).map((brand) => <option key={brand}>{brand}</option>)}</select></label>
                <label>Modelo<select value={vehicleDraft.model} onChange={(event) => handleModelChange(event.target.value)}>{modelOptions.map((model) => <option key={model}>{model}</option>)}</select></label>
                <label>Año<input inputMode="numeric" required value={vehicleDraft.year} onChange={(event) => setVehicleDraft({ ...vehicleDraft, year: event.target.value })} /></label>
                <label>Fecha de matriculación<input type="date" required value={vehicleDraft.registrationDate} onChange={(event) => setVehicleDraft({ ...vehicleDraft, registrationDate: event.target.value })} /></label>
                <label>Combustible<select value={vehicleDraft.fuel} onChange={(event) => setVehicleDraft({ ...vehicleDraft, fuel: event.target.value, engine: selectedModelData?.enginesByFuel[event.target.value]?.[0] || 'Motor estándar' })}>{fuelOptions.map((fuel) => <option key={fuel}>{fuel}</option>)}</select></label>
                <label>Motorización<select value={vehicleDraft.engine} onChange={(event) => setVehicleDraft({ ...vehicleDraft, engine: event.target.value })}>{engineOptions.map((engine) => <option key={engine}>{engine}</option>)}</select></label>
                <label className="form-grid__wide">Kilometraje actual<input type="number" min="1" required value={vehicleDraft.odometer} onChange={(event) => setVehicleDraft({ ...vehicleDraft, odometer: event.target.value })} placeholder="214500" /></label>
              </div>
            </section>

            <section className="setup-section">
              <p className="section-kicker">02 / Uso habitual</p>
              <h2>¿Por dónde sueles conducir?</h2>
              <label className="form-grid__wide">Tipo de trayectos
                <select value={vehicleDraft.drivingProfile} onChange={(event) => setVehicleDraft({ ...vehicleDraft, drivingProfile: event.target.value as DrivingProfile })}>
                  <option value="city">Principalmente ciudad y trayectos cortos</option>
                  <option value="mixed">Uso mixto: ciudad y carretera</option>
                  <option value="highway">Principalmente carretera o autovía</option>
                </select>
              </label>
              <p className="form-help">Este dato ajusta las recomendaciones orientativas. Los intervalos del fabricante siempre tienen prioridad.</p>
            </section>

            {error && <div className="error-box">{error}</div>}
            <button type="submit" className="primary-button">Guardar y abrir mi coche</button>
          </form>
        </section>
      </main>
    )
  }

  const latestWorkshop = vehicleActivities.find((activity) => activity.type === 'workshop')
  const latestActivities = [...vehicleActivities].sort((first, second) => second.date.localeCompare(first.date))
  const drivingGuidance = DRIVING_PROFILES[vehicle.drivingProfile]
  const maintenanceCards = MAINTENANCE_PRESETS
    .filter((preset) => preset.id !== 'breakdown')
    .map((preset) => {
      const intervalKm = vehicle.maintenanceIntervals?.[preset.id] ?? preset.intervalKm
      const records = vehicleActivities
        .filter((activity) => activity.type === 'workshop' && activity.maintenanceId === preset.id)
        .sort((first, second) => second.odometer - first.odometer)
      const latest = records[0]
      const adjustedInterval = Math.round(intervalKm * drivingGuidance.intervalFactor)
      const remainingKm = latest ? Math.max(0, latest.odometer + adjustedInterval - vehicle.odometer) : null
      return { ...preset, intervalKm, records, latest, remainingKm }
    })
  const completeHistory = [...activities].sort((first, second) => second.date.localeCompare(first.date))

  return (
    <main className="app-shell app-shell--dashboard">
      <section className="dashboard-frame">
        <header className="dashboard-topbar" id="dashboard-top">
          <div className="brand-row brand-row--garage">
            <img src="/autovault-mark.svg" className="garage-logo" alt="Logo AutoVault" />
            <h1 className="garage-wordmark" aria-label="AutoVault Garage"><span className="garage-wordmark__name"><span>Auto</span><strong>Vault</strong></span><em>Garage</em></h1>
          </div>
          <button type="button" className="text-button" onClick={handleSignOut} aria-label="Cerrar sesión">Salir</button>
        </header>
        <div className={`cloud-save-status cloud-save-status--${cloudSaveStatus}`} role="status">
          <span>{cloudSaveStatus === 'saving' ? 'Guardando cambios en la base de datos de AutoVault Garage…' : cloudSaveStatus === 'saved' ? 'Guardado en la base de datos de AutoVault Garage.' : cloudSaveStatus === 'error' ? cloudSaveError || 'No se pudieron guardar los datos en la base de datos de AutoVault Garage.' : 'Conectando con la base de datos de AutoVault Garage…'}</span>
          {cloudSaveStatus === 'error' && <button type="button" onClick={() => setCloudSaveRetryToken((token) => token + 1)}>Reintentar</button>}
        </div>

        {activeTab === 'history' ? (
          <section className="history-page">
            <div className="section-heading"><div><p className="section-kicker">Todos los vehículos</p><h2>Historial completo</h2></div><button type="button" className="link-button" onClick={() => setActiveTab('car')}>Volver al coche</button></div>
            {completeHistory.length === 0 ? <p className="empty-state">Todavía no hay registros.</p> : completeHistory.map((activity) => {
              const activityVehicle = vehicles.find((item) => item.id === activity.vehicleId)
              const quantity = activity.kwh || activity.liters
              const unit = activity.kwh ? 'kWh' : 'L'
              const recordConsumption = fuelConsumptionByActivityId.get(activity.id)
              return (
                <article key={activity.id} className="activity-row activity-row--history">
                  <span className={`activity-icon activity-icon--${activity.type}`} aria-hidden="true">{activity.type === 'fuel' ? '⛽' : activity.maintenanceId === 'breakdown' ? '⚠' : '🔧'}</span>
                  <div className="activity-copy"><strong>{activity.title}</strong><span>{activityVehicle?.alias || 'Vehículo'} · {new Date(`${activity.date}T12:00:00`).toLocaleDateString('es-ES')} · {activity.odometer.toLocaleString('es-ES')} km{activity.serviceMode ? ` · ${activity.serviceMode === 'diy' ? 'DIY' : 'En taller'}` : ''}</span>{activity.type === 'fuel' && quantity > 0 && <span className="activity-quantity">{quantity.toLocaleString('es-ES', { maximumFractionDigits: 2 })} {unit} en este repostaje</span>}{activity.type === 'fuel' && recordConsumption && <span className="activity-quantity">Consumo desde el repostaje anterior: <span className={`consumption-trend consumption-trend--${recordConsumption.trend}`}>{recordConsumption.consumption.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {unit}/100 km</span></span>}{activity.notes && <p className="activity-note">{activity.notes}</p>}</div>
                  <strong className="activity-cost">{activity.cost.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</strong>
                  <button type="button" className="link-button history-edit-button" onClick={() => openActivityForEdit(activity)} aria-label={`Editar ${activity.title}`}>Editar</button>
                  <button type="button" className="link-button history-delete-button" onClick={() => handleDeleteActivity(activity)} aria-label={`Eliminar ${activity.title}`} title={`Eliminar ${activity.title}`}>🗑️</button>
                </article>
              )
            })}
          </section>
        ) : (
          <>
            <div className="vehicle-selector-wrap">
              <button type="button" className="vehicle-banner vehicle-banner--selectable" aria-expanded={isVehicleMenuOpen} onClick={() => setIsVehicleMenuOpen((open) => !open)}>
                <span className="vehicle-symbol" aria-hidden="true">🚘</span>
                <span className="vehicle-copy"><span className="vehicle-alias">{vehicle.alias} ({vehicle.year})</span><span className="vehicle-subtitle">{vehicle.brand} {vehicle.model} · {vehicle.engine}</span><span className="vehicle-odometer">{vehicle.odometer.toLocaleString('es-ES')} km · {vehicle.fuel}</span></span>
                <span className={isVehicleMenuOpen ? 'vehicle-mark vehicle-mark--open' : 'vehicle-mark'} aria-hidden="true" />
              </button>
              {isVehicleMenuOpen && (
                <div className="vehicle-menu">
                  {vehicles.map((item) => (
                    <button type="button" key={item.id} className={item.id === vehicle.id ? 'vehicle-menu__item vehicle-menu__item--selected' : 'vehicle-menu__item'} onClick={() => { setSelectedVehicleId(item.id); setIsVehicleMenuOpen(false) }}>
                      <span><strong>{item.alias}</strong><small>{item.brand} {item.model} - {item.odometer.toLocaleString('es-ES')} km</small></span>
                      {item.id === vehicle.id && <span aria-label="Seleccionado">✓</span>}
                    </button>
                  ))}
                  <button type="button" className="vehicle-menu__add" onClick={startAddingVehicle}>＋ 🚗 Añadir otro coche</button>
                </div>
              )}
            </div>

            <section className={`vehicle-status ${latestWorkshop ? 'vehicle-status--ready' : 'vehicle-status--setup'}`}>
              <span className="status-symbol" aria-hidden="true">{latestWorkshop ? '✓' : '!'}</span>
              <div><p className="status-label">Estado de tu vehículo</p><strong>{latestWorkshop ? `Último taller: ${latestWorkshop.title}` : 'Registra el mantenimiento del coche'}</strong><span>{latestWorkshop ? `Registrado a los ${latestWorkshop.odometer.toLocaleString('es-ES')} km` : 'Guarda tus revisiones para calcular los siguientes intervalos.'}</span></div>
            </section>

            <section className="metrics-panel" aria-label="Coste y consumo">
              <div className="metric-toggle" role="group" aria-label="Unidad de coste medio">
                <button type="button" className={costUnitMode === '100km' ? 'metric-toggle__active' : ''} onClick={() => setCostUnitMode('100km')}>Gasto cada 100 km</button>
                <button type="button" className={costUnitMode === '1km' ? 'metric-toggle__active' : ''} onClick={() => setCostUnitMode('1km')}>Gasto por 1 km</button>
              </div>
              <p className="metric-caption">Mover tu coche te cuesta de media</p>
              <div className="metric-value">{fuelStats ? `${(costUnitMode === '100km' ? fuelStats.costPer100 : fuelStats.costPer100 / 100).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` : 'Aún sin datos'}</div>
              <p className="metric-unit">{costUnitMode === '100km' ? 'cada 100 km' : 'por cada 1 km'}</p>
              <div className="metric-footnote">{fuelStats ? `${fuelStats.litersPer100.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${/eléctrico/i.test(vehicle.fuel) ? 'kWh' : 'L'} / 100 km · cálculo según tus repostajes` : 'Añade otro repostaje con kilometraje para calcular tu consumo real.'}</div>
              <div className="dashboard-actions">
                <button type="button" className="action-button action-button--fuel" onClick={() => openEntryForm('fuel')}><span aria-hidden="true">⛽</span>Apuntar gasolina</button>
                <button type="button" className="action-button action-button--workshop" onClick={() => openEntryForm('workshop')}><span aria-hidden="true">＋</span>Apuntar taller</button>
              </div>
            </section>

            <section className="maintenance-guidance">
              <div className="maintenance-guidance__heading"><span className="maintenance-icon" aria-hidden="true">✓</span><div><p className="section-kicker">Mantenimiento preventivo</p><strong>{drivingGuidance.label}</strong></div><span className="maintenance-factor">{Math.round(drivingGuidance.intervalFactor * 100)}%</span></div>
              <p>{drivingGuidance.guidance}</p><small>Estimaciones generales; confirma los intervalos en el manual del vehículo.</small>
              <div className="driving-profile-options" role="group" aria-label="Editar tipo de conducción">
                {(['city', 'mixed', 'highway'] as DrivingProfile[]).map((profile) => <button type="button" key={profile} className={vehicle.drivingProfile === profile ? 'driving-profile-option driving-profile-option--selected' : 'driving-profile-option'} onClick={() => handleDrivingProfileChange(profile)}>{profile === 'city' ? 'Ciudad' : profile === 'mixed' ? 'Mixto' : 'Carretera'}</button>)}
              </div>
            </section>

            <section className="maintenance-section">
              <div className="section-heading"><div><p className="section-kicker">Próximos cuidados</p><h2>Mantenimientos principales</h2></div></div>
              {maintenanceCards.map((maintenance) => <article key={maintenance.id} className="maintenance-card">
                <div className="maintenance-card__top"><span className="maintenance-card__icon" aria-hidden="true">{maintenance.icon}</span><div><strong>{maintenance.label}</strong><span>Cada {Math.round(maintenance.intervalKm * drivingGuidance.intervalFactor).toLocaleString('es-ES')} km aprox.</span></div><span className={maintenance.remainingKm !== null && maintenance.remainingKm <= 1500 ? 'maintenance-due maintenance-due--soon' : 'maintenance-due'}>{maintenance.remainingKm === null ? 'Sin registro' : maintenance.remainingKm === 0 ? 'Revisar ahora' : `Quedan ${maintenance.remainingKm.toLocaleString('es-ES')} km`}</span></div>
                {maintenance.latest && <p className="maintenance-last">Último: {maintenance.latest.odometer.toLocaleString('es-ES')} km · {new Date(`${maintenance.latest.date}T12:00:00`).toLocaleDateString('es-ES')}</p>}
                {maintenance.records.length > 0 && <details className="maintenance-history"><summary>Ver historial ({maintenance.records.length})</summary>{maintenance.records.map((record) => <div className="maintenance-record" key={record.id}><strong>{new Date(`${record.date}T12:00:00`).toLocaleDateString('es-ES')} · {record.odometer.toLocaleString('es-ES')} km</strong><span>{record.notes || 'Sin observaciones.'}</span></div>)}</details>}
              </article>)}
            </section>

            <section className="activity-section">
              <div className="section-heading"><div><p className="section-kicker">Tu actividad</p><h2>Últimos registros</h2></div><button type="button" className="link-button" onClick={() => setActiveTab('history')}>Ver historial</button></div>
              {latestActivities.length === 0 ? <p className="empty-state">Todavía no hay registros.</p> : latestActivities.slice(0, 3).map((activity) => {
                const recordConsumption = fuelConsumptionByActivityId.get(activity.id)
                return <article key={activity.id} className="activity-row"><span className={`activity-icon activity-icon--${activity.type}`} aria-hidden="true">{activity.type === 'fuel' ? '⛽' : activity.maintenanceId === 'breakdown' ? '⚠' : '🔧'}</span><div className="activity-copy"><strong>{activity.title}</strong><span>{new Date(`${activity.date}T12:00:00`).toLocaleDateString('es-ES')} · {activity.odometer.toLocaleString('es-ES')} km</span>{activity.type === 'fuel' && (activity.kwh || activity.liters) > 0 && <span className="activity-quantity">{(activity.kwh || activity.liters).toLocaleString('es-ES', { maximumFractionDigits: 2 })} {activity.kwh ? 'kWh' : 'L'} en este repostaje</span>}{recordConsumption && <span className={`activity-quantity consumption-trend consumption-trend--${recordConsumption.trend}`}>{recordConsumption.consumption.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {activity.kwh ? 'kWh' : 'L'}/100 km</span>}</div><strong className="activity-cost">{activity.cost.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</strong><button type="button" className="link-button history-edit-button" onClick={() => openActivityForEdit(activity)} aria-label={`Editar ${activity.title}`}>Editar</button><button type="button" className="link-button history-delete-button" onClick={() => handleDeleteActivity(activity)} aria-label={`Eliminar ${activity.title}`} title={`Eliminar ${activity.title}`}>🗑️</button></article>
              })}
            </section>

            <section className="vehicle-management-section">
              <div className="section-heading"><div><p className="section-kicker">Datos del vehículo</p><h2>Gestionar coche</h2></div></div>
              <button type="button" className="primary-button vehicle-edit-button" onClick={openVehicleEditor}>Editar datos del coche</button>
              <button type="button" className="danger-button vehicle-delete-button" onClick={handleDeleteVehicle}>Eliminar coche y todos sus registros</button>
            </section>
          </>
        )}
      </section>

      {isAddingVehicle && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsAddingVehicle(false) }}>
          <section className="entry-modal" role="dialog" aria-modal="true" aria-labelledby="add-vehicle-title">
            <div className="section-heading"><div><p className="section-kicker">Garaje</p><h2 id="add-vehicle-title">Añadir otro coche</h2></div><button type="button" className="close-button" onClick={() => setIsAddingVehicle(false)} aria-label="Cerrar">×</button></div>
            <form className="entry-form" onSubmit={handleAddVehicle}>
              <div className="form-grid">
                <label>Apodo (opcional)<input value={vehicleDraft.alias} onChange={(event) => setVehicleDraft({ ...vehicleDraft, alias: event.target.value })} placeholder={`Mi coche (${vehicleDraft.brand} ${vehicleDraft.model})`} /></label>
                <label>Marca<select value={vehicleDraft.brand} onChange={(event) => handleBrandChange(event.target.value)}>{Object.keys(CAR_CATALOG).map((brand) => <option key={brand}>{brand}</option>)}</select></label>
                <label>Modelo<select value={vehicleDraft.model} onChange={(event) => handleModelChange(event.target.value)}>{modelOptions.map((model) => <option key={model}>{model}</option>)}</select></label>
                <label>Año<input required value={vehicleDraft.year} onChange={(event) => setVehicleDraft({ ...vehicleDraft, year: event.target.value })} /></label>
                <label>Fecha de matriculación<input type="date" required value={vehicleDraft.registrationDate} onChange={(event) => setVehicleDraft({ ...vehicleDraft, registrationDate: event.target.value })} /></label>
                <label>Combustible<select value={vehicleDraft.fuel} onChange={(event) => setVehicleDraft({ ...vehicleDraft, fuel: event.target.value, engine: selectedModelData?.enginesByFuel[event.target.value]?.[0] || 'Motor estándar' })}>{fuelOptions.map((fuel) => <option key={fuel}>{fuel}</option>)}</select></label>
                <label>Motorización<select value={vehicleDraft.engine} onChange={(event) => setVehicleDraft({ ...vehicleDraft, engine: event.target.value })}>{engineOptions.map((engine) => <option key={engine}>{engine}</option>)}</select></label>
                <label>Kilometraje<input type="number" min="1" required value={vehicleDraft.odometer} onChange={(event) => setVehicleDraft({ ...vehicleDraft, odometer: event.target.value })} placeholder="Kilometraje actual" /></label>
                <label>Uso habitual<select value={vehicleDraft.drivingProfile} onChange={(event) => setVehicleDraft({ ...vehicleDraft, drivingProfile: event.target.value as DrivingProfile })}><option value="city">Ciudad y trayectos cortos</option><option value="mixed">Uso mixto</option><option value="highway">Carretera y autovía</option></select></label>
              </div>
              {error && <div className="error-box">{error}</div>}
              <button type="submit" className="primary-button">Guardar coche</button>
            </form>
          </section>
        </div>
      )}

      {isEditingVehicle && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsEditingVehicle(false) }}>
          <section className="entry-modal" role="dialog" aria-modal="true" aria-labelledby="edit-vehicle-title">
            <div className="section-heading"><div><p className="section-kicker">Datos del vehículo</p><h2 id="edit-vehicle-title">Editar coche</h2></div><button type="button" className="close-button" onClick={() => setIsEditingVehicle(false)} aria-label="Cerrar">×</button></div>
            <form className="entry-form" onSubmit={handleEditVehicle}>
              <div className="form-grid">
                <label>Apodo (opcional)<input value={vehicleDraft.alias} onChange={(event) => setVehicleDraft({ ...vehicleDraft, alias: event.target.value })} /></label>
                <label>Marca<select value={vehicleDraft.brand} onChange={(event) => handleBrandChange(event.target.value)}>{Object.keys(CAR_CATALOG).map((brand) => <option key={brand}>{brand}</option>)}</select></label>
                <label>Modelo<select value={vehicleDraft.model} onChange={(event) => handleModelChange(event.target.value)}>{modelOptions.map((model) => <option key={model}>{model}</option>)}</select></label>
                <label>Año<input required value={vehicleDraft.year} onChange={(event) => setVehicleDraft({ ...vehicleDraft, year: event.target.value })} /></label>
                <label>Fecha de matriculación<input type="date" required value={vehicleDraft.registrationDate} onChange={(event) => setVehicleDraft({ ...vehicleDraft, registrationDate: event.target.value })} /></label>
                <label>Combustible<select value={vehicleDraft.fuel} onChange={(event) => setVehicleDraft({ ...vehicleDraft, fuel: event.target.value, engine: selectedModelData?.enginesByFuel[event.target.value]?.[0] || 'Motor estándar' })}>{fuelOptions.map((fuel) => <option key={fuel}>{fuel}</option>)}</select></label>
                <label>Motorización<select value={vehicleDraft.engine} onChange={(event) => setVehicleDraft({ ...vehicleDraft, engine: event.target.value })}>{engineOptions.map((engine) => <option key={engine}>{engine}</option>)}</select></label>
                <label>Kilometraje<input type="number" min="1" required value={vehicleDraft.odometer} onChange={(event) => setVehicleDraft({ ...vehicleDraft, odometer: event.target.value })} /></label>
                <label>Uso habitual<select value={vehicleDraft.drivingProfile} onChange={(event) => setVehicleDraft({ ...vehicleDraft, drivingProfile: event.target.value as DrivingProfile })}><option value="city">Ciudad y trayectos cortos</option><option value="mixed">Uso mixto</option><option value="highway">Carretera</option></select></label>
              </div>
              {error && <div className="error-box">{error}</div>}
              <button type="submit" className="primary-button">Guardar cambios</button>
            </form>
          </section>
        </div>
      )}

      {activeEntryType && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setActiveEntryType(null); setEditingActivityId(null) } }}>
          <section className="entry-modal" role="dialog" aria-modal="true" aria-labelledby="entry-title">
          <div className="section-heading"><div><p className="section-kicker">{editingActivityId ? 'Corregir historial' : 'Nuevo registro'}</p><h2 id="entry-title">{editingActivityId ? 'Editar registro' : activeEntryType === 'fuel' ? 'Apuntar gasolina' : 'Apuntar taller'}</h2></div><button type="button" className="close-button" onClick={() => { setActiveEntryType(null); setEditingActivityId(null) }} aria-label="Cerrar">×</button></div>
            <form className="entry-form" onSubmit={handleSaveActivity}>
              {activeEntryType === 'fuel' ? (
                <label>{/eléctrico/i.test(vehicle.fuel) ? 'Punto de carga' : 'Gasolinera'}<input required value={entryDraft.title} onChange={(event) => setEntryDraft({ ...entryDraft, title: event.target.value })} placeholder="Nombre de la estación" /></label>
              ) : (
                <>
                  <label>Trabajo realizado<select value={entryDraft.maintenanceId} onChange={(event) => setEntryDraft({ ...entryDraft, maintenanceId: event.target.value, breakdownType: '' })}>{MAINTENANCE_PRESETS.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}</select></label>
                  {entryDraft.maintenanceId === 'breakdown' && <label>Tipo de avería<select required value={entryDraft.breakdownType} onChange={(event) => setEntryDraft({ ...entryDraft, breakdownType: event.target.value })}><option value="">Selecciona la avería</option>{BREAKDOWN_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>}
                  <label>Realizado<select value={entryDraft.serviceMode} onChange={(event) => setEntryDraft({ ...entryDraft, serviceMode: event.target.value as 'diy' | 'workshop' })}><option value="workshop">En taller</option><option value="diy">DIY (por mi cuenta)</option></select></label>
                  <label className="notes-field">Observaciones{entryDraft.maintenanceId === 'breakdown' ? ' (obligatorias)' : ' (opcional)'}<textarea required={entryDraft.maintenanceId === 'breakdown'} rows={3} value={entryDraft.notes} onChange={(event) => setEntryDraft({ ...entryDraft, notes: event.target.value })} placeholder={entryDraft.maintenanceId === 'breakdown' ? 'Describe los síntomas y la solución aplicada...' : 'Piezas, aceite utilizado u otros detalles (opcional)'} /></label>
                </>
              )}
              <div className="form-grid">
                <label>Coste total (€)<input type="number" min="0.01" step="0.01" required value={entryDraft.cost} onChange={(event) => setEntryDraft({ ...entryDraft, cost: event.target.value })} placeholder="60,00" /></label>
                {activeEntryType === 'fuel' && <label>{/eléctrico/i.test(vehicle.fuel) ? 'Energía (kWh)' : 'Litros'}<input type="number" min="0.01" step="0.01" required value={entryDraft.liters} onChange={(event) => setEntryDraft({ ...entryDraft, liters: event.target.value })} placeholder="38" /></label>}
                <label>Kilometraje<input type="number" min="1" required value={entryDraft.odometer} onChange={(event) => setEntryDraft({ ...entryDraft, odometer: event.target.value })} /></label>
                <label>Fecha<input type="date" required value={entryDraft.date} onChange={(event) => setEntryDraft({ ...entryDraft, date: event.target.value })} /></label>
              </div>
              {error && <div className="error-box">{error}</div>}
              <button type="submit" className="primary-button">{editingActivityId ? 'Guardar cambios' : 'Guardar registro'}</button>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default App
