import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import Joyride, { STATUS, ACTIONS, EVENTS } from "react-joyride";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import axios from "axios";
import { ROLE_CODES } from "../config/roleConfig";
import { isServiceSectorIndustry } from "../utils/uiTerminology";

const TourContext = createContext();

const ORG_ADMIN_TOUR_ROLES = new Set([...(ROLE_CODES.ORG_ADMIN || []), ...(ROLE_CODES.HEAD || [])]);
const AUTO_START_TOUR_ROLES = new Set([...(ROLE_CODES.ORG_ADMIN || [])]);

/* ────────────────────────────────────────────
   Route resolver: returns org-admin route base
   ("/org" or "/head") depending on the user role.
   ──────────────────────────────────────────── */
const getRouteBase = (user) => {
  if (!user) return "/org";
  if (ROLE_CODES.HEAD?.includes(user.role)) return "/head";
  return "/org";
};

const getTourStepsForUser = (user) => {
  if (!user || !ORG_ADMIN_TOUR_ROLES.has(user.role)) return [];

  const routeBase = getRouteBase(user);
  const industry = user?.organizationId?.industry || user?.organizationIndustry || "";
  const isServiceSector = isServiceSectorIndustry(industry);
  const steps = buildSteps(routeBase);

  if (!isServiceSector) return steps;

  // Service-sector org/head flows do not expose boundary settings routes.
  return steps.filter((step) => !step.route?.includes("/boundary-settings"));
};

/* ────────────────────────────────────────────
   Step definitions

   Each step now carries a `route` key (relative
   to the role-based route base) and an optional
   `requiresModal` key that the listening
   components use to open the right modal.
   ──────────────────────────────────────────── */
const buildSteps = (routeBase) => [
  // ── Organisation Details page (steps 0-5) ──
  { target: ".tour-org-identity", content: "Review your registered company name, entity type, and registration ID. These form your official identity.", placement: "right", disableBeacon: true, route: `${routeBase}/organization-details` },
  { target: ".tour-org-address", content: "Provide your complete head office address, including city and state, to establish your regulatory location.", placement: "right", route: `${routeBase}/organization-details` },
  { target: ".tour-org-contact", content: "Define the primary contact person, their role, email, and phone number for platform notifications.", placement: "right", route: `${routeBase}/organization-details` },
  { target: ".tour-org-general-contact", content: "Set your corporate website, reporting baseline year, and full corporate office address.", placement: "right", route: `${routeBase}/organization-details` },
  { target: ".tour-org-board-directors", content: "List the board members you want to acknowledge for governance reporting.", placement: "right", route: `${routeBase}/organization-details` },
  { target: ".tour-org-save", content: "Save the organization details to persist your metadata.", placement: "right", route: `${routeBase}/organization-details` },

  // ── Facilities page (steps 6-12) ──
  { target: ".tour-facility-search", content: "Search for existing facilities before creating a new one.", placement: "right", route: `${routeBase}/facilities` },
  { target: ".tour-facility-add-button", content: "Click here to add a new facility if nothing matches.", placement: "left", route: `${routeBase}/facilities` },
  // Steps 8-12 require the FacilityModal to be open
  { target: ".tour-facility-identity", content: "Give the facility a distinctive name so it is easy to identify.", placement: "right", route: `${routeBase}/facilities`, requiresModal: "facility" },
  { target: ".tour-facility-address", content: "Provide the complete address, city, state, and postal code for this facility.", placement: "right", route: `${routeBase}/facilities`, requiresModal: "facility" },
  { target: ".tour-facility-details", content: "Select the facility type and define its total operational area.", placement: "right", route: `${routeBase}/facilities`, requiresModal: "facility" },
  { target: ".tour-facility-head", content: "Add the name and email of the facility head responsible for operations here.", placement: "right", route: `${routeBase}/facilities`, requiresModal: "facility" },
  { target: ".tour-facility-save", content: "Create the facility to persist the data and unlock boundary settings.", placement: "right", route: `${routeBase}/facilities`, requiresModal: "facility" },

  // ── Boundary Settings page (steps 13-18) ──
  { target: ".tour-boundary-facility-grid", content: "Choose a facility from this grid to configure its boundary settings.", placement: "right", route: `${routeBase}/boundary-settings` },
  // Steps 14-18 require BoundaryModal to be open
  { target: ".tour-boundary-methods", content: "Select the organizational boundary method (Operational, Financial, or Equity) and specify percentage if applicable.", placement: "right", route: `${routeBase}/boundary-settings`, requiresModal: "boundary" },
  { target: ".tour-boundary-reporting", content: "Set the reporting start and end dates for this facility.", placement: "right", route: `${routeBase}/boundary-settings`, requiresModal: "boundary" },
  { target: ".tour-boundary-scopes", content: "Toggle the applicable reporting scopes (Scope 1, 2, etc).", placement: "right", route: `${routeBase}/boundary-settings`, requiresModal: "boundary" },
  { target: ".tour-boundary-system", content: "Select system boundaries and add any specific projects or product tracking.", placement: "right", route: `${routeBase}/boundary-settings`, requiresModal: "boundary" },
  { target: ".tour-boundary-save", content: "Save the boundary settings to lock in facility coverage.", placement: "right", route: `${routeBase}/boundary-settings`, requiresModal: "boundary" },
];

