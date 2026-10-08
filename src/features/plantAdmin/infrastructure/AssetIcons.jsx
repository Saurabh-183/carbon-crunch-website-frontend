import React from "react";

/**
 * Beautiful hand-crafted SVG industrial icons for the Infrastructure Canvas.
 * Each icon is a 48×48 SVG with detailed industrial illustration style.
 */

const S = ({ children, ...props }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {children}
  </svg>
);

// ─── Storage ────────────────────────────────────────────────────────────────

export const RawMaterialStorageIcon = (props) => (
  <S {...props}>
    <rect x="8" y="18" width="32" height="22" rx="2" fill="#C4B5FD" stroke="#7C3AED" strokeWidth="1.5" />
    <rect x="8" y="14" width="32" height="6" rx="2" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="1.5" />
    <path d="M16 22v14M24 22v14M32 22v14" stroke="#7C3AED" strokeWidth="1" opacity="0.4" />
    <rect x="14" y="26" width="6" height="4" rx="1" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="0.8" />
    <rect x="28" y="26" width="6" height="4" rx="1" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="0.8" />
    <rect x="14" y="33" width="6" height="4" rx="1" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="0.8" />
    <rect x="28" y="33" width="6" height="4" rx="1" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="0.8" />
    <path d="M20 8l4-4 4 4" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24 4v10" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" />
  </S>
);

export const FuelStorageIcon = (props) => (
  <S {...props}>
    <ellipse cx="24" cy="36" rx="14" ry="4" fill="#FCD34D" opacity="0.3" />
    <rect x="12" y="12" width="24" height="24" rx="12" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
    <rect x="15" y="15" width="18" height="18" rx="9" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" />
    <path d="M22 20c0 0-3 3-3 5a3 3 0 006 0c0-2-3-5-3-5z" fill="#F59E0B" stroke="#D97706" strokeWidth="0.8" />
    <rect x="20" y="8" width="8" height="6" rx="2" fill="#D97706" stroke="#92400E" strokeWidth="1" />
    <circle cx="24" cy="11" r="1.5" fill="#FEF3C7" />
  </S>
);

export const WarehouseIcon = (props) => (
  <S {...props}>
    <path d="M6 22L24 10l18 12" fill="#818CF8" stroke="#4F46E5" strokeWidth="1.5" strokeLinejoin="round" />
    <rect x="8" y="22" width="32" height="18" fill="#C7D2FE" stroke="#4F46E5" strokeWidth="1.5" />
    <rect x="18" y="28" width="12" height="12" rx="1" fill="#6366F1" stroke="#4F46E5" strokeWidth="1" />
    <path d="M24 28v12" stroke="#4F46E5" strokeWidth="1" opacity="0.5" />
    <rect x="11" y="26" width="5" height="5" rx="0.5" fill="#E0E7FF" stroke="#6366F1" strokeWidth="0.8" />
    <rect x="32" y="26" width="5" height="5" rx="0.5" fill="#E0E7FF" stroke="#6366F1" strokeWidth="0.8" />
    <rect x="11" y="33" width="5" height="5" rx="0.5" fill="#E0E7FF" stroke="#6366F1" strokeWidth="0.8" />
    <rect x="32" y="33" width="5" height="5" rx="0.5" fill="#E0E7FF" stroke="#6366F1" strokeWidth="0.8" />
  </S>
);

// ─── Thermal / Combustion ───────────────────────────────────────────────────

export const BoilerIcon = (props) => (
  <S {...props}>
    <rect x="10" y="16" width="28" height="22" rx="3" fill="#FECACA" stroke="#DC2626" strokeWidth="1.5" />
    <rect x="13" y="19" width="22" height="16" rx="2" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1" />
    <circle cx="19" cy="27" r="3" fill="#EF4444" opacity="0.6" />
    <circle cx="29" cy="27" r="3" fill="#EF4444" opacity="0.6" />
    <path d="M24 19v-5M20 19v-3M28 19v-3" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
    {/* Steam wisps */}
    <path d="M20 12c0-2 2-3 2-5" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <path d="M24 10c0-2 2-3 2-5" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <path d="M28 12c0-2 2-3 2-5" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <rect x="10" y="36" width="6" height="4" rx="1" fill="#DC2626" />
    <rect x="32" y="36" width="6" height="4" rx="1" fill="#DC2626" />
  </S>
);

export const FurnaceIcon = (props) => (
  <S {...props}>
    <path d="M10 40V16a4 4 0 014-4h20a4 4 0 014 4v24" fill="#FECACA" stroke="#DC2626" strokeWidth="1.5" />
    <rect x="14" y="20" width="20" height="14" rx="2" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1" />
    {/* Fire */}
    <path d="M20 30c0-3 4-6 4-9 0 3 4 6 4 9a4 4 0 01-8 0z" fill="#F97316" stroke="#EA580C" strokeWidth="0.8" />
    <path d="M22 30c0-2 2-3 2-5 0 2 2 3 2 5a2 2 0 01-4 0z" fill="#FBBF24" />
    <rect x="14" y="36" width="20" height="4" rx="1" fill="#B91C1C" stroke="#DC2626" strokeWidth="0.8" />
    <path d="M18 12v-4M24 12v-6M30 12v-4" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
  </S>
);

export const ReheatingFurnaceIcon = (props) => (
  <S {...props}>
    <rect x="6" y="18" width="36" height="20" rx="3" fill="#FECACA" stroke="#B91C1C" strokeWidth="1.5" />
    <rect x="10" y="22" width="28" height="12" rx="2" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1" />
    {/* Multiple flames */}
    <path d="M16 32c0-2 2-4 2-6 0 2 2 4 2 6a2 2 0 01-4 0z" fill="#EF4444" />
    <path d="M22 32c0-2 2-4 2-6 0 2 2 4 2 6a2 2 0 01-4 0z" fill="#F97316" />
    <path d="M28 32c0-2 2-4 2-6 0 2 2 4 2 6a2 2 0 01-4 0z" fill="#EF4444" />
    {/* Input/output arrows */}
    <path d="M2 28h6M40 28h6" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 26l-3 2 3 2M42 26l3 2-3 2" stroke="#B91C1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 14v-4M24 14v-6M28 14v-4" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
  </S>
);

export const InductionFurnaceIcon = (props) => (
  <S {...props}>
    <rect x="12" y="14" width="24" height="26" rx="4" fill="#FECACA" stroke="#DC2626" strokeWidth="1.5" />
    {/* Coil */}
    <path d="M16 20h16M16 25h16M16 30h16M16 35h16" stroke="#B91C1C" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    {/* Lightning bolts */}
    <path d="M22 16l-2 6h4l-2 6" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M28 16l-2 6h4l-2 6" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Glow */}
    <circle cx="24" cy="27" r="5" fill="#FCD34D" opacity="0.25" />
    <path d="M18 10l-2-4M24 10v-6M30 10l2-4" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
  </S>
);

export const KilnIcon = (props) => (
  <S {...props}>
    <ellipse cx="24" cy="30" rx="16" ry="8" fill="#FECACA" stroke="#DC2626" strokeWidth="1.5" />
    <rect x="8" y="16" width="32" height="14" rx="3" fill="#FCA5A5" stroke="#DC2626" strokeWidth="1.5" />
    <circle cx="18" cy="23" r="3" fill="#EF4444" opacity="0.5" />
    <circle cx="30" cy="23" r="3" fill="#EF4444" opacity="0.5" />
    <path d="M22 14c0-2 2-4 2-6 0 2 2 4 2 6" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="8" y="36" width="32" height="4" rx="1" fill="#B91C1C" />
  </S>
);

