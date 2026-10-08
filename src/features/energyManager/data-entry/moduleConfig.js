/**
 * Module configuration for Data Entry tabs.
 * Each module represents a sheet from the Database Redesign (sheets 2-7).
 * Maps to the existing submission backend using scope1Data/scope2Data/scope3Data.
 */

import { isBulkData } from "./utils";

const toUniqueValues = (values = []) => Array.from(new Set(values.filter(Boolean)));

const expandRowsBySources = (row, sources = []) =>
  sources.map((source) => ({ ...row, source }));

const LEGACY_AC_R_GASES = Object.freeze([
  "R32",
  "R410A",
  "R407A",
  "R600a",
  "R290",
  "R134a",
  "R22",
]);

const EXTENDED_R_GASES = Object.freeze([
  "R23",
  "R32",
  "R125",
  "R134a",
  "R410A",
  "R407A",
  "R600a",
  "R290",
  "R22",
]);

const OFFICE_APPLIANCE_PURCHASED_ITEMS = Object.freeze([
  "Inverter Battery",
  "Air Conditioner (AC)",
  "Refrigerator",
  "Water Cooler/Dispenser",
  "UPS",
  "Printer/Photocopier",
  "Desktop/Laptop",
  "Server/Networking Equipment",
  "Microwave/Induction",
  "Other Electrical Appliance",
]);

export const SCOPE1_REFRIGERANT_FACTOR_ROWS = Object.freeze([
  ...expandRowsBySources(
    {
      activityType: "Residential A/C (Central)",
      activityGroup: "Annual Leak Rate",
      activityCategory: "10",
      unit: "%/year",
      emissionFactor: 10,
    },
    LEGACY_AC_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "Residential A/C (Central)",
      activityGroup: "End-of-Life Loss",
      activityCategory: "80",
      unit: "%",
      emissionFactor: 80,
    },
    LEGACY_AC_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "Residential A/C (Window Unit)",
      activityGroup: "Annual Leak Rate",
      activityCategory: "2",
      unit: "%/year",
      emissionFactor: 2,
    },
    LEGACY_AC_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "Residential & Commercial A/C",
      activityGroup: "Annual Loss (Operating)",
      activityCategory: "1-Oct",
      unit: "%/year",
      emissionFactor: 10,
    },
    EXTENDED_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "Residential & Commercial A/C",
      activityGroup: "Initial Loss (at Charge)",
      activityCategory: "0.2 - 1",
      unit: "%",
      emissionFactor: 1,
    },
    EXTENDED_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "Commercial A/C (Packaged)",
      activityGroup: "Annual Leak Rate",
      activityCategory: "6.9",
      unit: "%/year",
      emissionFactor: 6.9,
    },
    LEGACY_AC_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "Commercial A/C (Packaged)",
      activityGroup: "End-of-Life Loss",
      activityCategory: "20",
      unit: "%",
      emissionFactor: 20,
    },
    LEGACY_AC_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "Commercial A/C (Window Unit)",
      activityGroup: "Annual Leak Rate",
      activityCategory: "2",
      unit: "%/year",
      emissionFactor: 2,
    },
    LEGACY_AC_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "Room Air-Conditioners",
      activityGroup: "Annual Loss",
      activityCategory: "2",
      unit: "%/year",
      emissionFactor: 2,
    },
    EXTENDED_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "AC Large Centrifugal Chiller (>907 kg)",
      activityGroup: "Annual Leak Rate",
      activityCategory: "2.3",
      unit: "%/year",
      emissionFactor: 2.3,
    },
    LEGACY_AC_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "AC Large Centrifugal Chiller (>907 kg)",
      activityGroup: "End-of-Life Loss",
      activityCategory: "20",
      unit: "%",
      emissionFactor: 20,
    },
    LEGACY_AC_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "AC Medium Centrifugal Chiller (90-907 kg)",
      activityGroup: "Annual Leak Rate",
      activityCategory: "1.4",
      unit: "%/year",
      emissionFactor: 1.4,
    },
    LEGACY_AC_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "AC Chiller (Packaged)",
      activityGroup: "Annual Leak Rate",
      activityCategory: "6.9",
      unit: "%/year",
      emissionFactor: 6.9,
    },
    LEGACY_AC_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "Chillers (General)",
      activityGroup: "Annual Loss",
      activityCategory: "Feb-15",
      unit: "%/year",
      emissionFactor: 15,
    },
    EXTENDED_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "Chillers (General)",
      activityGroup: "Initial Loss (at Charge)",
      activityCategory: "0.2 - 1",
      unit: "%",
      emissionFactor: 1,
    },
    EXTENDED_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "Mobile A/C (Light-Duty Vehicles)",
      activityGroup: "Annual Leak Rate",
      activityCategory: "10.1 - 13.1",
      unit: "%/year",
      emissionFactor: 13.1,
    },
    LEGACY_AC_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "Mobile A/C (Light-Duty Vehicles)",
      activityGroup: "End-of-Life Loss",
      activityCategory: "30",
      unit: "%",
      emissionFactor: 30,
    },
    LEGACY_AC_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "Mobile A/C (Passenger Cars)",
      activityGroup: "Annual Leak Rate",
      activityCategory: "10",
      unit: "%/year",
      emissionFactor: 10,
    },
    LEGACY_AC_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "Mobile A/C (Buses)",
      activityGroup: "Annual Leak Rate",
      activityCategory: "2.55",
      unit: "lbs/year",
      emissionFactor: 2.55,
    },
    LEGACY_AC_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "Mobile A/C (General)",
      activityGroup: "Annual Loss",
      activityCategory: "Oct-20",
      unit: "%/year",
      emissionFactor: 20,
    },
    EXTENDED_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "Mobile A/C (General)",
      activityGroup: "Initial Loss (at Charge)",
      activityCategory: "0.2 - 5",
      unit: "%",
      emissionFactor: 5,
    },
    EXTENDED_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "Mobile A/C (General)",
      activityGroup: "Lifetime",
      activityCategory: "Sep-16",
      unit: "years",
      emissionFactor: 16,
    },
    EXTENDED_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "Heat Pumps",
      activityGroup: "Manufacturing Loss",
      activityCategory: "0.1",
      unit: "%",
      emissionFactor: 0.1,
    },
    EXTENDED_R_GASES,
  ),
  ...expandRowsBySources(
    {
      activityType: "Heat Pumps",
      activityGroup: "Annual Loss (Operating)",
      activityCategory: "2",
      unit: "%/year",
      emissionFactor: 2,
    },
    EXTENDED_R_GASES,
  ),
  {
    activityType: "Fire Extinguisher (CO₂)",
    source: "CO₂ Fire Extinguisher",
    activityGroup: "Annual Loss",
    activityCategory: "0.001",
    unit: "kg",
    emissionFactor: 0.001,
  },
]);

const SCOPE1_REFRIGERANT_EQUIPMENT_TYPES = toUniqueValues(SCOPE1_REFRIGERANT_FACTOR_ROWS.map((row) => row.activityType));
const SCOPE1_REFRIGERANT_GASES = toUniqueValues(SCOPE1_REFRIGERANT_FACTOR_ROWS.map((row) => row.source));
const SCOPE1_REFRIGERANT_PARAMETERS = toUniqueValues(SCOPE1_REFRIGERANT_FACTOR_ROWS.map((row) => row.activityGroup));
const SCOPE1_REFRIGERANT_EF_VALUES = toUniqueValues(SCOPE1_REFRIGERANT_FACTOR_ROWS.map((row) => row.activityCategory));
const SCOPE1_REFRIGERANT_UNITS = toUniqueValues(SCOPE1_REFRIGERANT_FACTOR_ROWS.map((row) => row.unit));

