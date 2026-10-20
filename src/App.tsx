import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { useMemo, useState } from 'react'
import './App.css'

type UserProfile = {
  id: string
  name: string
  email: string
  avatar?: string
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
  Peugeot: ['106', '107', '108', '205', '206', '207', '208', '307', '308', '405', '407', '408', '508', '2008', '3008', '4007', '5008', '508 SW', 'Rifter', 'Partner', 'Expert', 'Boxer', 'e-208', 'e-2008', 'e-308', 'e-408', 'C5 X'],
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

function decodeGoogleJwt(token: string): UserProfile | null {
  try {
    const payload = token.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const parsed = JSON.parse(atob(normalized))

    return {
      id: parsed.sub,
      name: parsed.name,
      email: parsed.email,
      avatar: parsed.picture,
    }
  } catch {
    return null
  }
}

function App() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [error, setError] = useState('')
  const [workshop, setWorkshop] = useState({ name: '', phone: '', address: '' })
  const [fuelEntry, setFuelEntry] = useState({ station: '', liters: '', pricePerLiter: '', odometer: '', date: new Date().toISOString().slice(0, 10) })
  const [saved, setSaved] = useState(false)

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  const googleReady = useMemo(() => clientId.length > 0, [clientId])

  const handleGoogleSuccess = (response: { credential?: string }) => {
    if (!response.credential) {
      setError('No se recibió la credencial de Google.')
      return
    }

    const decoded = decodeGoogleJwt(response.credential)
    if (!decoded) {
      setError('No se pudo interpretar la respuesta de Google.')
      return
    }

    setUser(decoded)
    setError('')
  }

  const handleDemoLogin = () => {
    setUser({
      id: 'demo-user',
      name: 'Usuario de demostración',
      email: 'demo@autovault.local',
    })
    setError('')
  }

  const handleSaveInitialData = () => {
    const liters = Number(fuelEntry.liters)
    const pricePerLiter = Number(fuelEntry.pricePerLiter)
    const odometer = Number(fuelEntry.odometer)
    if (!workshop.name.trim() || !fuelEntry.station.trim() || liters <= 0 || pricePerLiter <= 0 || odometer <= 0) {
      setError('Completa el taller y los datos válidos del repostaje.')
      setSaved(false)
      return
    }

    try {
      localStorage.setItem(`autovault_initial_data_${user?.id}`, JSON.stringify({ workshop, fuelEntry }))
      setError('')
      setSaved(true)
    } catch {
      setError('No se pudieron guardar los datos en este dispositivo.')
      setSaved(false)
    }
  }

  if (!user) {
    return (
      <main className="app-shell">
        <section className="app-card">
          <div className="brand-row">
            <div className="brand-mark">A</div>
            <div>
              <p className="eyebrow">App móvil</p>
              <h1>{APP_CONFIG.appName}</h1>
            </div>
          </div>

          <div className="info-block">
            <span className="badge">{APP_CONFIG.version}</span>
            <span className="badge muted">{APP_CONFIG.platforms.join(' / ')}</span>
          </div>

          <div className="login-panel">
            <h2>Inicio de sesión</h2>
            <p>La demo permite probar la pantalla inicial. El acceso de Google requiere configurar un client ID.</p>

            {googleReady ? (
              <GoogleOAuthProvider clientId={clientId}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('No se pudo iniciar sesión con Google.')}
                  text="continue_with"
                  shape="pill"
                />
              </GoogleOAuthProvider>
            ) : (
              <div className="warning-box">
                <strong>Google aún no está configurado.</strong>
                <p>VITE_GOOGLE_CLIENT_ID habilitará el acceso real. Puedes entrar con la demo mientras tanto.</p>
              </div>
            )}

            <button type="button" className="demo-button" onClick={handleDemoLogin}>
              Entrar en demo
            </button>
          </div>

          {error && <div className="error-box">{error}</div>}

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

  return (
    <main className="app-shell app-shell--wide">
      <section className="app-card app-card--wide">
        <header className="header-bar">
          <div className="brand-row">
            <div className="brand-mark">A</div>
            <div>
              <p className="eyebrow">Configuración inicial</p>
              <h1>{APP_CONFIG.appName}</h1>
            </div>
          </div>

          <div className="profile-inline">
            {user.avatar && <img src={user.avatar} alt="" className="avatar" />}
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
            <button type="button" className="logout-button" onClick={() => setUser(null)}>
              Salir
            </button>
          </div>
        </header>

        <form className="panel" onSubmit={(event) => { event.preventDefault(); handleSaveInitialData() }}>
          <h2>Datos del taller</h2>
          <div className="field-grid">
            <label>
              Nombre del taller
              <input required value={workshop.name} onChange={(event) => { setWorkshop({ ...workshop, name: event.target.value }); setSaved(false) }} placeholder="Taller AutoVault" />
            </label>
            <label>
              Teléfono
              <input type="tel" value={workshop.phone} onChange={(event) => { setWorkshop({ ...workshop, phone: event.target.value }); setSaved(false) }} placeholder="Teléfono de contacto" />
            </label>
          </div>
          <label>
            Dirección
            <input value={workshop.address} onChange={(event) => { setWorkshop({ ...workshop, address: event.target.value }); setSaved(false) }} placeholder="Dirección del taller" />
          </label>

          <h2>Primer repostaje</h2>
          <div className="field-grid field-grid--3">
            <label>
              Gasolinera
              <input required value={fuelEntry.station} onChange={(event) => { setFuelEntry({ ...fuelEntry, station: event.target.value }); setSaved(false) }} placeholder="Nombre de la gasolinera" />
            </label>
            <label>
              Fecha
              <input type="date" required value={fuelEntry.date} onChange={(event) => { setFuelEntry({ ...fuelEntry, date: event.target.value }); setSaved(false) }} />
            </label>
            <label>
              Kilometraje (km)
              <input type="number" min="1" required value={fuelEntry.odometer} onChange={(event) => { setFuelEntry({ ...fuelEntry, odometer: event.target.value }); setSaved(false) }} placeholder="125000" />
            </label>
          </div>
          <div className="field-grid">
            <label>
              Litros
              <input type="number" min="0.01" step="0.01" required value={fuelEntry.liters} onChange={(event) => { setFuelEntry({ ...fuelEntry, liters: event.target.value }); setSaved(false) }} placeholder="45,00" />
            </label>
            <label>
              Precio por litro (€)
              <input type="number" min="0.001" step="0.001" required value={fuelEntry.pricePerLiter} onChange={(event) => { setFuelEntry({ ...fuelEntry, pricePerLiter: event.target.value }); setSaved(false) }} placeholder="1,599" />
            </label>
          </div>

          {error && <div className="error-box">{error}</div>}
          {saved && <div className="warning-box">Datos guardados en este dispositivo.</div>}
          <button type="submit" className="primary-button">Guardar datos</button>
        </form>
      </section>
    </main>
  )
}

export default App