export const OvenIcon = (props) => (
  <S {...props}>
    <rect x="10" y="12" width="28" height="28" rx="3" fill="#FFEDD5" stroke="#EA580C" strokeWidth="1.5" />
    <rect x="14" y="16" width="20" height="10" rx="2" fill="#FEF3C7" stroke="#F97316" strokeWidth="1" />
    <rect x="14" y="30" width="20" height="6" rx="1" fill="#FEF3C7" stroke="#F97316" strokeWidth="1" />
    <path d="M20 22c0-1.5 1.5-3 1.5-4.5M24 22c0-1.5 1.5-3 1.5-4.5M28 22c0-1.5 1.5-3 1.5-4.5" stroke="#F97316" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    <circle cx="24" cy="33" r="1.5" fill="#F97316" />
    <rect x="22" y="8" width="4" height="4" rx="1" fill="#EA580C" />
  </S>
);

export const HeaterIcon = (props) => (
  <S {...props}>
    <rect x="14" y="10" width="20" height="30" rx="3" fill="#FFEDD5" stroke="#EA580C" strokeWidth="1.5" />
    {/* Heating elements */}
    <path d="M18 16h12M18 22h12M18 28h12M18 34h12" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
    <circle cx="18" cy="16" r="1" fill="#EF4444" />
    <circle cx="30" cy="16" r="1" fill="#EF4444" />
    <circle cx="18" cy="22" r="1" fill="#EF4444" />
    <circle cx="30" cy="22" r="1" fill="#EF4444" />
    <circle cx="18" cy="28" r="1" fill="#F97316" />
    <circle cx="30" cy="28" r="1" fill="#F97316" />
    {/* Heat waves */}
    <path d="M12 18c-2 0-3-2-3-4M36 18c2 0 3-2 3-4" stroke="#F97316" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
  </S>
);

export const IncineratorIcon = (props) => (
  <S {...props}>
    <rect x="14" y="20" width="20" height="20" rx="2" fill="#FECACA" stroke="#991B1B" strokeWidth="1.5" />
    <path d="M14 26h20" stroke="#991B1B" strokeWidth="1" opacity="0.3" />
    {/* Big flame */}
    <path d="M19 36c0-4 5-8 5-12 0 4 5 8 5 12a5 5 0 01-10 0z" fill="#EF4444" stroke="#B91C1C" strokeWidth="0.8" />
    <path d="M21.5 36c0-2 2.5-4 2.5-6 0 2 2.5 4 2.5 6a2.5 2.5 0 01-5 0z" fill="#FCD34D" />
    {/* Chimney */}
    <rect x="20" y="6" width="8" height="14" rx="1" fill="#7F1D1D" stroke="#991B1B" strokeWidth="1" />
    <path d="M22 4c0-1 1-2 1-3M26 4c0-1 1-2 1-3" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
  </S>
);

export const FlareStackIcon = (props) => (
  <S {...props}>
    {/* Stack */}
    <path d="M22 40V18h4v22" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
    <path d="M18 40l4-22M30 40l-4-22" stroke="#64748B" strokeWidth="1" opacity="0.3" />
    {/* Base */}
    <rect x="14" y="38" width="20" height="4" rx="1" fill="#64748B" />
    {/* Flame */}
    <path d="M20 18c0-4 4-7 4-11 0 4 4 7 4 11a4 4 0 01-8 0z" fill="#F97316" stroke="#EA580C" strokeWidth="0.8" />
    <path d="M22 18c0-2 2-4 2-6 0 2 2 4 2 6a2 2 0 01-4 0z" fill="#FCD34D" />
    <path d="M23 7c-1-2-3-3-5-3M25 7c1-2 3-3 5-3" stroke="#F97316" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
  </S>
);

// ─── Processing ─────────────────────────────────────────────────────────────

export const RollingMillIcon = (props) => (
  <S {...props}>
    <rect x="6" y="16" width="36" height="20" rx="2" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5" />
    {/* Rollers */}
    <circle cx="16" cy="22" r="4" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1.5" />
    <circle cx="16" cy="32" r="4" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1.5" />
    <circle cx="32" cy="22" r="4" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1.5" />
    <circle cx="32" cy="32" r="4" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1.5" />
    {/* Material strip */}
    <rect x="2" y="26" width="44" height="2" rx="1" fill="#F97316" opacity="0.7" />
    {/* Arrows */}
    <path d="M4 27l3-2v4z" fill="#3B82F6" />
    <path d="M44 27l-3-2v4z" fill="#3B82F6" />
  </S>
);

export const ForgingPressIcon = (props) => (
  <S {...props}>
    {/* Frame */}
    <rect x="10" y="8" width="28" height="4" rx="1" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1" />
    <rect x="10" y="36" width="28" height="4" rx="1" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1" />
    <rect x="12" y="12" width="4" height="24" fill="#93C5FD" stroke="#3B82F6" strokeWidth="0.8" />
    <rect x="32" y="12" width="4" height="24" fill="#93C5FD" stroke="#3B82F6" strokeWidth="0.8" />
    {/* Ram */}
    <rect x="18" y="12" width="12" height="10" rx="1" fill="#60A5FA" stroke="#2563EB" strokeWidth="1.5" />
    <path d="M18 22l12 0" stroke="#1D4ED8" strokeWidth="1.5" />
    {/* Workpiece */}
    <rect x="18" y="30" width="12" height="4" rx="1" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
    {/* Arrow */}
    <path d="M24 14v6" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" />
    <path d="M22 18l2 3 2-3" stroke="#1D4ED8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </S>
);

export const CastingMachineIcon = (props) => (
  <S {...props}>
    <rect x="8" y="14" width="32" height="24" rx="3" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5" />
    {/* Mold */}
    <path d="M14 18h20v12H14z" fill="#BFDBFE" stroke="#3B82F6" strokeWidth="1" />
    <path d="M14 24h20" stroke="#3B82F6" strokeWidth="0.8" opacity="0.4" />
    {/* Pouring */}
    <path d="M24 8v10" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
    <path d="M21 8h6" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
    {/* Drip */}
    <circle cx="24" cy="21" r="2" fill="#FBBF24" opacity="0.6" />
    <rect x="8" y="36" width="8" height="4" rx="1" fill="#1D4ED8" />
    <rect x="32" y="36" width="8" height="4" rx="1" fill="#1D4ED8" />
  </S>
);

export const ContinuousCasterIcon = (props) => (
  <S {...props}>
    {/* Tundish */}
    <path d="M14 10h20l-3 8H17z" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
    {/* Mold */}
    <rect x="18" y="18" width="12" height="8" rx="1" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1.5" />
    {/* Strand */}
    <path d="M24 26v4c0 4-8 4-8 8v4" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
    <path d="M20 42h-8" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
    {/* Rollers */}
    <circle cx="20" cy="32" r="2" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1" />
    <circle cx="28" cy="32" r="2" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1" />
  </S>
);

export const LadleIcon = (props) => (
  <S {...props}>
    {/* Ladle body */}
    <path d="M12 14h24l-4 24H16z" fill="#FCD34D" stroke="#D97706" strokeWidth="1.5" />
    {/* Liquid */}
    <path d="M14 18h20" stroke="#F97316" strokeWidth="2" />
    <rect x="15" y="18" width="18" height="6" rx="1" fill="#F97316" opacity="0.4" />
    {/* Handles */}
    <path d="M10 16h4M34 16h4" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
    {/* Hook */}
    <path d="M24 8v6" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="24" cy="7" r="2" fill="none" stroke="#64748B" strokeWidth="1.5" />
    {/* Glow */}
    <circle cx="24" cy="24" r="4" fill="#FCD34D" opacity="0.3" />
  </S>
);