export const MODULES = [
  {
    key: "stationary_combustion",
    label: "Stationary Combustion",
    shortLabel: "Module A",
    icon: "Flame",
    scope: "Scope 1",
    scopeKey: "scope1",
    section: "Stationary Combustion",
    description: "Fuel combustion in boilers, furnaces, generators, and other fixed equipment.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "assetId", label: "Asset", type: "select", required: false, width: "170px" },
      {
        key: "source",
        label: "Fuel Type",
        type: "select",
        required: true,
        width: "160px",
        options: [
          "Diesel",
          "Natural Gas",
          "LPG",
          "Coal IND",
          "Coal IMP",
          "Furnace Oil",
          "HSD",
          "Petrol",
          "Biomass",
          "Wood",
          "Bagasse",
          "Rice Husk",
          "Pet Coke",
          "Light Diesel Oil",
          "LSHS",
          "Kerosene",
          "Propane",
          "Other",
        ],
      },
      { key: "consumption", label: "Qty Consumed", type: "number", required: true, width: "130px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["Litres", "Tonnes", "kg", "m³", "SCM", "kL", "Gallons", "MMBTU"] },
      { key: "gcv", label: "GCV", type: "number", required: false, width: "100px", placeholder: "0.00" },
      { key: "gcvUnit", label: "GCV Unit", type: "select", required: false, width: "110px", options: ["MJ/kg", "kcal/kg", "kJ/kg", "BTU/lb"] },
      { key: "assetEfficiency", label: "Efficiency %", type: "number", required: false, width: "110px", placeholder: "e.g. 80" },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "110px", options: ["Meter", "Invoice", "Estimate"] },
      { key: "energyContentFossil", label: "Energy Content (fossil) TJ", type: "number", required: false, width: "180px", placeholder: "0.00", cbamOnly: true },
      { key: "energyContentBio", label: "Energy Content (bio) TJ", type: "number", required: false, width: "180px", placeholder: "0.00", cbamOnly: true },
      { key: "oxidationFactor", label: "Oxidation Factor (OxF)", type: "number", required: false, width: "170px", placeholder: "0.00", cbamOnly: true },
      { key: "conversionFactor", label: "Conversion Factor (ConvF)", type: "number", required: false, width: "180px", placeholder: "0.00", cbamOnly: true },
      { key: "carbonContent", label: "Carbon Content %", type: "number", required: false, width: "140px", placeholder: "Optional %" },
      { key: "emissionFactor", label: "EF", type: "number", required: false, width: "120px", placeholder: "Optional" },
    ],
  },
  {
    key: "electrical_power",
    label: "Electrical Power & Efficiency",
    shortLabel: "Module B",
    icon: "Zap",
    scope: "Scope 2",
    scopeKey: "scope2",
    section: "Electrical Power and Efficiency",
    description: "Purchased electricity, renewable energy, and power generation data.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "assetId", label: "Asset", type: "select", required: false, width: "170px" },
      { key: "activityType", label: "Type", type: "select", required: true, width: "160px", options: ["Purchased", "Consumed", "Generated", "Auxiliary", "Solar", "Wind", "Captive"] },
      {
        key: "activityGroup",
        label: "Connection Type",
        type: "select",
        required: true,
        width: "180px",
        options: ["Grid", "Open Access Renewable", "Open Access Non-Renewable", "Captive Power", "Rooftop Solar", "Wheeled Power"],
      },
      { key: "consumption", label: "Total Units", type: "number", required: true, width: "150px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "100px", options: ["kWh", "MWh", "GWh", "Units"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "110px", options: ["Meter", "Invoice", "EB Bill", "Estimate"] },
      { key: "carbonContent", label: "Carbon Content %", type: "number", required: false, width: "140px", placeholder: "Optional %" },
      { key: "emissionFactor", label: "EF", type: "number", required: false, width: "120px", placeholder: "Optional" },
    ],
  },
  {
    key: "production_activity",
    label: "Production Activity",
    shortLabel: "Module C",
    icon: "Factory",
    scope: null,
    scopeKey: "scope1",
    section: "Production Activity",
    description: "Production output data for intensity calculations and benchmarking.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "activityType", label: "Product Name", type: "select", required: true, width: "180px", placeholder: "e.g. Cement, Steel", options: [] },
      { key: "consumption", label: "Qty Produced", type: "number", required: true, width: "130px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["Tonnes", "kg", "Units", "m³", "Litres", "Bags", "MT"] },
      { key: "operatingHours", label: "Operating Hours", type: "number", required: false, width: "140px", placeholder: "0" },
      { key: "capacityUtilization", label: "Capacity Util. %", type: "number", required: false, width: "140px", placeholder: "e.g. 85" },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "110px", options: ["Meter", "Invoice", "ERP", "Manual Log"] },
      { key: "carbonContent", label: "Carbon Content %", type: "number", required: false, width: "140px", placeholder: "Optional %" },
      { key: "emissionFactor", label: "EF", type: "number", required: false, width: "120px", placeholder: "Optional" },
    ],
  },
  {
    key: "logistics_transportation",
    label: "Logistics & Transportation",
    shortLabel: "Module D",
    icon: "Truck",
    scope: "Scope 1",
    scopeKey: "scope1",
    section: "Logistics and Transportation",
    description: "Company fleet, third-party logistics, and employee commuting data.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "activityType", label: "Logistics Type", type: "select", required: true, width: "170px", options: ["Company Owned", "Third Party", "Employee Commute", "Business Travel"] },
      { key: "activityGroup", label: "Transport Mode", type: "select", required: true, width: "140px", options: ["Road", "Rail", "Air", "Sea"] },
      { key: "activityCategory", label: "Vehicle Class", type: "select", required: false, width: "130px", options: ["HGV", "LGV", "Car", "Bus", "Two-Wheeler", "Other"] },
      { key: "source", label: "Input Method", type: "select", required: true, width: "140px", options: ["Fuel-Based", "Distance-Based"] },
      { key: "consumption", label: "Fuel Qty / Distance", type: "number", required: true, width: "160px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["Litres", "kg", "km", "Miles", "Gallons", "kL", "m³"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "110px", options: ["Meter", "Invoice", "GPS", "Estimate"] },
      { key: "carbonContent", label: "Carbon Content %", type: "number", required: false, width: "140px", placeholder: "Optional %" },
      { key: "emissionFactor", label: "EF", type: "number", required: false, width: "120px", placeholder: "Optional" },
    ],
  },
  {
    key: "scope3_value_chain",
    label: "Scope 3 Value Chain",
    shortLabel: "Module E",
    icon: "Link",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Scope 3 Value Chain",
    description: "Upstream and downstream value chain emissions across 15 GHG Protocol categories.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      {
        key: "activityType",
        label: "Category",
        type: "select",
        required: true,
        width: "220px",
        options: [
          "1 - Purchased Goods & Services",
          "2 - Capital Goods",
          "3 - Fuel & Energy Activities",
          "4 - Upstream Transportation",
          "5 - Waste in Operations",
          "6 - Business Travel",
          "7 - Employee Commuting",
          "8 - Upstream Leased Assets",
          "9 - Downstream Transportation",
          "10 - Processing of Sold Products",
          "11 - Use of Sold Products",
          "12 - End-of-Life Treatment",
          "13 - Downstream Leased Assets",
          "14 - Franchises",
          "15 - Investments",
        ],
      },
      { key: "activityGroup", label: "Item Name", type: "text", required: true, width: "180px", placeholder: "e.g. Steel Purchase" },
      { key: "source", label: "Data Method", type: "select", required: true, width: "150px", options: ["Spend-Based", "Quantity-Based", "Average-Data"] },
      { key: "consumption", label: "Spend / Mass", type: "number", required: true, width: "130px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "120px", options: ["USD", "INR", "EUR", "GBP", "Tonnes", "kg", "m³"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "110px", options: ["Invoice", "ERP", "Supplier Data", "Estimate"] },
      { key: "carbonContent", label: "Carbon Content %", type: "number", required: false, width: "140px", placeholder: "Optional %" },
      { key: "emissionFactor", label: "EF", type: "number", required: false, width: "120px", placeholder: "Optional" },
    ],
  },
  {
    key: "process_fugitive",
    label: "Process & Fugitive",
    shortLabel: "Module F",
    icon: "Wind",
    scope: "Scope 1",
    scopeKey: "scope1",
    section: "Process and Fugitive",
    description: "Industrial process emissions and fugitive gas leaks from operations.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      {
        key: "activityType",
        label: "Emission Source",
        type: "select",
        required: true,
        width: "180px",
        options: ["Industrial Process", "Fugitive Emission", "Waste Treatment", "Refrigerant Leakage", "Fire Suppression"],
      },
      { key: "activityGroup", label: "Reactant Material", type: "text", required: false, width: "170px", placeholder: "e.g. Limestone" },
      { key: "consumption", label: "Input Mass", type: "number", required: true, width: "120px", placeholder: "Tonnes" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "100px", options: ["Tonnes", "kg"] },
      { key: "activityCategory", label: "Carbon Content %", type: "number", required: false, width: "140px", placeholder: "e.g. 44" },
      { key: "source", label: "Gas Type", type: "select", required: true, width: "120px", options: ["CO₂", "CH₄", "N₂O", "SF₆", "HFCs", "PFCs", "NF₃", "NOx", "COx"] },
      { key: "refillAmount", label: "Refill Amt (kg)", type: "number", required: false, width: "130px", placeholder: "0.00" },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "110px", options: ["Meter", "Invoice", "Mass Balance", "Estimate"] },
      { key: "energyContentFossil", label: "Energy Content (fossil) TJ", type: "number", required: false, width: "180px", placeholder: "0.00", cbamOnly: true },
      { key: "energyContentBio", label: "Energy Content (bio) TJ", type: "number", required: false, width: "180px", placeholder: "0.00", cbamOnly: true },
      { key: "oxidationFactor", label: "Oxidation Factor (OxF)", type: "number", required: false, width: "170px", placeholder: "0.00", cbamOnly: true },
      { key: "conversionFactor", label: "Conversion Factor (ConvF)", type: "number", required: false, width: "180px", placeholder: "0.00", cbamOnly: true },
      { key: "emissionFactor", label: "EF", type: "number", required: false, width: "120px", placeholder: "Optional" },
    ],
  },
];