const emitTourStepChange = (index) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("orgAdminTourStep", { detail: { stepIndex: index } }));
};

const getTourStorageKey = (user) => {
  if (!user) return "org-admin-tour:unknown";
  const orgId = user.organizationId && typeof user.organizationId === "object" ? user.organizationId._id : user.organizationId;
  const identifier = orgId || user.username || "guest";
  return `org-admin-tour-seen:${user.role || "org-admin"}:${identifier}`;
};

/* ────────────────────────────────────────────
   Inner component that lives INSIDE the Router
   so it can call useNavigate / useLocation.
   ──────────────────────────────────────────── */
const TourRunner = ({ runTour, setRunTour, steps, user, stepIndex, setStepIndex }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const waitingForTargetRef = useRef(false);
  const pendingStepRef = useRef(null);
  const prevRunTourRef = useRef(false);

  /* ── On initial start: navigate to the correct page if needed ── */
  useEffect(() => {
    const justStarted = runTour && !prevRunTourRef.current;
    prevRunTourRef.current = runTour;

    if (!justStarted) return;

    const step = steps[stepIndex];
    if (!step) return;

    const needsNavigation = step.route && step.route !== location.pathname;
    if (needsNavigation) {
      // Pause tour, navigate, then resume
      setRunTour(false);
      waitingForTargetRef.current = true;
      pendingStepRef.current = stepIndex;
      navigate(step.route);
    }
    // If already on the correct page, Joyride will render the step
  }, [runTour, stepIndex, steps, location.pathname, navigate, setRunTour]);

  /* When the route changes, check if we were waiting for a target element to appear */
  useEffect(() => {
    if (!waitingForTargetRef.current || pendingStepRef.current === null) return;

    const idx = pendingStepRef.current;
    const step = steps[idx];
    if (!step) return;

    // Poll for the target element after navigation
    let attempts = 0;
    const maxAttempts = 40; // 40 × 75ms = 3s max wait
    const poll = setInterval(() => {
      attempts++;
      const target = document.querySelector(step.target);
      if (target || attempts >= maxAttempts) {
        clearInterval(poll);
        waitingForTargetRef.current = false;
        pendingStepRef.current = null;
        // Emit step event so modals can open
        emitTourStepChange(idx);

        // If step requires a modal, wait a bit more for the modal to appear
        if (step.requiresModal) {
          setTimeout(() => {
            setStepIndex(idx);
            setRunTour(true);
          }, 400);
        } else {
          setStepIndex(idx);
          setRunTour(true);
        }
      }
    }, 75);

    return () => clearInterval(poll);
  }, [location.pathname, steps, setRunTour, setStepIndex]);

  const handleJoyrideCallback = async (data) => {
    const { status, action, index, type, lifecycle } = data;

    /* ── Emit step event on step:before so modals can react ── */
    if (lifecycle === "step:before" && typeof index === "number") {
      emitTourStepChange(index);
    }

    /* ── Handle missing targets by moving forward instead of looping ── */
    if (type === EVENTS.TARGET_NOT_FOUND) {
      const nextIndex = action === ACTIONS.PREV ? index - 1 : index + 1;

      if (nextIndex < 0 || nextIndex >= steps.length) {
        setRunTour(false);
        setStepIndex(0);
        return;
      }

      const nextStep = steps[nextIndex];
      const needsNavigation = nextStep.route && nextStep.route !== location.pathname;

      if (needsNavigation) {
        setRunTour(false);
        waitingForTargetRef.current = true;
        pendingStepRef.current = nextIndex;
        navigate(nextStep.route);
      } else {
        setStepIndex(nextIndex);
      }
      return;
    }

    /* ── Handle FINISHED / SKIPPED ── */
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      setStepIndex(0);

      if (user && typeof window !== "undefined") {
        const storageKey = getTourStorageKey(user);
        window.localStorage.setItem(storageKey, "true");
      }

      if (!user) return;
      try {
        await axios.post("/api/users/hasSeenTour", {
          username: user.username,
          companyName: user.companyName,
        });
      } catch (error) {
        console.error("Failed to update tour status:", error);
      }
      return;
    }

    /* ── Handle CLOSE (X button) ── */
    if (action === ACTIONS.CLOSE) {
      setRunTour(false);
      return;
    }

    /* ── Handle step transitions (NEXT / PREV) ── */
    if (type === EVENTS.STEP_AFTER) {
      const nextIndex = action === ACTIONS.PREV ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= steps.length) return;

      const nextStep = steps[nextIndex];
      const needsNavigation = nextStep.route && nextStep.route !== location.pathname;

      if (needsNavigation) {
        // Pause the tour, navigate, then resume at the next step
        setRunTour(false);
        waitingForTargetRef.current = true;
        pendingStepRef.current = nextIndex;
        navigate(nextStep.route);
      } else {
        // Same page — check if it's a modal step
        if (nextStep.requiresModal) {
          // Emit step change first so the component opens its modal
          emitTourStepChange(nextIndex);
          // Wait for modal to render
          setTimeout(() => {
            setStepIndex(nextIndex);
          }, 300);
        } else {
          setStepIndex(nextIndex);
        }
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={runTour}
      stepIndex={stepIndex}
      continuous={true}
      showSkipButton={true}
      showProgress={true}
      disableCloseOnEsc={false}
      disableOverlayClose={false}
      styles={{
        options: {
          primaryColor: "#3b82f6",
          zIndex: 10000,
        },
      }}
      callback={handleJoyrideCallback}
    />
  );
};