export const MouldingIcon = (props) => (
  <S {...props}>
    {/* Mold halves */}
    <rect x="8" y="12" width="32" height="10" rx="2" fill="#C7D2FE" stroke="#4F46E5" strokeWidth="1.5" />
    <rect x="8" y="26" width="32" height="10" rx="2" fill="#A5B4FC" stroke="#4F46E5" strokeWidth="1.5" />
    {/* Cavity */}
    <path d="M16 22h16v4H16z" fill="#6366F1" opacity="0.3" />
    <path d="M20 22v4M28 22v4" stroke="#4F46E5" strokeWidth="0.8" opacity="0.4" />
    {/* Parting line */}
    <path d="M8 24h32" stroke="#4F46E5" strokeWidth="1" strokeDasharray="3 2" />
    {/* Pouring sprue */}
    <rect x="22" y="6" width="4" height="6" rx="1" fill="#818CF8" stroke="#4F46E5" strokeWidth="0.8" />
    <rect x="12" y="38" width="8" height="3" rx="1" fill="#4F46E5" />
    <rect x="28" y="38" width="8" height="3" rx="1" fill="#4F46E5" />
  </S>
);

export const MachiningIcon = (props) => (
  <S {...props}>
    {/* Machine body */}
    <rect x="8" y="20" width="32" height="18" rx="2" fill="#F1F5F9" stroke="#475569" strokeWidth="1.5" />
    {/* Spindle */}
    <rect x="20" y="10" width="8" height="14" rx="1" fill="#94A3B8" stroke="#64748B" strokeWidth="1" />
    {/* Tool */}
    <path d="M24 24v8" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M21 24h6" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
    {/* Workpiece */}
    <rect x="16" y="32" width="16" height="4" rx="1" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
    {/* Chips */}
    <circle cx="14" cy="30" r="1" fill="#94A3B8" opacity="0.5" />
    <circle cx="34" cy="28" r="1" fill="#94A3B8" opacity="0.5" />
    <rect x="8" y="38" width="32" height="3" rx="1" fill="#475569" />
  </S>
);

export const ShearingIcon = (props) => (
  <S {...props}>
    {/* Frame */}
    <rect x="10" y="10" width="28" height="28" rx="2" fill="#F1F5F9" stroke="#475569" strokeWidth="1.5" />
    {/* Blade top */}
    <path d="M14 18l20-4v4H14z" fill="#94A3B8" stroke="#64748B" strokeWidth="1" />
    {/* Blade bottom */}
    <rect x="14" y="28" width="20" height="3" rx="0.5" fill="#64748B" />
    {/* Material */}
    <rect x="6" y="24" width="36" height="3" rx="1" fill="#F97316" opacity="0.6" />
    {/* Cut line */}
    <path d="M26 18v13" stroke="#DC2626" strokeWidth="1" strokeDasharray="2 2" />
    <rect x="10" y="38" width="28" height="3" rx="1" fill="#475569" />
  </S>
);

// ─── Heat Treatment ─────────────────────────────────────────────────────────

export const HeatTreatmentIcon = (props) => (
  <S {...props}>
    <rect x="8" y="14" width="32" height="24" rx="3" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
    <rect x="12" y="18" width="24" height="16" rx="2" fill="#FFEDD5" stroke="#F59E0B" strokeWidth="1" />
    {/* Temperature gauge */}
    <rect x="34" y="16" width="6" height="14" rx="3" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
    <rect x="35.5" y="22" width="3" height="7" rx="1.5" fill="#EF4444" />
    {/* Heating elements */}
    <path d="M16 30c2-2 4 2 6 0 2-2 4 2 6 0" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 26c2-2 4 2 6 0 2-2 4 2 6 0" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    {/* Workpiece */}
    <rect x="18" y="20" width="10" height="4" rx="1" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
  </S>
);

export const CoolingBedIcon = (props) => (
  <S {...props}>
    <rect x="6" y="22" width="36" height="14" rx="2" fill="#CFFAFE" stroke="#0891B2" strokeWidth="1.5" />
    {/* Bars on cooling bed */}
    <rect x="10" y="18" width="28" height="4" rx="1" fill="#E0F2FE" stroke="#06B6D4" strokeWidth="0.8" />
    <rect x="10" y="24" width="4" height="10" rx="0.5" fill="#F97316" opacity="0.5" />
    <rect x="18" y="24" width="4" height="10" rx="0.5" fill="#F97316" opacity="0.4" />
    <rect x="26" y="24" width="4" height="10" rx="0.5" fill="#F97316" opacity="0.3" />
    <rect x="34" y="24" width="4" height="10" rx="0.5" fill="#F97316" opacity="0.2" />
    {/* Cool air */}
    <path d="M14 14l-2-3M24 12v-4M34 14l2-3" stroke="#06B6D4" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <rect x="6" y="36" width="36" height="3" rx="1" fill="#0891B2" />
  </S>
);

export const QuenchingIcon = (props) => (
  <S {...props}>
    {/* Tank */}
    <rect x="10" y="16" width="28" height="22" rx="2" fill="#CFFAFE" stroke="#0891B2" strokeWidth="1.5" />
    {/* Water */}
    <path d="M10 22c4 2 8-2 14 0 6 2 10-2 14 0v16H10z" fill="#67E8F9" opacity="0.5" />
    {/* Workpiece being dipped */}
    <rect x="20" y="12" width="8" height="16" rx="1" fill="#F97316" stroke="#EA580C" strokeWidth="1" />
    {/* Bubbles */}
    <circle cx="16" cy="30" r="1.5" fill="white" opacity="0.6" />
    <circle cx="32" cy="28" r="1" fill="white" opacity="0.6" />
    <circle cx="28" cy="34" r="1.5" fill="white" opacity="0.5" />
    {/* Steam */}
    <path d="M18 12c-1-2-2-3-1-5M30 12c1-2 2-3 1-5" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
  </S>
);

// ─── Power & Electrical ─────────────────────────────────────────────────────

export const TurbineIcon = (props) => (
  <S {...props}>
    {/* Housing */}
    <circle cx="24" cy="24" r="14" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5" />
    <circle cx="24" cy="24" r="10" fill="#ECFDF5" stroke="#10B981" strokeWidth="1" />
    {/* Blades */}
    <path d="M24 14l3 10-3-3-3 3z" fill="#10B981" />
    <path d="M34 24l-10 3 3-3-3-3z" fill="#10B981" />
    <path d="M24 34l-3-10 3 3 3-3z" fill="#10B981" />
    <path d="M14 24l10-3-3 3 3 3z" fill="#10B981" />
    {/* Center */}
    <circle cx="24" cy="24" r="3" fill="#059669" />
    <circle cx="24" cy="24" r="1.5" fill="#D1FAE5" />
    {/* Shaft */}
    <path d="M38 24h6" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
  </S>
);

export const SteamTurbineIcon = (props) => (
  <S {...props}>
    {/* Casing */}
    <path d="M10 18h28l4 6-4 6H10l-4-6z" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5" />
    {/* Blades */}
    <path d="M18 18v12M22 18v12M26 18v12M30 18v12M34 18v12" stroke="#10B981" strokeWidth="1.5" opacity="0.5" />
    {/* Steam in */}
    <path d="M4 24h6" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 22l3 2-3 2" stroke="#EF4444" strokeWidth="1" strokeLinecap="round" />
    {/* Shaft out */}
    <path d="M38 24h6" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="24" cy="24" r="2.5" fill="#059669" />
    {/* Steam wisps */}
    <path d="M16 14c0-2 1-3 1-5M24 12c0-2 1-3 1-5" stroke="#94A3B8" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
  </S>
);