export const SERVICE_SECTOR_MODULES = [
  {
    key: "electricity_grid",
    label: "Grid",
    icon: "Zap",
    category: "Electricity",
    scope: "Scope 2",
    scopeKey: "scope2",
    section: "Electricity - Grid",
    description: "Electricity procured from the power grid.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "consumption", label: "Electricity", type: "number", required: true, width: "160px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["kWh", "MWh", "GWh", "Units"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Meter", "Invoice", "EB Bill", "Estimate"] },
    ],
  },
  {
    key: "electricity_renewable",
    label: "Renewable",
    icon: "Zap",
    category: "Electricity",
    scope: "Scope 2",
    scopeKey: "scope2",
    section: "Electricity - Renewable",
    description: "Renewable electricity use (onsite/offsite).",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "activityType", label: "Renewable Type", type: "select", required: true, width: "170px", options: ["Solar", "Wind", "Hydro", "Green Power", "Other"] },
      { key: "consumption", label: "Units", type: "number", required: true, width: "130px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["kWh", "MWh", "GWh", "Units"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Meter", "Invoice", "Certificate", "Estimate"] },
    ],
  },
  {
    key: "electricity_net_metering",
    label: "Net Metering",
    icon: "Zap",
    category: "Electricity",
    scope: "Scope 2",
    scopeKey: "scope2",
    section: "Electricity - Net Metering",
    description: "Grid import/export and renewable-backed net metering records.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "consumption", label: "Total Units", type: "number", required: true, width: "140px", placeholder: "0.00" },
      {
        key: "unit",
        label: "Unit",
        type: "select",
        required: true,
        width: "100px",
        defaultValue: "kWh",
        options: ["kWh"],
      },
      {
        key: "measurementMethod",
        label: "Method",
        type: "select",
        required: true,
        width: "160px",
        defaultValue: "Meter",
        options: ["Meter", "Utility Bill", "Net Meter Statement", "Estimate"],
      },
      { key: "displayEmissionFactor", label: "EF", type: "number", required: false, width: "100px", defaultValue: "0.72", placeholder: "0.72" },
      {
        key: "dataStatus",
        label: "Data Status",
        type: "select",
        required: false,
        width: "140px",
        options: ["Actual", "Estimated", "Provisional", "Final"],
      },
      { key: "totalGenerationKwh", label: "Generation (Renewable)", type: "number", required: false, width: "170px", placeholder: "0.00" },
      { key: "selfConsumptionKwh", label: "Self Consumption", type: "number", required: false, width: "150px", placeholder: "0.00" },
      { key: "exportToGridKwh", label: "Export to Grid", type: "number", required: false, width: "140px", placeholder: "0.00" },
      { key: "importFromGridKwh", label: "Import from Grid", type: "number", required: false, width: "140px", placeholder: "0.00" },
      {
        key: "netMeteringType",
        label: "Net Metering Type",
        type: "select",
        required: false,
        width: "200px",
        defaultValue: "No Renewable (Grid Only)",
        options: [
          "No Renewable (Grid Only)",
          "Net Metering (One-to-One)",
          "Net Billing",
          "Gross Metering",
          "With Renewable Purchases",
        ],
      },
      { key: "renewablePurchasedKwh", label: "Renewable Purchased", type: "number", required: false, width: "170px", placeholder: "0.00" },
    ],
  },
  {
    key: "electricity_diesel_generator",
    label: "Diesel Generator",
    icon: "Flame",
    category: "Electricity",
    scope: "Scope 1",
    scopeKey: "scope1",
    section: "Electricity - Diesel Generator",
    description: "Diesel consumed by generator operations.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "source", label: "Fuel Type", type: "select", required: true, width: "160px", options: ["Diesel", "HSD", "Biodiesel"] },
      { key: "consumption", label: "Fuel Consumed", type: "number", required: true, width: "140px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["Litres", "kL", "Gallons"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Meter", "Invoice", "Estimate"] },
    ],
  },
  {
    key: "travel_personal_vehicle",
    label: "Personal Vehicle",
    icon: "Truck",
    category: "Travel",
    scope: "Scope 1",
    scopeKey: "scope1",
    section: "Travel - Personal Vehicle",
    description: "Employee business travel via personal vehicles.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "activityType", label: "Vehicle Type", type: "select", required: true, width: "150px", options: ["Car", "Two-Wheeler", "SUV", "Other"] },
      { key: "source", label: "Input Method", type: "select", required: true, width: "140px", options: ["Fuel-Based", "Distance-Based"] },
      { key: "consumption", label: "Distance / Fuel", type: "number", required: true, width: "150px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["km", "Miles", "Litres", "Gallons"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "GPS", "Claim", "Estimate"] },
    ],
  },
  {
    key: "travel_air",
    label: "Air Travel",
    icon: "Truck",
    category: "Travel",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Travel - Air Travel",
    description: "Employee business travel via flights.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "activityType", label: "Travel Class", type: "select", required: true, width: "140px", options: ["Economy", "Premium Economy", "Business", "First", "Unknown"] },
      { key: "activityGroup", label: "Route Type", type: "select", required: true, width: "140px", options: ["Domestic", "International"] },
      { key: "consumption", label: "Distance", type: "number", required: true, width: "120px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["km", "Miles"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Ticket", "Invoice", "Estimate"] },
    ],
  },
  {
    key: "travel_railway",
    label: "Railway Travel",
    icon: "Truck",
    category: "Travel",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Travel - Railway Travel",
    description: "Employee business travel via trains.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "activityType", label: "Train Type", type: "select", required: true, width: "150px", options: ["Local", "Intercity", "Metro", "High-Speed", "Other"] },
      { key: "consumption", label: "Distance", type: "number", required: true, width: "120px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["km", "Miles"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Ticket", "Invoice", "Estimate"] },
    ],
  },
  {
    key: "travel_roadways",
    label: "Roadways Travel",
    icon: "Truck",
    category: "Travel",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Travel - Roadways Travel",
    description: "Employee business travel via road transport.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "activityType", label: "Mode", type: "select", required: true, width: "150px", options: ["Taxi", "Cab", "Bus", "Company Vehicle", "Other"] },
      { key: "consumption", label: "Distance", type: "number", required: true, width: "120px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["km", "Miles"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "GPS", "Claim", "Estimate"] },
    ],
  },
  {
    key: "travel_hotel_stay",
    label: "Hotel Stay",
    icon: "Building2",
    category: "Travel",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Travel - Hotel Stay",
    description: "Emissions from employee hotel stays during business travel.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "activityType", label: "Stay Type", type: "select", required: true, width: "150px", options: ["Hotel", "Guest House", "Serviced Apartment", "Other"] },
      { key: "activityGroup", label: "Rating", type: "select", required: false, width: "140px", options: ["3 Star", "4 Star", "5 Star", "Unrated"] },
      { key: "consumption", label: "Duration of Stay", type: "number", required: true, width: "170px", placeholder: "0" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["Night", "Room Night"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "Booking", "Estimate"] },
    ],
  },
  {
    key: "gas_fuel_cooking",
    label: "Cooking Fuels",
    icon: "Flame",
    category: "Gas & Fuel",
    scope: "Scope 1",
    scopeKey: "scope1",
    section: "Gas & Fuel - Cooking Fuels",
    description: "Fuel used for cooking operations.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "source", label: "Fuel Type", type: "select", required: true, width: "160px", options: ["LPG", "PNG", "CNG", "Biogas", "Other"] },
      { key: "consumption", label: "Fuel Consumed", type: "number", required: true, width: "140px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["kg", "Litres", "SCM", "m³"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "Meter", "Estimate"] },
    ],
  },
  {
    key: "gas_fuel_gases",
    label: "Gases",
    icon: "Wind",
    category: "Gas & Fuel",
    scope: "Scope 1",
    scopeKey: "scope1",
    section: "Gas & Fuel - Gases",
    description: "Consumption and leakage of gaseous fuels.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      {
        key: "activityType",
        label: "Equipment Type / Sub-application",
        type: "select",
        required: true,
        width: "260px",
        options: SCOPE1_REFRIGERANT_EQUIPMENT_TYPES,
      },
      {
        key: "source",
        label: "Refrigerant Gases",
        type: "select",
        required: true,
        width: "220px",
        options: SCOPE1_REFRIGERANT_GASES,
      },
      {
        key: "activityGroup",
        label: "Parameter",
        type: "select",
        required: true,
        width: "190px",
        options: SCOPE1_REFRIGERANT_PARAMETERS,
      },
      /* {
        key: "activityCategory",
        label: "Emission Factor (Value)",
        type: "select",
        required: true,
        width: "170px",
        options: SCOPE1_REFRIGERANT_EF_VALUES,
      }, */
      { key: "unit", label: "Unit", type: "select", required: true, width: "120px", options: SCOPE1_REFRIGERANT_UNITS },
      { key: "consumption", label: "Activity Value", type: "number", required: false, width: "140px", placeholder: "0.00" },
      { key: "measurementMethod", label: "Method", type: "select", required: false, width: "120px", options: ["Meter", "Invoice", "Estimate"] },
    ],
  },
  {
    key: "office_supplies_paper",
    label: "Paper (Exam/Audit)",
    icon: "FileText",
    category: "Office Supplies",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Office Supplies - Paper",
    description: "Paper purchased for office operations and assessments.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "source", label: "Item", type: "select", required: true, width: "190px", options: ["Paper (Exam/Audit)"] },
      { key: "consumption", label: "Total Weight Purchased", type: "number", required: true, width: "190px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["kg"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "ERP", "Estimate"] },
    ],
  },
  {
    key: "office_supplies_it_hardware",
    label: "IT Hardware",
    icon: "FileText",
    category: "Office Supplies",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Office Supplies - IT Hardware",
    description: "Laptops/PCs and other IT hardware procured for office use.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "source", label: "Item", type: "select", required: true, width: "190px", options: ["IT Hardware"] },
      { key: "consumption", label: "Number of Laptops/PCs", type: "number", required: true, width: "190px", placeholder: "0" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["unit"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "ERP", "Estimate"] },
    ],
  },
  {
    key: "office_supplies_software_cloud",
    label: "Software/Cloud",
    icon: "FileText",
    category: "Office Supplies",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Office Supplies - Software Cloud",
    description: "Software subscriptions and cloud service spend.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "source", label: "Item", type: "select", required: true, width: "190px", options: ["Software/Cloud"] },
      { key: "consumption", label: "Total Monthly Bill", type: "number", required: true, width: "170px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["INR"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "ERP", "Estimate"] },
    ],
  },
  {
    key: "office_appliances_purchased_items",
    label: "Purchased Items",
    icon: "FileText",
    category: "Office Appliances",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Office Appliances - Purchased Items",
    description: "Purchased office electrical appliances such as inverter batteries and AC units.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "source", label: "Appliance", type: "select", required: true, width: "230px", options: OFFICE_APPLIANCE_PURCHASED_ITEMS },
      { key: "consumption", label: "Quantity Purchased", type: "number", required: true, width: "180px", placeholder: "0" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["unit"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "ERP", "Estimate"] },
    ],
  },
  {
    key: "utility_losses_grid_td",
    label: "Grid T&D Losses",
    icon: "Zap",
    category: "Utility Losses",
    scope: "Scope 2",
    scopeKey: "scope2",
    section: "Utility Losses - Grid T&D",
    description: "Transmission and distribution loss proxy on billed electricity.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "source", label: "Item", type: "select", required: true, width: "190px", options: ["Grid T&D Losses"] },
      { key: "consumption", label: "Total Electricity (from bill)", type: "number", required: true, width: "200px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["kWh"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["EB Bill", "Invoice", "Estimate"] },
    ],
  },
  {
    key: "utility_losses_water_usage",
    label: "Water Usage",
    icon: "Zap",
    category: "Utility Losses",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Utility Losses - Water Usage",
    description: "Water consumption from utility bills and records.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "source", label: "Item", type: "select", required: true, width: "190px", options: ["Water Usage"] },
      { key: "consumption", label: "Total Volume (from bill)", type: "number", required: true, width: "190px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["m3"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "Meter", "Estimate"] },
    ],
  },
  {
    key: "professional_services_memberships",
    label: "Memberships/Fees",
    icon: "Link",
    category: "Professional Services",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Professional Services - Memberships Fees",
    description: "Annual spend on memberships, subscriptions, and professional fees.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "source", label: "Item", type: "select", required: true, width: "190px", options: ["Memberships/Fees"] },
      { key: "consumption", label: "Total Annual Spend", type: "number", required: true, width: "170px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["INR"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "ERP", "Estimate"] },
    ],
  },
  {
    key: "professional_services_couriers",
    label: "Couriers/Post",
    icon: "Link",
    category: "Professional Services",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Professional Services - Couriers Post",
    description: "Courier and postal shipment activity.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "source", label: "Item", type: "select", required: true, width: "190px", options: ["Couriers/Post"] },
      { key: "consumption", label: "Shipment Activity", type: "number", required: true, width: "150px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["kg.km"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "ERP", "Estimate"] },
    ],
  },
  {
    key: "waste_paper",
    label: "Paper Waste",
    icon: "Link",
    category: "Waste",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Waste - Paper Waste",
    description: "Generated paper waste and disposal treatment.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "activityType", label: "Disposal Method", type: "select", required: true, width: "170px", options: ["Recycled", "Landfill", "Incinerated", "Composted", "Other"] },
      { key: "consumption", label: "Waste Qty", type: "number", required: true, width: "130px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["kg", "Tonnes"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "Weighbridge", "Estimate"] },
    ],
  },
  {
    key: "waste_e_waste",
    label: "E-Waste",
    icon: "Link",
    category: "Waste",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Waste - E-Waste",
    description: "Generated electronic waste and disposal treatment.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "activityType", label: "Disposal Method", type: "select", required: true, width: "170px", options: ["Authorized Recycler", "Landfill", "Stored", "Other"] },
      { key: "consumption", label: "Waste Qty", type: "number", required: true, width: "130px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["kg", "Tonnes", "Units"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "Inventory", "Estimate"] },
    ],
  },
  {
    key: "waste_plastic",
    label: "Plastic Waste",
    icon: "Link",
    category: "Waste",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Waste - Plastic Waste",
    description: "Generated plastic waste and disposal treatment.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "activityType", label: "Disposal Method", type: "select", required: true, width: "170px", options: ["Recycled", "Landfill", "Incinerated", "Other"] },
      { key: "consumption", label: "Waste Qty", type: "number", required: true, width: "130px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["kg", "Tonnes"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "Weighbridge", "Estimate"] },
    ],
  },
  {
    key: "waste_food",
    label: "Food Waste",
    icon: "Link",
    category: "Waste",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Waste - Food Waste",
    description: "Generated food waste and disposal treatment.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "activityType", label: "Disposal Method", type: "select", required: true, width: "170px", options: ["Composted", "Landfill", "Animal Feed", "Other"] },
      { key: "consumption", label: "Waste Qty", type: "number", required: true, width: "130px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["kg", "Tonnes"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "Weighbridge", "Estimate"] },
    ],
  },
  {
    key: "waste_battery",
    label: "Battery Waste",
    icon: "Link",
    category: "Waste",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Waste - Battery Waste",
    description: "Generated battery waste and disposal treatment.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "activityType", label: "Disposal Method", type: "select", required: true, width: "170px", options: ["Authorized Recycler", "Stored", "Other"] },
      { key: "consumption", label: "Waste Qty", type: "number", required: true, width: "130px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["kg", "Tonnes", "Units"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "Inventory", "Estimate"] },
    ],
  },
  {
    key: "waste_furniture",
    label: "Furniture Waste",
    icon: "Link",
    category: "Waste",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Waste - Furniture Waste",
    description: "Generated furniture waste and disposal treatment.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "activityType", label: "Disposal Method", type: "select", required: true, width: "170px", options: ["Reused", "Recycled", "Landfill", "Other"] },
      { key: "consumption", label: "Waste Qty", type: "number", required: true, width: "130px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["kg", "Tonnes", "Units"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "Inventory", "Estimate"] },
    ],
  },
  {
    key: "waste_glass",
    label: "Glass Waste",
    icon: "Link",
    category: "Waste",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Waste - Glass Waste",
    description: "Generated glass waste and disposal treatment.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "activityType", label: "Disposal Method", type: "select", required: true, width: "170px", options: ["Recycled", "Landfill", "Other"] },
      { key: "consumption", label: "Waste Qty", type: "number", required: true, width: "130px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["kg", "Tonnes"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "Weighbridge", "Estimate"] },
    ],
  },
];

