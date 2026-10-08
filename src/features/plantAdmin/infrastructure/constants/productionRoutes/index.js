import { route_manufacturing_process_iron_steel } from "./manufacturing-process-iron-steel";
import { route_pig_iron } from "./pig-iron";
import { route_blast_furnace_route } from "./blast-furnace-route";
import { route_smelting_reduction_route } from "./smelting-reduction-route";
import { route_electric_arc_furnace } from "./electric-arc-furnace";
import { route_eaf_using_dri } from "./eaf-using-dri";
import { route_eaf_high_alloy_steel } from "./eaf-high-alloy-steel";
import { route_npi_route_high_alloy_steel } from "./npi-route-high-alloy-steel";
import { route_ferro_alloys_production } from "./ferro-alloys-production";
import { route_direct_reduced_iron } from "./direct-reduced-iron";
import { route_sintered_ore_production } from "./sintered-ore-production";
import { route_basic_oxygen_steelmaking } from "./basic-oxygen-steelmaking";
import { route_crude_steel_electric_arc_furnace } from "./crude-steel-electric-arc-furnace";
import { route_primary_aluminium_prebaked_anodes } from "./primary-aluminium-prebaked-anodes";
import { route_primary_aluminium_soderberg } from "./primary-aluminium-soderberg";
import { route_secondary_aluminium_scrap } from "./secondary-aluminium-scrap";
import { route_unwrought_aluminium_primary_smelting } from "./unwrought-aluminium-primary-smelting";
import { route_unwrought_aluminium_secondary_smelting } from "./unwrought-aluminium-secondary-smelting";
import { route_cement_clinker_production } from "./cement-clinker-production";
import { route_aluminous_cement } from "./aluminous-cement";

export const PRODUCTION_ROUTE_PRESETS = {
  "manufacturing-process-iron-steel": route_manufacturing_process_iron_steel,
  "pig-iron": route_pig_iron,
  "blast-furnace-route": route_blast_furnace_route,
  "smelting-reduction-route": route_smelting_reduction_route,
  "electric-arc-furnace": route_electric_arc_furnace,
  "eaf-using-dri": route_eaf_using_dri,
  "eaf-high-alloy-steel": route_eaf_high_alloy_steel,
  "npi-route-high-alloy-steel": route_npi_route_high_alloy_steel,
  "ferro-alloys-production": route_ferro_alloys_production,
  "direct-reduced-iron": route_direct_reduced_iron,
  "sintered-ore-production": route_sintered_ore_production,
  "basic-oxygen-steelmaking": route_basic_oxygen_steelmaking,
  "crude-steel-electric-arc-furnace": route_crude_steel_electric_arc_furnace,
  "primary-aluminium-prebaked-anodes": route_primary_aluminium_prebaked_anodes,
  "primary-aluminium-soderberg": route_primary_aluminium_soderberg,
  "secondary-aluminium-scrap": route_secondary_aluminium_scrap,
  "unwrought-aluminium-primary-smelting": route_unwrought_aluminium_primary_smelting,
  "unwrought-aluminium-secondary-smelting": route_unwrought_aluminium_secondary_smelting,
  "cement-clinker-production": route_cement_clinker_production,
  "aluminous-cement": route_aluminous_cement,
};