export const GeneratorIcon = (props) => (
  <S {...props}>
    {/* Body */}
    <rect x="10" y="14" width="28" height="20" rx="4" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5" />
    {/* Coils */}
    <circle cx="24" cy="24" r="7" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.5" />
    <path d="M21 20l6 8M27 20l-6 8" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
    {/* Lightning */}
    <path d="M23 15l-1 4h4l-2 4" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Base */}
    <rect x="12" y="34" width="24" height="4" rx="1" fill="#059669" />
    {/* Shaft */}
    <path d="M6 24h4M38 24h4" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
  </S>
);

export const TransformerIcon = (props) => (
  <S {...props}>
    {/* Body */}
    <rect x="10" y="14" width="28" height="22" rx="3" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5" />
    {/* Core */}
    <rect x="14" y="18" width="6" height="14" rx="1" fill="#10B981" opacity="0.3" />
    <rect x="28" y="18" width="6" height="14" rx="1" fill="#10B981" opacity="0.3" />
    <rect x="14" y="18" width="20" height="3" rx="1" fill="#10B981" opacity="0.3" />
    <rect x="14" y="29" width="20" height="3" rx="1" fill="#10B981" opacity="0.3" />
    {/* Coil symbols */}
    <path d="M17 22c0 1 2 1 2 2s-2 1-2 2 2 1 2 2" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M29 22c0 1 2 1 2 2s-2 1-2 2 2 1 2 2" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" />
    {/* Terminals */}
    <rect x="16" y="10" width="3" height="4" rx="1" fill="#059669" />
    <rect x="29" y="10" width="3" height="4" rx="1" fill="#059669" />
    <rect x="22" y="10" width="4" height="4" rx="1" fill="#059669" />
    <rect x="10" y="36" width="28" height="4" rx="1" fill="#059669" />
  </S>
);

export const SolarPanelIcon = (props) => (
  <S {...props}>
    {/* Panel */}
    <rect x="6" y="12" width="36" height="22" rx="2" fill="#1E3A5F" stroke="#1E40AF" strokeWidth="1.5" />
    {/* Grid */}
    <path d="M12 12v22M18 12v22M24 12v22M30 12v22M36 12v22" stroke="#3B82F6" strokeWidth="0.6" opacity="0.5" />
    <path d="M6 18h36M6 24h36M6 30h36" stroke="#3B82F6" strokeWidth="0.6" opacity="0.5" />
    {/* Shine */}
    <rect x="8" y="14" width="8" height="5" rx="0.5" fill="#60A5FA" opacity="0.3" />
    {/* Stand */}
    <path d="M18 34l6 8M30 34l-6 8" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
    {/* Sun */}
    <circle cx="42" cy="8" r="4" fill="#FBBF24" opacity="0.4" />
    <path d="M42 2v2M46 4l-1.5 1.5M48 8h-2" stroke="#FBBF24" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
  </S>
);

// ─── Cooling & Utilities ────────────────────────────────────────────────────

export const CoolingTowerIcon = (props) => (
  <S {...props}>
    {/* Tower shape */}
    <path d="M14 40l4-28h12l4 28" fill="#CFFAFE" stroke="#0891B2" strokeWidth="1.5" />
    <path d="M16 40l3-24h10l3 24" fill="#E0F2FE" />
    {/* Water splash */}
    <path d="M20 28c2-2 4 1 8 0" stroke="#06B6D4" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <path d="M18 32c3-2 6 1 12 0" stroke="#06B6D4" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    {/* Steam */}
    <path d="M20 10c0-2 1-4 2-5M24 8c0-2 1-4 2-5M28 10c0-2 1-4 2-5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    {/* Base */}
    <rect x="12" y="38" width="24" height="4" rx="1" fill="#0891B2" />
  </S>
);

export const ChillerIcon = (props) => (
  <S {...props}>
    <rect x="8" y="16" width="32" height="20" rx="3" fill="#CFFAFE" stroke="#0891B2" strokeWidth="1.5" />
    {/* Fins */}
    <path d="M12 20h24M12 24h24M12 28h24M12 32h24" stroke="#06B6D4" strokeWidth="1" opacity="0.4" />
    {/* Snowflake */}
    <path d="M24 20v8M20 24h8M21 21l6 6M27 21l-6 6" stroke="#0891B2" strokeWidth="1.5" strokeLinecap="round" />
    {/* Fan */}
    <circle cx="36" cy="26" r="4" fill="#E0F2FE" stroke="#06B6D4" strokeWidth="1" />
    <path d="M36 22v8M32 26h8" stroke="#06B6D4" strokeWidth="0.8" />
    <rect x="8" y="36" width="8" height="4" rx="1" fill="#0891B2" />
    <rect x="32" y="36" width="8" height="4" rx="1" fill="#0891B2" />
  </S>
);

export const HVACIcon = (props) => (
  <S {...props}>
    <rect x="8" y="12" width="32" height="24" rx="3" fill="#CFFAFE" stroke="#0891B2" strokeWidth="1.5" />
    {/* Fan */}
    <circle cx="24" cy="22" r="6" fill="#E0F2FE" stroke="#06B6D4" strokeWidth="1.5" />
    <circle cx="24" cy="22" r="2" fill="#0891B2" />
    {/* Blades */}
    <path d="M24 16c2 2 0 6 0 6s-2-4 0-6z" fill="#06B6D4" opacity="0.5" />
    <path d="M30 22c-2 2-6 0-6 0s4-2 6 0z" fill="#06B6D4" opacity="0.5" />
    <path d="M24 28c-2-2 0-6 0-6s2 4 0 6z" fill="#06B6D4" opacity="0.5" />
    <path d="M18 22c2-2 6 0 6 0s-4 2-6 0z" fill="#06B6D4" opacity="0.5" />
    {/* Vents */}
    <rect x="12" y="31" width="24" height="2" rx="1" fill="#06B6D4" opacity="0.3" />
    <rect x="12" y="34" width="24" height="1" rx="0.5" fill="#06B6D4" opacity="0.2" />
    <rect x="8" y="36" width="32" height="4" rx="1" fill="#0891B2" />
  </S>
);

export const CompressorIcon = (props) => (
  <S {...props}>
    <rect x="10" y="14" width="28" height="22" rx="3" fill="#F1F5F9" stroke="#475569" strokeWidth="1.5" />
    {/* Cylinder */}
    <rect x="14" y="18" width="12" height="14" rx="2" fill="#E2E8F0" stroke="#64748B" strokeWidth="1" />
    {/* Piston */}
    <rect x="16" y="22" width="8" height="4" rx="1" fill="#64748B" />
    {/* Motor */}
    <circle cx="33" cy="25" r="5" fill="#94A3B8" stroke="#64748B" strokeWidth="1" />
    <circle cx="33" cy="25" r="2" fill="#475569" />
    {/* Air output */}
    <path d="M14 18h-6M14 22h-4" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="10" y="36" width="28" height="4" rx="1" fill="#475569" />
  </S>
);

export const PumpIcon = (props) => (
  <S {...props}>
    {/* Body */}
    <circle cx="24" cy="24" r="10" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5" />
    <circle cx="24" cy="24" r="5" fill="#BFDBFE" stroke="#3B82F6" strokeWidth="1" />
    <circle cx="24" cy="24" r="2" fill="#2563EB" />
    {/* Inlet */}
    <path d="M6 24h8" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
    {/* Outlet */}
    <path d="M24 14v-6" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
    {/* Motor */}
    <rect x="34" y="20" width="8" height="8" rx="2" fill="#93C5FD" stroke="#2563EB" strokeWidth="1" />
    <path d="M34 24h-4" stroke="#2563EB" strokeWidth="2" />
    {/* Base */}
    <rect x="14" y="36" width="20" height="4" rx="1" fill="#2563EB" />
  </S>
);