export const CONSOLIDATED_SERVICE_SECTOR_MODULES = [
  {
    key: "electricity_grid",
    label: "Grid",
    icon: "Zap",
    category: "Electricity",
    scope: "Scope 2",
    scopeKey: "scope2",
    section: "Electricity - Grid",
    description: "Electricity procured from the power grid.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "consumption", label: "Electricity", type: "number", required: true, width: "160px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["kWh", "MWh", "GWh", "Units"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Meter", "Invoice", "EB Bill", "Estimate"] },
    ],
  },
  {
    key: "electricity_renewable",
    label: "Renewable",
    icon: "Zap",
    category: "Electricity",
    scope: "Scope 2",
    scopeKey: "scope2",
    section: "Electricity - Renewable",
    description: "Renewable electricity use (onsite/offsite).",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "activityType", label: "Renewable Type", type: "select", required: true, width: "170px", options: ["Solar", "Wind", "Hydro", "Green Power", "Other"] },
      { key: "consumption", label: "Units", type: "number", required: true, width: "130px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["kWh", "MWh", "GWh", "Units"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Meter", "Invoice", "Certificate", "Estimate"] },
    ],
  },
  {
    key: "electricity_net_metering",
    label: "Net Metering",
    icon: "Zap",
    category: "Electricity",
    scope: "Scope 2",
    scopeKey: "scope2",
    section: "Electricity - Net Metering",
    description: "Grid import/export and renewable-backed net metering records.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "consumption", label: "Total Units", type: "number", required: true, width: "140px", placeholder: "0.00" },
      {
        key: "unit",
        label: "Unit",
        type: "select",
        required: true,
        width: "100px",
        defaultValue: "kWh",
        options: ["kWh"],
      },
      {
        key: "measurementMethod",
        label: "Method",
        type: "select",
        required: true,
        width: "160px",
        defaultValue: "Meter",
        options: ["Meter", "Utility Bill", "Net Meter Statement", "Estimate"],
      },
      { key: "displayEmissionFactor", label: "EF", type: "number", required: false, width: "100px", defaultValue: "0.72", placeholder: "0.72" },
      {
        key: "dataStatus",
        label: "Data Status",
        type: "select",
        required: false,
        width: "140px",
        options: ["Actual", "Estimated", "Provisional", "Final"],
      },
      { key: "totalGenerationKwh", label: "Generation (Renewable)", type: "number", required: false, width: "170px", placeholder: "0.00" },
      { key: "selfConsumptionKwh", label: "Self Consumption", type: "number", required: false, width: "150px", placeholder: "0.00" },
      { key: "exportToGridKwh", label: "Export to Grid", type: "number", required: false, width: "140px", placeholder: "0.00" },
      { key: "importFromGridKwh", label: "Import from Grid", type: "number", required: false, width: "140px", placeholder: "0.00" },
      {
        key: "netMeteringType",
        label: "Net Metering Type",
        type: "select",
        required: false,
        width: "200px",
        defaultValue: "No Renewable (Grid Only)",
        options: [
          "No Renewable (Grid Only)",
          "Net Metering (One-to-One)",
          "Net Billing",
          "Gross Metering",
          "With Renewable Purchases",
        ],
      },
      { key: "renewablePurchasedKwh", label: "Renewable Purchased", type: "number", required: false, width: "170px", placeholder: "0.00" },
    ],
  },
  {
    key: "electricity_diesel_generator",
    label: "Diesel Generator",
    icon: "Flame",
    category: "Electricity",
    scope: "Scope 1",
    scopeKey: "scope1",
    section: "Electricity - Diesel Generator",
    description: "Diesel consumed by generator operations.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "source", label: "Fuel Type", type: "select", required: true, width: "160px", options: ["Diesel", "HSD", "Biodiesel"] },
      { key: "consumption", label: "Fuel Consumed", type: "number", required: true, width: "140px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["Litres", "kL", "Gallons"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Meter", "Invoice", "Estimate"] },
    ],
  },
  {
    key: "travel_personal_vehicle",
    label: "Personal Vehicle",
    icon: "Truck",
    category: "Travel",
    scope: "Scope 1",
    scopeKey: "scope1",
    section: "Travel - Personal Vehicle",
    description: "Employee business travel via personal vehicles.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "activityType", label: "Vehicle Type", type: "select", required: true, width: "150px", options: ["Car", "Two-Wheeler", "SUV", "Other"] },
      { key: "source", label: "Input Method", type: "select", required: true, width: "140px", options: ["Fuel-Based", "Distance-Based"] },
      { key: "consumption", label: "Distance / Fuel", type: "number", required: true, width: "150px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["km", "Miles", "Litres", "Gallons"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "GPS", "Claim", "Estimate"] },
    ],
  },
  {
    key: "travel",
    label: "Travel",
    icon: "Truck",
    category: "Travel",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Travel",
    description: "Employee business travel emissions.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "travelType", label: "Travel Type", type: "select", required: true, width: "160px", options: ["Air Travel", "Railway Travel", "Roadways Travel", "Hotel Stay"] },
      { key: "activityType", label: "Mode/Class/Stay", type: "select", required: false, width: "160px", options: ["Car", "Two-Wheeler", "SUV", "Economy", "Premium Economy", "Business", "First", "Local", "Intercity", "Metro", "High-Speed", "Taxi", "Cab", "Bus", "Hotel", "Guest House", "Serviced Apartment", "Other"] },
      { key: "activityGroup", label: "Route/Rating", type: "select", required: false, width: "140px", options: ["Domestic", "International", "3 Star", "4 Star", "5 Star", "Unrated"] },
      { key: "source", label: "Input Method", type: "select", required: false, width: "140px", options: ["Distance-Based", "Fuel-Based"] },
      { key: "consumption", label: "Distance/Fuel/Nights", type: "number", required: true, width: "160px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["km", "Miles", "Litres", "Gallons", "Night", "Room Night"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Ticket", "Invoice", "Booking", "GPS", "Claim", "Estimate"] },
    ],
  },
  {
    key: "gas_fuel_cooking",
    label: "Cooking Fuels",
    icon: "Flame",
    category: "Gas & Fuel",
    scope: "Scope 1",
    scopeKey: "scope1",
    section: "Gas & Fuel - Cooking Fuels",
    description: "Fuel used for cooking operations.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "source", label: "Fuel Type", type: "select", required: true, width: "160px", options: ["LPG", "PNG", "CNG", "Biogas", "Other"] },
      { key: "consumption", label: "Fuel Consumed", type: "number", required: true, width: "140px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["kg", "Litres", "SCM", "m³"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "Meter", "Estimate"] },
    ],
  },
  {
    key: "gas_fuel_gases",
    label: "Gases",
    icon: "Wind",
    category: "Gas & Fuel",
    scope: "Scope 1",
    scopeKey: "scope1",
    section: "Gas & Fuel - Gases",
    description: "Consumption and leakage of gaseous fuels.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      {
        key: "activityType",
        label: "Equipment Type / Sub-application",
        type: "select",
        required: true,
        width: "260px",
        options: SCOPE1_REFRIGERANT_EQUIPMENT_TYPES,
      },
      {
        key: "source",
        label: "Refrigerant Gases",
        type: "select",
        required: true,
        width: "220px",
        options: SCOPE1_REFRIGERANT_GASES,
      },
      {
        key: "activityGroup",
        label: "Parameter",
        type: "select",
        required: true,
        width: "190px",
        options: SCOPE1_REFRIGERANT_PARAMETERS,
      },
      /* {
        key: "activityCategory",
        label: "Emission Factor (Value)",
        type: "select",
        required: true,
        width: "170px",
        options: SCOPE1_REFRIGERANT_EF_VALUES,
      }, */
      { key: "unit", label: "Unit", type: "select", required: true, width: "120px", options: SCOPE1_REFRIGERANT_UNITS },
      { key: "consumption", label: "Activity Value", type: "number", required: false, width: "140px", placeholder: "0.00" },
      { key: "measurementMethod", label: "Method", type: "select", required: false, width: "120px", options: ["Meter", "Invoice", "Estimate"] },
    ],
  },
  {
    key: "office_supplies_paper",
    label: "Paper (Exam/Audit)",
    icon: "FileText",
    category: "Office Supplies",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Office Supplies - Paper",
    description: "Paper purchased for office operations and assessments.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "source", label: "Item", type: "select", required: true, width: "190px", options: ["Paper (Exam/Audit)"] },
      { key: "consumption", label: "Total Weight Purchased", type: "number", required: true, width: "190px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["kg"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "ERP", "Estimate"] },
    ],
  },
  {
    key: "office_supplies_it_hardware",
    label: "IT Hardware",
    icon: "FileText",
    category: "Office Supplies",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Office Supplies - IT Hardware",
    description: "Laptops/PCs and other IT hardware procured for office use.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "source", label: "Item", type: "select", required: true, width: "190px", options: ["IT Hardware"] },
      { key: "consumption", label: "Number of Laptops/PCs", type: "number", required: true, width: "190px", placeholder: "0" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["unit"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "ERP", "Estimate"] },
    ],
  },
  {
    key: "office_supplies_software_cloud",
    label: "Software/Cloud",
    icon: "FileText",
    category: "Office Supplies",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Office Supplies - Software Cloud",
    description: "Software subscriptions and cloud service spend.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "source", label: "Item", type: "select", required: true, width: "190px", options: ["Software/Cloud"] },
      { key: "consumption", label: "Total Monthly Bill", type: "number", required: true, width: "170px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["INR"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "ERP", "Estimate"] },
    ],
  },
  {
    key: "office_appliances_purchased_items",
    label: "Purchased Items",
    icon: "FileText",
    category: "Office Appliances",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Office Appliances - Purchased Items",
    description: "Purchased office electrical appliances such as inverter batteries and AC units.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "source", label: "Appliance", type: "select", required: true, width: "230px", options: OFFICE_APPLIANCE_PURCHASED_ITEMS },
      { key: "consumption", label: "Quantity Purchased", type: "number", required: true, width: "180px", placeholder: "0" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["unit"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "ERP", "Estimate"] },
    ],
  },
  {
    key: "utility_losses",
    label: "Utility Losses",
    icon: "Zap",
    category: "Utility Losses",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Utility Losses",
    description: "Utility and resource losses.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "lossType", label: "Type", type: "select", required: true, width: "190px", options: ["Grid T&D Losses", "Water Usage"] },
      { key: "consumption", label: "Total Volume/Electricity", type: "number", required: true, width: "200px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["kWh", "m³"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["EB Bill", "Invoice", "Meter", "Estimate"] },
    ],
  },
  {
    key: "professional_services",
    label: "Professional Services",
    icon: "Link",
    category: "Professional Services",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Professional Services",
    description: "Annual spend on memberships, subscriptions, professional fees and shipments.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "serviceType", label: "Type", type: "select", required: true, width: "190px", options: ["Memberships/Fees", "Couriers/Post"] },
      { key: "consumption", label: "Total Spend / Activity", type: "number", required: true, width: "180px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["INR", "kg.km"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "ERP", "Estimate"] },
    ],
  },
  {
    key: "waste",
    label: "Waste",
    icon: "Link",
    category: "Waste",
    scope: "Scope 3",
    scopeKey: "scope3",
    section: "Waste",
    description: "Generated waste and disposal treatment.",
    columns: [
      { key: "date", label: "Date", type: "date", required: true, width: "130px" },
      { key: "wasteType", label: "Waste Type", type: "select", required: true, width: "160px", options: ["Paper Waste", "E-Waste", "Plastic Waste", "Food Waste", "Battery Waste", "Furniture Waste", "Glass Waste"] },
      { key: "activityType", label: "Disposal Method", type: "select", required: true, width: "170px", options: ["Recycled", "Authorized Recycler", "Landfill", "Incinerated", "Composted", "Stored", "Reused", "Animal Feed", "Other"] },
      { key: "consumption", label: "Waste Qty", type: "number", required: true, width: "130px", placeholder: "0.00" },
      { key: "unit", label: "Unit", type: "select", required: true, width: "110px", options: ["kg", "Tonnes", "Units"] },
      { key: "measurementMethod", label: "Method", type: "select", required: true, width: "120px", options: ["Invoice", "Weighbridge", "Inventory", "Estimate"] },
    ],
  },
];

