import React from "react";
import { Cloud, Flame, Zap } from "lucide-react";
import ScopeEmissionCard from "../../../plantAdmin/dashboard/ScopeEmissionCard";

/**
 * ScopeEmissionCardsGrid component displays emission totals by scope
 * @param {Object} props - Component props
 * @param {Object} props.scopeTotals - Object containing emission totals by scope
 */
const ScopeEmissionCardsGrid = ({ scopeTotals }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <ScopeEmissionCard
                title="Total Emissions"
                value={scopeTotals["Total"]}
                icon={Cloud}
                colorTheme="green"
            />
            <ScopeEmissionCard
                title="Scope 1"
                value={scopeTotals["Scope 1"]}
                icon={Flame}
                colorTheme="amber"
            />
            <ScopeEmissionCard
                title="Scope 2"
                value={scopeTotals["Scope 2"]}
                icon={Zap}
                colorTheme="blue"
            />
             <ScopeEmissionCard
          title="Scope 3"
          value={scopeTotals["Scope 3"]}
          icon={Zap}
          colorTheme="blue"
        />
        </div>
    );
};

export default ScopeEmissionCardsGrid;