export const WaterTreatmentIcon = (props) => (
  <S {...props}>
    <rect x="6" y="14" width="36" height="22" rx="3" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
    {/* Tanks */}
    <rect x="10" y="18" width="8" height="14" rx="2" fill="#BAE6FD" stroke="#0EA5E9" strokeWidth="0.8" />
    <rect x="20" y="18" width="8" height="14" rx="2" fill="#BAE6FD" stroke="#0EA5E9" strokeWidth="0.8" />
    <rect x="30" y="18" width="8" height="14" rx="2" fill="#BAE6FD" stroke="#0EA5E9" strokeWidth="0.8" />
    {/* Water levels */}
    <rect x="11" y="24" width="6" height="7" rx="1" fill="#38BDF8" opacity="0.4" />
    <rect x="21" y="22" width="6" height="9" rx="1" fill="#38BDF8" opacity="0.5" />
    <rect x="31" y="20" width="6" height="11" rx="1" fill="#38BDF8" opacity="0.6" />
    {/* Pipes */}
    <path d="M18 25h2M28 25h2" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
    {/* Arrows */}
    <path d="M4 25h4M40 25h4" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="6" y="36" width="36" height="4" rx="1" fill="#0284C7" />
  </S>
);

export const EffluentTreatmentIcon = (props) => (
  <S {...props}>
    <rect x="6" y="14" width="36" height="22" rx="3" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
    {/* Settling tank */}
    <path d="M10 18h28v14H10z" fill="#BAE6FD" stroke="#0EA5E9" strokeWidth="0.8" />
    {/* Dirty water in */}
    <rect x="10" y="18" width="8" height="14" fill="#A3E635" opacity="0.2" />
    {/* Clean water gradient */}
    <rect x="18" y="18" width="10" height="14" fill="#38BDF8" opacity="0.2" />
    <rect x="28" y="18" width="10" height="14" fill="#38BDF8" opacity="0.4" />
    {/* Separator */}
    <path d="M18 18v14M28 18v14" stroke="#0EA5E9" strokeWidth="0.8" strokeDasharray="2 2" />
    {/* Sludge */}
    <path d="M10 30c4 1 8 0 12 1 4 1 8 0 16 1" stroke="#92400E" strokeWidth="1" opacity="0.4" />
    <path d="M4 25h4M40 25h4" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="6" y="36" width="36" height="4" rx="1" fill="#0284C7" />
  </S>
);

// ─── Transport ──────────────────────────────────────────────────────────────

export const VehicleIcon = (props) => (
  <S {...props}>
    {/* Body */}
    <path d="M6 28h4l4-8h14l6 8h8v6H6z" fill="#F1F5F9" stroke="#475569" strokeWidth="1.5" />
    {/* Cab */}
    <path d="M10 28l4-8h10v8" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
    {/* Windows */}
    <rect x="12" y="22" width="5" height="4" rx="0.5" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="0.5" />
    <rect x="19" y="22" width="5" height="4" rx="0.5" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="0.5" />
    {/* Wheels */}
    <circle cx="14" cy="34" r="4" fill="#1E293B" stroke="#475569" strokeWidth="1" />
    <circle cx="14" cy="34" r="1.5" fill="#94A3B8" />
    <circle cx="36" cy="34" r="4" fill="#1E293B" stroke="#475569" strokeWidth="1" />
    <circle cx="36" cy="34" r="1.5" fill="#94A3B8" />
    {/* Cargo */}
    <rect x="26" y="22" width="14" height="6" rx="1" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.8" />
  </S>
);

export const ConveyorIcon = (props) => (
  <S {...props}>
    {/* Belt */}
    <path d="M4 28h40" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
    {/* Rollers */}
    <circle cx="10" cy="32" r="3" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
    <circle cx="24" cy="32" r="3" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
    <circle cx="38" cy="32" r="3" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
    {/* Items on belt */}
    <rect x="14" y="22" width="6" height="6" rx="1" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
    <rect x="28" y="22" width="6" height="6" rx="1" fill="#F97316" stroke="#EA580C" strokeWidth="0.8" />
    {/* Direction arrow */}
    <path d="M18 16h12" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M28 13l3 3-3 3" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Supports */}
    <path d="M10 35v5M24 35v5M38 35v5" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
  </S>
);

// ─── Quality & Output ───────────────────────────────────────────────────────

export const QualityInspectionIcon = (props) => (
  <S {...props}>
    {/* Clipboard */}
    <rect x="10" y="8" width="28" height="34" rx="3" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5" />
    <rect x="18" y="4" width="12" height="8" rx="2" fill="#10B981" stroke="#059669" strokeWidth="1" />
    {/* Check marks */}
    <path d="M16 20l3 3 6-6" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 30l3 3 6-6" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Lines */}
    <path d="M28 20h6M28 30h6" stroke="#6EE7B7" strokeWidth="1.5" strokeLinecap="round" />
    {/* Magnifying glass */}
    <circle cx="36" cy="38" r="4" fill="none" stroke="#059669" strokeWidth="1.5" />
    <path d="M39 41l3 3" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
  </S>
);

export const FinishingIcon = (props) => (
  <S {...props}>
    {/* Buffing wheel */}
    <circle cx="24" cy="22" r="10" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
    <circle cx="24" cy="22" r="6" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1" />
    <circle cx="24" cy="22" r="2" fill="#D97706" />
    {/* Sparkles */}
    <path d="M36 16l2-2M38 12l1-1M34 10l1-2" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="38" cy="14" r="1" fill="#FBBF24" />
    <circle cx="34" cy="8" r="0.8" fill="#FBBF24" />
    {/* Workpiece */}
    <rect x="10" y="34" width="28" height="4" rx="1" fill="#94A3B8" stroke="#64748B" strokeWidth="1" />
    {/* Stand */}
    <path d="M24 32v-2M18 40h12" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
  </S>
);

export const PackagingIcon = (props) => (
  <S {...props}>
    {/* Open box */}
    <path d="M8 20l16-8 16 8-16 8z" fill="#DDD6FE" stroke="#7C3AED" strokeWidth="1.2" />
    <path d="M8 20v14l16 8V28" fill="#C4B5FD" stroke="#7C3AED" strokeWidth="1.2" />
    <path d="M40 20v14l-16 8V28" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.2" />
    {/* Flap */}
    <path d="M8 20l6-6M40 20l-6-6" stroke="#8B5CF6" strokeWidth="1.2" strokeLinecap="round" />
    {/* Tape */}
    <path d="M24 12v16" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" />
    <path d="M24 28v14" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" />
  </S>
);

export const DispatchIcon = (props) => (
  <S {...props}>
    {/* Truck body */}
    <rect x="4" y="18" width="26" height="16" rx="2" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5" />
    {/* Cab */}
    <path d="M30 22h8a4 4 0 014 4v8H30z" fill="#10B981" stroke="#059669" strokeWidth="1.5" />
    {/* Windshield */}
    <rect x="32" y="24" width="8" height="5" rx="1" fill="#ECFDF5" stroke="#059669" strokeWidth="0.8" />
    {/* Wheels */}
    <circle cx="14" cy="34" r="4" fill="#1E293B" stroke="#475569" strokeWidth="1" />
    <circle cx="14" cy="34" r="1.5" fill="#94A3B8" />
    <circle cx="36" cy="34" r="4" fill="#1E293B" stroke="#475569" strokeWidth="1" />
    <circle cx="36" cy="34" r="1.5" fill="#94A3B8" />
    {/* Go arrow */}
    <path d="M10 26h14" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M22 23l4 3-4 3" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </S>
);

// ─── Generic ────────────────────────────────────────────────────────────────