// ─── Asset-category → module mapping ─────────────────────────────────────────
// Which infrastructure node categories are relevant to each module.
export const MODULE_ASSET_CATEGORIES = {
  stationary_combustion: new Set([
    "Boiler",
    "Furnace",
    "Reheating Furnace",
    "Induction Furnace",
    "Kiln",
    "Oven",
    "Heater",
    "Incinerator",
    "Flare Stack",
    "Fuel Storage",
    "Generator",
    "Diesel Generator",
    "Biogas Plant",
    "Biomass Unit",
    "CHP / Cogeneration",
    "Captive Power Plant",
    "HVAC System",
    "Heat Treatment",
  ]),
  electrical_power: new Set([
    "Power Grid",
    "Transformer",
    "Substation",
    "Inverter",
    "Solar Panel Array",
    "Wind Turbine",
    "Battery Storage",
    "Smart Meter",
    "Motor",
    "Electricity Output",
    "Consumption Point",
    "Turbine",
    "Steam Turbine",
    "Rolling Mill",
    "Forging Press",
    "Casting Machine",
    "Continuous Caster",
    "Cooling Tower",
    "Chiller",
    "Compressor",
    "Pump",
    "Conveyor",
    "Water Treatment Plant",
    "Effluent Treatment Plant",
    "Machining",
    "Shearing",
  ]),
  production_activity: null, // show all assets
  logistics_transportation: new Set(["Vehicle", "Dispatch"]),
  scope3_value_chain: new Set(["Raw Material Storage", "Warehouse", "Packaging", "Dispatch"]),
  process_fugitive: new Set(["Boiler", "Furnace", "Reheating Furnace", "Induction Furnace", "Kiln", "Incinerator", "Flare Stack", "Cooling Tower", "Chiller", "HVAC System", "Compressor"]),
  electricity_grid: new Set(["Power Grid", "Transformer", "Substation", "Smart Meter", "Consumption Point"]),
  electricity_renewable: new Set(["Solar Panel Array", "Wind Turbine", "Inverter", "Battery Storage"]),
  electricity_net_metering: new Set(["Power Grid", "Smart Meter", "Transformer", "Substation", "Solar Panel Array", "Inverter", "Battery Storage", "Consumption Point"]),
  electricity_diesel_generator: new Set(["Generator", "Diesel Generator"]),
};

