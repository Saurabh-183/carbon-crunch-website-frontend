export const ALLOCATION_MESSAGES = {
  NO_FACILITY: "Facility not found.",
  NO_PRODUCT_BOUNDARY: "Product allocation is available only when the facility boundary includes Product level.",
  NO_PRODUCTS: "No products configured for this facility. Ask the Org Admin to add products in boundary settings.",
  DATES_REQUIRED: "Start and end dates are required.",
  INVALID_TOTAL: "Total allocation must be 100%.",
  SAVE_SUCCESS: "Product allocation saved.",
  SAVE_ERROR: "Failed to save allocation.",
  LOAD_ERROR: "Failed to load facility details.",
};

export const ALLOCATION_TOLERANCE = 0.01; // Allow 100% ± 0.01%