export const CustomProcessIcon = (props) => (
  <S {...props}>
    {/* Gear 1 */}
    <circle cx="20" cy="22" r="8" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
    <circle cx="20" cy="22" r="4" fill="#F1F5F9" stroke="#64748B" strokeWidth="1" />
    <circle cx="20" cy="22" r="1.5" fill="#475569" />
    {/* Teeth */}
    <path d="M20 13v2M20 31v2M11 22h2M27 22h2M13 15l1.5 1.5M25.5 27.5l1.5 1.5M13 29l1.5-1.5M25.5 16.5l1.5-1.5" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
    {/* Gear 2 */}
    <circle cx="32" cy="30" r="5" fill="#E2E8F0" stroke="#475569" strokeWidth="1" />
    <circle cx="32" cy="30" r="2.5" fill="#F1F5F9" stroke="#64748B" strokeWidth="0.8" />
    <circle cx="32" cy="30" r="1" fill="#475569" />
    <path d="M32 24.5v1M32 34.5v1M26.5 30h1M36.5 30h1" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
  </S>
);

// ─── Energy Sources & Grid ──────────────────────────────────────────────────

export const PowerGridIcon = (props) => (
  <S {...props}>
    {/* Pylon structure */}
    <path d="M24 4v40" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
    <path d="M14 12h20" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 20h16" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
    {/* Cross braces */}
    <path d="M18 12l6 8M30 12l-6 8" stroke="#818CF8" strokeWidth="1.2" strokeLinecap="round" />
    {/* Wires hanging */}
    <path d="M14 12c0 4 3 5 5 3" stroke="#A5B4FC" strokeWidth="1" fill="none" />
    <path d="M34 12c0 4-3 5-5 3" stroke="#A5B4FC" strokeWidth="1" fill="none" />
    {/* Lightning bolt */}
    <path d="M6 8l3 6h-4l5 8" stroke="#F59E0B" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {/* Base */}
    <rect x="18" y="40" width="12" height="4" rx="1" fill="#C7D2FE" stroke="#4F46E5" strokeWidth="1" />
    {/* Insulators */}
    <circle cx="14" cy="12" r="2" fill="#E0E7FF" stroke="#6366F1" strokeWidth="1" />
    <circle cx="34" cy="12" r="2" fill="#E0E7FF" stroke="#6366F1" strokeWidth="1" />
  </S>
);

export const WindTurbineIcon = (props) => (
  <S {...props}>
    {/* Tower */}
    <path d="M22 22v22h4V22" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.2" />
    {/* Hub */}
    <circle cx="24" cy="18" r="3" fill="#E0F2FE" stroke="#0EA5E9" strokeWidth="1.5" />
    {/* Blade 1 - top */}
    <path d="M24 15c-1-8 0-13 0-13s1 5 0 13" fill="#7DD3FC" stroke="#0EA5E9" strokeWidth="0.8" />
    {/* Blade 2 - right */}
    <path d="M27 19c7 4 11 6 11 6s-5 0-11-6" fill="#7DD3FC" stroke="#0EA5E9" strokeWidth="0.8" />
    {/* Blade 3 - left */}
    <path d="M21 19c-7 4-11 6-11 6s5 0 11-6" fill="#7DD3FC" stroke="#0EA5E9" strokeWidth="0.8" />
    {/* Ground */}
    <path d="M16 44h16" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
    {/* Center bolt */}
    <circle cx="24" cy="18" r="1" fill="#0284C7" />
  </S>
);

export const DieselGeneratorIcon = (props) => (
  <S {...props}>
    {/* Engine block */}
    <rect x="6" y="16" width="28" height="20" rx="2" fill="#FECACA" stroke="#DC2626" strokeWidth="1.5" />
    {/* Cooling fins */}
    <path d="M10 18v16M14 18v16M18 18v16M22 18v16M26 18v16M30 18v16" stroke="#EF4444" strokeWidth="0.6" opacity="0.4" />
    {/* Generator section */}
    <rect x="34" y="20" width="10" height="12" rx="2" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.2" />
    <circle cx="39" cy="26" r="3" fill="#FCA5A5" stroke="#DC2626" strokeWidth="1" />
    <circle cx="39" cy="26" r="1" fill="#DC2626" />
    {/* Exhaust pipe */}
    <rect x="12" y="8" width="4" height="10" rx="1" fill="#94A3B8" stroke="#64748B" strokeWidth="1" />
    {/* Exhaust smoke */}
    <circle cx="14" cy="6" r="2" fill="#CBD5E1" opacity="0.5" />
    <circle cx="16" cy="3" r="1.5" fill="#CBD5E1" opacity="0.3" />
    {/* Base */}
    <rect x="4" y="36" width="32" height="4" rx="1" fill="#F87171" stroke="#DC2626" strokeWidth="1" />
    {/* Lightning symbol */}
    <path d="M40 14l-2 4h3l-2 4" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </S>
);

export const EnergySourceIcon = (props) => (
  <S {...props}>
    {/* Circle glow */}
    <circle cx="24" cy="22" r="14" fill="#FEF3C7" opacity="0.5" />
    <circle cx="24" cy="22" r="10" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
    {/* Lightning bolt center */}
    <path d="M22 14h6l-4 8h6l-10 14 3-10h-5z" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
    {/* Radiating lines */}
    <path d="M24 6v3M24 35v3M8 22h3M37 22h3M12 10l2 2M34 32l2 2M34 10l-2 2M12 32l-2 2" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />
    {/* Base platform */}
    <rect x="14" y="38" width="20" height="4" rx="1" fill="#FCD34D" stroke="#D97706" strokeWidth="0.8" />
  </S>
);

export const ElectricityOutputIcon = (props) => (
  <S {...props}>
    {/* Meter housing */}
    <rect x="10" y="8" width="28" height="32" rx="3" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5" />
    {/* Display */}
    <rect x="14" y="12" width="20" height="10" rx="2" fill="#ECFDF5" stroke="#10B981" strokeWidth="1" />
    {/* Digital readout */}
    <text x="24" y="20" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#059669" fontFamily="monospace">
      kWh
    </text>
    {/* Arrow out */}
    <path d="M24 26v8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
    <path d="M20 31l4 4 4-4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Connection points */}
    <circle cx="17" cy="38" r="2" fill="#6EE7B7" stroke="#059669" strokeWidth="1" />
    <circle cx="31" cy="38" r="2" fill="#6EE7B7" stroke="#059669" strokeWidth="1" />
    {/* Lightning */}
    <path d="M36 6l-2 4h3l-3 5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </S>
);

export const ConsumptionPointIcon = (props) => (
  <S {...props}>
    {/* Factory silhouette */}
    <rect x="8" y="20" width="32" height="20" rx="2" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.5" />
    <path d="M8 20l5-10h6l5 10" fill="#DDD6FE" stroke="#7C3AED" strokeWidth="1.2" />
    {/* Down arrow (consumption) */}
    <path d="M24 6v10" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
    <path d="M20 12l4 5 4-5" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Meter display */}
    <rect x="16" y="24" width="16" height="8" rx="1.5" fill="#F5F3FF" stroke="#8B5CF6" strokeWidth="0.8" />
    <path d="M20 28h8" stroke="#A78BFA" strokeWidth="1" strokeLinecap="round" />
    <path d="M22 30h4" stroke="#A78BFA" strokeWidth="0.8" strokeLinecap="round" />
    {/* Ground connection */}
    <path d="M24 40v4M20 44h8M22 46h4M23 48h2" stroke="#7C3AED" strokeWidth="1.2" strokeLinecap="round" />
  </S>
);