// Fuel options contextualised by asset category on the canvas
export const ASSET_FUEL_CONTEXT = {
  Boiler: ["Natural Gas", "Furnace Oil", "Coal IND", "Coal IMP", "Diesel", "Biomass", "Bagasse", "LPG"],
  Furnace: ["Natural Gas", "Coal IND", "Coal IMP", "Furnace Oil", "Pet Coke", "LPG"],
  "Reheating Furnace": ["Natural Gas", "Furnace Oil", "LPG"],
  "Induction Furnace": ["Natural Gas", "LPG"],
  Kiln: ["Coal IND", "Coal IMP", "Pet Coke", "Natural Gas", "Wood", "Biomass", "Rice Husk"],
  Oven: ["Natural Gas", "LPG", "Diesel"],
  Heater: ["Natural Gas", "LPG", "Furnace Oil", "Diesel"],
  Incinerator: ["Diesel", "Natural Gas", "Biomass"],
  "Flare Stack": ["Natural Gas"],
  Generator: ["Diesel", "Natural Gas", "HSD"],
  "Diesel Generator": ["Diesel", "HSD"],
  "Biogas Plant": ["Biomass", "Bagasse"],
  "Biomass Unit": ["Biomass", "Wood", "Bagasse", "Rice Husk"],
  "CHP / Cogeneration": ["Natural Gas", "Coal IND", "Coal IMP", "Biomass"],
  "Captive Power Plant": ["Coal IND", "Coal IMP", "Natural Gas", "Diesel", "Furnace Oil"],
  "HVAC System": ["Natural Gas", "LPG", "Diesel"],
  "Heat Treatment": ["Natural Gas", "LPG", "Furnace Oil"],
  "Fuel Storage": ["Diesel", "Furnace Oil", "HSD", "LPG", "Petrol", "Kerosene"],
  Vehicle: ["Diesel", "Petrol", "CNG", "LPG"],
};