export const TourProvider = ({ children }) => {
  const [runTour, setRunTour] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const { user } = useAuth();

  const steps = getTourStepsForUser(user);

  useEffect(() => {
    if (steps.length === 0) {
      setRunTour(false);
      setStepIndex(0);
    }
  }, [steps.length]);

  useEffect(() => {
    const storageKey = getTourStorageKey(user);

    if (!user || steps.length === 0 || !AUTO_START_TOUR_ROLES.has(user.role)) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const hasSeenTourLocal = window.localStorage.getItem(storageKey) === "true";
    const hasSeenTourRemote = Boolean(user?.hasSeenTour);

    if (hasSeenTourRemote) {
      if (!hasSeenTourLocal) {
        window.localStorage.setItem(storageKey, "true");
      }
      return;
    }

    if (!hasSeenTourLocal) {
      setRunTour(true);
    }
  }, [user, steps.length]);

  /* Restart tour handler — used by the ChatBot "Product Tour" button */
  const startTour = useCallback((fromStep = 0) => {
    if (steps.length === 0) {
      setRunTour(false);
      setStepIndex(0);
      return;
    }

    const nextStepIndex = Math.max(0, Math.min(fromStep, steps.length - 1));
    setStepIndex(nextStepIndex);
    setRunTour(true);
  }, [steps.length]);

  return (
    <TourContext.Provider value={{ runTour, setRunTour, stepIndex, startTour }}>
      {children}
      {/* TourRunner must be rendered as a child so it lives INSIDE the Router */}
      {steps.length > 0 && (
        <TourRunner
          runTour={runTour}
          setRunTour={setRunTour}
          steps={steps}
          user={user}
          stepIndex={stepIndex}
          setStepIndex={setStepIndex}
        />
      )}
    </TourContext.Provider>
  );
};

export const useTour = () => useContext(TourContext);