export const BatteryStorageIcon = (props) => (
  <S {...props}>
    {/* Battery body */}
    <rect x="8" y="14" width="32" height="24" rx="3" fill="#D1FAE5" stroke="#059669" strokeWidth="1.5" />
    {/* Terminal */}
    <rect x="18" y="10" width="12" height="6" rx="1.5" fill="#10B981" stroke="#059669" strokeWidth="1" />
    {/* Charge bars */}
    <rect x="12" y="18" width="6" height="16" rx="1" fill="#6EE7B7" stroke="#059669" strokeWidth="0.8" />
    <rect x="21" y="18" width="6" height="16" rx="1" fill="#6EE7B7" stroke="#059669" strokeWidth="0.8" />
    <rect x="30" y="18" width="6" height="16" rx="1" fill="#34D399" stroke="#059669" strokeWidth="0.8" opacity="0.5" />
    {/* Plus/minus */}
    <path d="M4 24h3M41 24h3M42 22v4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
    {/* Lightning */}
    <path d="M32 8l-2 3h3l-2 3" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </S>
);

export const InverterIcon = (props) => (
  <S {...props}>
    {/* Box */}
    <rect x="8" y="12" width="32" height="24" rx="3" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="1.5" />
    {/* DC wave in */}
    <path d="M4 24h4" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
    <text x="6" y="20" textAnchor="middle" fontSize="5" fill="#6366F1" fontWeight="bold">
      DC
    </text>
    {/* AC wave out */}
    <path d="M40 24h4" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
    <text x="42" y="20" textAnchor="middle" fontSize="5" fill="#4F46E5" fontWeight="bold">
      AC
    </text>
    {/* Sine wave symbol */}
    <path d="M16 24c2-6 4-6 6 0s4 6 6 0" stroke="#4F46E5" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Arrow */}
    <path d="M20 30h8" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M26 28l3 2-3 2" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* LEDs */}
    <circle cx="14" cy="16" r="1.5" fill="#22C55E" />
    <circle cx="19" cy="16" r="1.5" fill="#F59E0B" />
  </S>
);

export const SubstationIcon = (props) => (
  <S {...props}>
    {/* Building */}
    <rect x="6" y="18" width="36" height="22" rx="2" fill="#E0E7FF" stroke="#4F46E5" strokeWidth="1.5" />
    {/* Roof */}
    <path d="M4 18h40" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
    {/* HV equipment */}
    <rect x="10" y="22" width="8" height="14" rx="1" fill="#C7D2FE" stroke="#6366F1" strokeWidth="1" />
    <rect x="20" y="22" width="8" height="14" rx="1" fill="#C7D2FE" stroke="#6366F1" strokeWidth="1" />
    <rect x="30" y="22" width="8" height="14" rx="1" fill="#C7D2FE" stroke="#6366F1" strokeWidth="1" />
    {/* Insulators */}
    <circle cx="14" cy="14" r="2" fill="#DDD6FE" stroke="#4F46E5" strokeWidth="1" />
    <circle cx="24" cy="14" r="2" fill="#DDD6FE" stroke="#4F46E5" strokeWidth="1" />
    <circle cx="34" cy="14" r="2" fill="#DDD6FE" stroke="#4F46E5" strokeWidth="1" />
    {/* Wires */}
    <path d="M14 12v-6M24 12v-6M34 12v-6" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" />
    {/* Lightning */}
    <path d="M24 26l-2 4h4l-2 4" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </S>
);

export const SmartMeterIcon = (props) => (
  <S {...props}>
    {/* Meter body */}
    <rect x="10" y="6" width="28" height="36" rx="4" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
    {/* LCD screen */}
    <rect x="14" y="10" width="20" height="12" rx="2" fill="#BAE6FD" stroke="#0EA5E9" strokeWidth="1" />
    {/* Reading */}
    <text x="24" y="18" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#0369A1" fontFamily="monospace">
      245.8
    </text>
    {/* Buttons */}
    <circle cx="18" cy="28" r="2" fill="#7DD3FC" stroke="#0284C7" strokeWidth="0.8" />
    <circle cx="24" cy="28" r="2" fill="#7DD3FC" stroke="#0284C7" strokeWidth="0.8" />
    <circle cx="30" cy="28" r="2" fill="#7DD3FC" stroke="#0284C7" strokeWidth="0.8" />
    {/* WiFi signal */}
    <path d="M20 34c2-2 6-2 8 0" stroke="#0EA5E9" strokeWidth="1" fill="none" strokeLinecap="round" />
    <path d="M22 36c1-1 3-1 4 0" stroke="#0EA5E9" strokeWidth="1" fill="none" strokeLinecap="round" />
    <circle cx="24" cy="38" r="1" fill="#0EA5E9" />
    {/* Connection wires */}
    <path d="M16 42v4M32 42v4" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
  </S>
);

export const MotorIcon = (props) => (
  <S {...props}>
    {/* Motor body (cylinder) */}
    <rect x="10" y="14" width="22" height="20" rx="2" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
    {/* End cap */}
    <ellipse cx="32" cy="24" rx="4" ry="10" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
    {/* Shaft */}
    <rect x="36" y="22" width="8" height="4" rx="1" fill="#94A3B8" stroke="#475569" strokeWidth="1" />
    {/* Cooling fins */}
    <path d="M12 16h18M12 20h18M12 24h18M12 28h18M12 32h18" stroke="#94A3B8" strokeWidth="0.6" opacity="0.5" />
    {/* Terminal box */}
    <rect x="16" y="8" width="10" height="8" rx="1.5" fill="#F1F5F9" stroke="#64748B" strokeWidth="1" />
    {/* Connection dots */}
    <circle cx="19" cy="12" r="1" fill="#475569" />
    <circle cx="23" cy="12" r="1" fill="#475569" />
    {/* M label */}
    <text x="21" y="26" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#475569">
      M
    </text>
    {/* Base/feet */}
    <rect x="14" y="34" width="4" height="6" rx="0.5" fill="#94A3B8" stroke="#475569" strokeWidth="0.8" />
    <rect x="26" y="34" width="4" height="6" rx="0.5" fill="#94A3B8" stroke="#475569" strokeWidth="0.8" />
  </S>
);

export const BiogasPlantIcon = (props) => (
  <S {...props}>
    {/* Digester dome */}
    <path d="M8 28a16 16 0 0132 0" fill="#DCFCE7" stroke="#16A34A" strokeWidth="1.5" />
    <rect x="8" y="28" width="32" height="10" rx="1" fill="#BBF7D0" stroke="#16A34A" strokeWidth="1.5" />
    {/* Gas pipe */}
    <path d="M24 12v-6" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
    <circle cx="24" cy="4" r="2" fill="#4ADE80" stroke="#16A34A" strokeWidth="1" />
    {/* Bubbles inside */}
    <circle cx="20" cy="26" r="2" fill="#86EFAC" opacity="0.6" />
    <circle cx="28" cy="24" r="1.5" fill="#86EFAC" opacity="0.6" />
    <circle cx="24" cy="30" r="1" fill="#86EFAC" opacity="0.4" />
    {/* Input pipe */}
    <path d="M4 32h6" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
    {/* Output pipe */}
    <path d="M38 32h6" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
    {/* Leaf symbol */}
    <path d="M32 8c-3 0-5 3-5 5 2 0 5-2 5-5z" fill="#4ADE80" stroke="#16A34A" strokeWidth="0.8" />
    {/* Ground */}
    <path d="M6 40h36" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />
  </S>
);