/**
 * Get a module config by key
 */
export const getModuleByKey = (key, moduleSet = MODULES) => moduleSet.find((m) => m.key === key);

/**
 * Build an empty entry object for a given module
 */
export const buildEmptyEntry = (moduleKey, moduleSet = MODULES) => {
  const mod = getModuleByKey(moduleKey, moduleSet);
  if (!mod) return {};
  const entry = { status: "draft" };
  mod.columns.forEach((col) => {
    if (Object.prototype.hasOwnProperty.call(col, "defaultValue")) {
      entry[col.key] = col.defaultValue;
    } else if (col.type === "date") {
      entry[col.key] = "";
    } else if (col.type === "number") {
      entry[col.key] = "";
    } else {
      entry[col.key] = "";
    }
  });
  entry.supportingDocument = null;
  return entry;
};

/**
 * Build a submission payload from a module entry for the existing submissions API
 */
export const buildModuleSubmissionPayload = (entry, module, facilityId, selectedPeriod) => {
  const scope = module.scope || "Scope 1";
  const scopeKey = module.scopeKey || "scope1";

  const knownSourceKeys = new Set([
    "source",
    "consumption",
    "unit",
    "measurementMethod",
    "date",
    "supportingDocument",
    "gcv",
    "gcvUnit",
    "assetEfficiency",
    "assetId",
    "emissionFactor",
    "carbonContent",
    "operatingHours",
    "capacityUtilization",
    "refillAmount",
    "energyContentFossil",
    "energyContentBio",
    "oxidationFactor",
    "conversionFactor",
  ]);

  const additionalSourceFields = {};
  (module.columns || []).forEach((col) => {
    if (knownSourceKeys.has(col.key)) return;
    const value = entry[col.key];
    if (value !== undefined && value !== null && value !== "") {
      additionalSourceFields[col.key] = value;
    }
  });

  const scopeData = {
    reportingYear: new Date().getFullYear().toString(),
    reportingPeriod: selectedPeriod || "",
    module: module.key,
    sections: [
      {
        name: module.section,
        activities: [
          {
            activityType: entry.activityType || module.section,
            activityGroup: entry.activityGroup || "",
            activityCategory: entry.activityCategory || "",
            sources: [
              {
                source: entry.source || "",
                consumption: entry.consumption || "",
                unit: entry.unit || "",
                measurementMethod: entry.measurementMethod || "",
                date: entry.date || new Date().toISOString().split("T")[0],
                supportingDocument:
                  entry.supportingDocument instanceof File
                    ? {
                        uploadKey: `supportingDocument_${scopeKey}_0_0_0`,
                        originalName: entry.supportingDocument.name,
                      }
                    : entry.supportingDocument,
                // Module-specific extra fields stored alongside source
                ...(entry.gcv !== undefined && entry.gcv !== "" ? { gcv: entry.gcv } : {}),
                ...(entry.gcvUnit ? { gcvUnit: entry.gcvUnit } : {}),
                ...(entry.assetEfficiency !== undefined && entry.assetEfficiency !== "" ? { assetEfficiency: entry.assetEfficiency } : {}),
                ...(entry.assetId ? { assetId: entry.assetId } : {}),
                ...(entry.emissionFactor !== undefined && entry.emissionFactor !== "" ? { emissionFactor: entry.emissionFactor } : {}),
                ...(entry.carbonContent !== undefined && entry.carbonContent !== "" ? { carbonContent: entry.carbonContent } : {}),
                ...(entry.operatingHours !== undefined && entry.operatingHours !== "" ? { operatingHours: entry.operatingHours } : {}),
                ...(entry.capacityUtilization !== undefined && entry.capacityUtilization !== "" ? { capacityUtilization: entry.capacityUtilization } : {}),
                ...(entry.refillAmount !== undefined && entry.refillAmount !== "" ? { refillAmount: entry.refillAmount } : {}),
                ...(entry.energyContentFossil !== undefined && entry.energyContentFossil !== "" ? { energyContentFossil: entry.energyContentFossil } : {}),
                ...(entry.energyContentBio !== undefined && entry.energyContentBio !== "" ? { energyContentBio: entry.energyContentBio } : {}),
                ...(entry.oxidationFactor !== undefined && entry.oxidationFactor !== "" ? { oxidationFactor: entry.oxidationFactor } : {}),
                ...(entry.conversionFactor !== undefined && entry.conversionFactor !== "" ? { conversionFactor: entry.conversionFactor } : {}),
                ...additionalSourceFields,
              },
            ],
          },
        ],
      },
    ],
  };

  const payload = new FormData();
  if (facilityId) payload.append("facilityId", facilityId);
  if (entry.submissionId) payload.append("submissionId", entry.submissionId);
  payload.append("scope", scope);
  payload.append(`${scopeKey}Data`, JSON.stringify(scopeData));

  const uploadKey = `supportingDocument_${scopeKey}_0_0_0`;
  if (entry.supportingDocument instanceof File) {
    payload.append(uploadKey, entry.supportingDocument);
  }

  return payload;
};

/**
 * Extract module entries from a hydrated submission
 */
export const extractModuleEntries = (submission, moduleSet = MODULES) => {
  const entries = [];
  const payloads = [
    { scope: "Scope 1", scopeKey: "scope1", data: submission.scope1Data },
    { scope: "Scope 2", scopeKey: "scope2", data: submission.scope2Data },
    { scope: "Scope 3", scopeKey: "scope3", data: submission.scope3Data },
  ];

  const knownSourceKeys = new Set([
    "source",
    "consumption",
    "unit",
    "measurementMethod",
    "date",
    "supportingDocument",
    "gcv",
    "gcvUnit",
    "assetEfficiency",
    "assetId",
    "emissionFactor",
    "carbonContent",
    "operatingHours",
    "capacityUtilization",
    "refillAmount",
    "energyContentFossil",
    "energyContentBio",
    "oxidationFactor",
    "conversionFactor",
  ]);

  payloads.forEach(({ scope, scopeKey, data }) => {
    if (!data?.sections?.length) return;
    const bulkFlag = isBulkData(data);
    data.sections.forEach((section, sectionIndex) => {
      const sectionName = section?.name || "";
      // Find which module this section belongs to
      const mod = moduleSet.find((m) => m.section === sectionName) || null;
      const payloadModule = data?.module || "";
      const moduleFromPayload = moduleSet.find((m) => m.key === payloadModule)?.key || null;
      const moduleKey = mod?.key || moduleFromPayload || inferModuleFromScope(scope, sectionName);
      const bulkKeySuffix = moduleKey || sectionName || scopeKey;
      const bulkKey = bulkFlag ? `${submission._id}-${scopeKey}-${bulkKeySuffix}` : null;

      section.activities?.forEach((activity, activityIndex) => {
        activity.sources?.forEach((source, sourceIndex) => {
          const hasConsumption = source?.consumption !== undefined && source?.consumption !== null && source?.consumption !== "";
          const hasActivityType = activity.activityType !== undefined && activity.activityType !== null && activity.activityType !== "";
          const customSourceFields = Object.entries(source || {}).reduce((acc, [key, value]) => {
            if (knownSourceKeys.has(key)) return acc;
            if (value === undefined || value === null || value === "") return acc;
            acc[key] = value;
            return acc;
          }, {});

          if (hasConsumption || source?.source || Object.keys(customSourceFields).length > 0 || hasActivityType) {
            entries.push({
              id: `${submission._id}_${scopeKey}_${sectionIndex}_${activityIndex}_${sourceIndex}`,
              module: moduleKey,
              scope,
              scopeKey,
              date: source.date ? new Date(source.date).toISOString().split("T")[0] : new Date(submission.createdAt).toISOString().split("T")[0],
              activityType: activity.activityType || "",
              activityGroup: activity.activityGroup || "",
              activityCategory: activity.activityCategory || "",
              source: source.source || "",
              consumption: source.consumption || "",
              unit: source.unit || "",
              measurementMethod: source.measurementMethod || "",
              // Module-specific fields
              gcv: source.gcv || "",
              gcvUnit: source.gcvUnit || "",
              assetEfficiency: source.assetEfficiency || "",
              assetId: source.assetId || "",
              emissionFactor: source.emissionFactor || "",
              carbonContent: source.carbonContent || "",
              operatingHours: source.operatingHours || "",
              capacityUtilization: source.capacityUtilization || "",
              refillAmount: source.refillAmount || "",
              energyContentFossil: source.energyContentFossil || "",
              energyContentBio: source.energyContentBio || "",
              oxidationFactor: source.oxidationFactor || "",
              conversionFactor: source.conversionFactor || "",
              // Metadata
              isBulk: bulkFlag,
              bulkKey,
              importBatchId: data?.importBatchId || data?.importedAt || null,
              status: submission.status || "draft",
              rejectionReason: submission.rejectionReason || "",
              submissionId: submission._id,
              supportingDocument: source.supportingDocument,
              sectionIndex,
              activityIndex,
              sourceIndex,
              ...customSourceFields,
            });
          }
        });
      });
    });
  });

  return entries;
};

/**
 * Infer module key from scope and section name when not explicitly set
 */
const inferModuleFromScope = (scope, sectionName) => {
  const lower = (sectionName || "").toLowerCase();
  if (lower.includes("diesel generator")) return "electricity_diesel_generator";
  if (lower.includes("net metering")) return "electricity_net_metering";
  if (lower.includes("renewable")) return "electricity_renewable";
  if (lower.includes("grid")) return "electricity_grid";
  if (lower.includes("travel") && lower.includes("air")) return "travel_air";
  if (lower.includes("travel") && (lower.includes("hotel") || lower.includes("stay"))) return "travel_hotel_stay";
  if (lower.includes("travel") && (lower.includes("rail") || lower.includes("railway"))) return "travel_railway";
  if (lower.includes("travel") && (lower.includes("road") || lower.includes("roadways"))) return "travel_roadways";
  if (lower.includes("travel") && (lower.includes("personal") || lower.includes("vehicle"))) return "travel_personal_vehicle";
  if (lower.includes("gas") && lower.includes("cooking")) return "gas_fuel_cooking";
  if (lower.includes("gas") && lower.includes("fuel") && lower.includes("gase")) return "gas_fuel_gases";
  if (lower.includes("office supplies") && lower.includes("paper")) return "office_supplies_paper";
  if (lower.includes("office supplies") && lower.includes("hardware")) return "office_supplies_it_hardware";
  if (lower.includes("office supplies") && (lower.includes("software") || lower.includes("cloud"))) return "office_supplies_software_cloud";
  if (lower.includes("office appliance") && lower.includes("purchased")) return "office_appliances_purchased_items";
  if (lower.includes("office appliance")) return "office_appliances_purchased_items";
  if (lower.includes("utility") && lower.includes("grid") && (lower.includes("t&d") || lower.includes("loss"))) return "utility_losses_grid_td";
  if (lower.includes("utility") && lower.includes("water")) return "utility_losses_water_usage";
  if (lower.includes("professional") && (lower.includes("membership") || lower.includes("fees"))) return "professional_services_memberships";
  if (lower.includes("professional") && (lower.includes("courier") || lower.includes("post"))) return "professional_services_couriers";
  if (lower.includes("paper waste")) return "waste_paper";
  if (lower.includes("e-waste") || lower.includes("ewaste")) return "waste_e_waste";
  if (lower.includes("plastic waste")) return "waste_plastic";
  if (lower.includes("food waste")) return "waste_food";
  if (lower.includes("battery waste")) return "waste_battery";
  if (lower.includes("furniture waste")) return "waste_furniture";
  if (lower.includes("glass waste")) return "waste_glass";
  if (lower.includes("stationary") || lower.includes("combustion")) return "stationary_combustion";
  if (lower.includes("electric") || lower.includes("power")) return "electrical_power";
  if (lower.includes("production")) return "production_activity";
  if (lower.includes("logistics") || lower.includes("transport")) return "logistics_transportation";
  if (lower.includes("value chain") || lower.includes("scope 3")) return "scope3_value_chain";
  if (lower.includes("process") || lower.includes("fugitive") || lower.includes("fugutive")) return "process_fugitive";

  // Fallback based on scope
  if (scope === "Scope 2") return "electrical_power";
  if (scope === "Scope 3") return "scope3_value_chain";
  return "stationary_combustion";
};