export const BiomassUnitIcon = (props) => (
  <S {...props}>
    {/* Container/hopper */}
    <path d="M10 14h28l-4 26H14z" fill="#DCFCE7" stroke="#16A34A" strokeWidth="1.5" />
    {/* Wood/biomass inside */}
    <rect x="16" y="22" width="6" height="3" rx="1" fill="#A3E635" stroke="#65A30D" strokeWidth="0.8" transform="rotate(-20 19 23)" />
    <rect x="22" y="20" width="8" height="3" rx="1" fill="#84CC16" stroke="#65A30D" strokeWidth="0.8" transform="rotate(10 26 21)" />
    <rect x="18" y="28" width="7" height="3" rx="1" fill="#BEF264" stroke="#65A30D" strokeWidth="0.8" transform="rotate(-5 21 29)" />
    {/* Leaf */}
    <path d="M24 8c-4 0-7 4-7 7 3 0 7-3 7-7z" fill="#4ADE80" stroke="#16A34A" strokeWidth="1" />
    <path d="M24 8c3 0 6 3 6 6-2.5 0-6-2.5-6-6z" fill="#86EFAC" stroke="#16A34A" strokeWidth="1" />
    {/* Steam/output */}
    <path d="M30 10c1-2 3-2 3 0s2 0 2-2" stroke="#16A34A" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
    {/* Base */}
    <path d="M12 40h24" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
  </S>
);

export const CHPIcon = (props) => (
  <S {...props}>
    {/* Main unit */}
    <rect x="6" y="14" width="36" height="22" rx="3" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
    {/* Divided sections */}
    <path d="M22 14v22" stroke="#D97706" strokeWidth="1" strokeDasharray="3 2" />
    {/* Heat side (left) */}
    <path d="M10 20c2-2 4 0 4 2s2 4 4 2" stroke="#EF4444" strokeWidth="2" fill="none" strokeLinecap="round" />
    <text x="14" y="32" textAnchor="middle" fontSize="5" fill="#DC2626" fontWeight="bold">
      H
    </text>
    {/* Power side (right) */}
    <path d="M28 20l2 4h-3l3 5" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <text x="32" y="32" textAnchor="middle" fontSize="5" fill="#D97706" fontWeight="bold">
      E
    </text>
    {/* Input */}
    <path d="M2 25h4" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
    {/* Heat output */}
    <path d="M24 10c1-2 2-2 2 0s2 0 2-2" stroke="#EF4444" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Electricity output */}
    <path d="M42 25h4" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    {/* Base */}
    <rect x="8" y="36" width="32" height="4" rx="1" fill="#FDE68A" stroke="#D97706" strokeWidth="0.8" />
  </S>
);

export const CaptivePowerPlantIcon = (props) => (
  <S {...props}>
    {/* building */}
    <rect x="6" y="16" width="36" height="24" rx="2" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.5" />
    {/* Chimney */}
    <rect x="30" y="4" width="6" height="14" rx="1" fill="#FECACA" stroke="#DC2626" strokeWidth="1" />
    {/* Smoke */}
    <circle cx="33" cy="2" r="2" fill="#CBD5E1" opacity="0.4" />
    <circle cx="36" cy="0" r="1.5" fill="#CBD5E1" opacity="0.3" />
    {/* Generator symbol */}
    <circle cx="24" cy="28" r="8" fill="#FCA5A5" stroke="#DC2626" strokeWidth="1.2" />
    <circle cx="24" cy="28" r="4" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1" />
    <text x="24" y="30" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#DC2626">
      G
    </text>
    {/* Lightning */}
    <path d="M12 8l-2 4h3l-2 4" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Power lines out */}
    <path d="M42 24h4M42 28h4M42 32h4" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
  </S>
);

// ─── Annotation ─────────────────────────────────────────────────────────────

export const TextboxIcon = (props) => (
  <S {...props}>
    {/* Paper/note background */}
    <rect x="6" y="6" width="36" height="36" rx="4" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 2" />
    {/* Text lines */}
    <path d="M12 16h24" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 22h20" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 28h16" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 34h22" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    {/* Cursor/type indicator */}
    <path d="M38 12v8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
  </S>
);

// ─── Icon Map ───────────────────────────────────────────────────────────────

const ASSET_SVG_ICONS = {
  "Raw Material Storage": RawMaterialStorageIcon,
  "Fuel Storage": FuelStorageIcon,
  "Warehouse/Finished Product Storage" : WarehouseIcon,
  Boiler: BoilerIcon,
  Furnace: FurnaceIcon,
  "Reheating Furnace": ReheatingFurnaceIcon,
  "Induction Furnace": InductionFurnaceIcon,
  Kiln: KilnIcon,
  Oven: OvenIcon,
  Heater: HeaterIcon,
  Incinerator: IncineratorIcon,
  "Flare Stack": FlareStackIcon,
  "Rolling Mill": RollingMillIcon,
  "Forging Press": ForgingPressIcon,
  "Casting Machine": CastingMachineIcon,
  "Continuous Caster": ContinuousCasterIcon,
  Ladle: LadleIcon,
  Moulding: MouldingIcon,
  Machining: MachiningIcon,
  Shearing: ShearingIcon,
  "Heat Treatment": HeatTreatmentIcon,
  "Cooling Bed": CoolingBedIcon,
  Quenching: QuenchingIcon,
  Turbine: TurbineIcon,
  "Steam Turbine": SteamTurbineIcon,
  Generator: GeneratorIcon,
  Transformer: TransformerIcon,
  "Solar Panel Array": SolarPanelIcon,
  "Power Grid": PowerGridIcon,
  "Wind Turbine": WindTurbineIcon,
  "Diesel Generator": DieselGeneratorIcon,
  "Energy Source": EnergySourceIcon,
  "Electricity Output": ElectricityOutputIcon,
  "Consumption Point": ConsumptionPointIcon,
  "Battery Storage": BatteryStorageIcon,
  Inverter: InverterIcon,
  Substation: SubstationIcon,
  "Smart Meter": SmartMeterIcon,
  Motor: MotorIcon,
  "Biogas Plant": BiogasPlantIcon,
  "Biomass Unit": BiomassUnitIcon,
  "CHP / Cogeneration": CHPIcon,
  "Captive Power Plant": CaptivePowerPlantIcon,
  "Cooling Tower": CoolingTowerIcon,
  Chiller: ChillerIcon,
  "HVAC System": HVACIcon,
  Compressor: CompressorIcon,
  Pump: PumpIcon,
  "Water Treatment Plant": WaterTreatmentIcon,
  "Effluent Treatment Plant": EffluentTreatmentIcon,
  Vehicle: VehicleIcon,
  Conveyor: ConveyorIcon,
  "Quality Inspection": QualityInspectionIcon,
  Finishing: FinishingIcon,
  Packaging: PackagingIcon,
  Dispatch: DispatchIcon,
  "Custom Process": CustomProcessIcon,
  Textbox: TextboxIcon,
  Group: TextboxIcon,
  "Material Extraction": MachiningIcon,
  "Thermal Processing Unit": FurnaceIcon,
  "Material Agglomeration": CustomProcessIcon,
  "Material Preparation": CustomProcessIcon,
  "Material Charging System": ConveyorIcon,
  "Combustion Heating System": FurnaceIcon,
  "Smelting Reactor": FurnaceIcon,
  "Metal Formation": ForgingPressIcon,
  "By-product Separation": MachiningIcon,
  "Molten Metal Handling": LadleIcon,
  "Casting Unit": CastingMachineIcon,
  "Cooling System": CoolingTowerIcon,
  "Material/Product Transport": VehicleIcon,
  "Electricity Supply": PowerGridIcon,
  "Fuel Combustion System": FurnaceIcon,
  "Process Gas Recovery": CompressorIcon,
  "Compressed Air System": CompressorIcon,
  "Cooling Water System": WaterTreatmentIcon,
  "Downstream Processing": CustomProcessIcon,
  "Scrap Generation": MachiningIcon,
  "Recycling Process": BiogasPlantIcon,
};

export default ASSET_SVG_ICONS;
