/**
 * FOMS AI Factory Intelligence Layer
 * Machine recommendation, efficiency calculation, and layout optimization
 */

const { isMoldCompatible } = require('./compatibility');

/**
 * Calculate production efficiency
 * Formula: (ideal_cycle / actual_cycle) * 100
 * Default ideal cycle: 20 seconds (industry standard for injection molding)
 */
function calculateEfficiency(machineSpec, actualCycleTime) {
  if (!actualCycleTime || actualCycleTime <= 0) return 0;
  // Use dry_cycle_time_sec if available, otherwise use default
  const idealCycle = machineSpec.dry_cycle_time_sec || 20;
  const efficiency = (idealCycle / actualCycleTime) * 100;
  return Math.min(Math.round(efficiency * 100) / 100, 100);
}

/**
 * Get default cycle time based on tonnage
 * Larger machines generally have longer cycle times
 */
function getDefaultCycleTime(tonnage) {
  if (tonnage >= 800) return 45;
  if (tonnage >= 470) return 35;
  if (tonnage >= 380) return 30;
  if (tonnage >= 280) return 25;
  if (tonnage >= 200) return 22;
  if (tonnage >= 160) return 20;
  return 18;
}

/**
 * Calculate production efficiency
 * Formula: (ideal_cycle / actual_cycle) * 100
 * Default ideal cycle based on tonnage
 */
function calculateEfficiency(machineSpec, actualCycleTime) {
  if (!actualCycleTime || actualCycleTime <= 0) return 0;
  // Use dry_cycle_time_sec if available, otherwise use tonnage-based default
  const idealCycle = machineSpec.dry_cycle_time_sec || getDefaultCycleTime(machineSpec.tonnage);
  const efficiency = (idealCycle / actualCycleTime) * 100;
  return Math.min(Math.round(efficiency * 100) / 100, 100);
}

/**
 * Calculate energy efficiency score (lower tonnage = more efficient for small molds)
 */
function calculateEnergyScore(machineSpec, mold) {
  const tonnageMargin = machineSpec.tonnage - mold.required_tonnage;
  const motorPower = machineSpec.motor_power_kw || 1;
  
  // Score: higher is better (more efficient)
  // Penalize oversized machines and high power consumption
  const score = (tonnageMargin * 10) - (motorPower * 0.5);
  return Math.max(0, Math.round(score * 100) / 100);
}

/**
 * AI Machine Recommender
 * Recommends best machines for a mold based on:
 * - Compatibility (technical constraints)
 * - Efficiency (smallest fit)
 * - Energy optimization
 */
function recommendMachines(mold, machines) {
  const recommendations = [];

  for (const machine of machines) {
    const spec = machine.spec || machine;
    const compatibility = isMoldCompatible(spec, mold);

    if (compatibility.compatible) {
      const energyScore = calculateEnergyScore(spec, mold);
      const productionEfficiency = calculateEfficiency(spec, spec.dry_cycle_time_sec);
      
      recommendations.push({
        machine,
        compatibility: 'compatible',
        energyScore,
        productionEfficiency,
        tonnageMatch: spec.tonnage - mold.required_tonnage,
        reason: `Optimal fit: ${spec.tonnage}T machine for ${mold.required_tonnage}T requirement`
      });
    } else {
      recommendations.push({
        machine,
        compatibility: 'incompatible',
        reasons: compatibility.reasons
      });
    }
  }

  // Sort by compatibility first, then by energy score
  recommendations.sort((a, b) => {
    if (a.compatibility !== b.compatibility) {
      return a.compatibility === 'compatible' ? -1 : 1;
    }
    return b.energyScore - a.energyScore;
  });

  const compatible = recommendations.filter(r => r.compatibility === 'compatible');
  const incompatible = recommendations.filter(r => r.compatibility === 'incompatible');

  return {
    totalMachines: machines.length,
    compatibleCount: compatible.length,
    recommendations: compatible.slice(0, 5),
    alternatives: incompatible.slice(0, 3).map(r => ({
      machine: r.machine,
      reasons: r.reasons
    })),
    bestMatch: compatible[0] || null
  };
}

/**
 * Factory Layout Optimizer
 * Groups machines by tonnage:
 * - Heavy: >= 380T
 * - Medium: 160T - 380T
 * - Light: < 160T
 */
function optimizeFactoryLayout(machines) {
  const layout = {
    heavy: [],    // >= 380T
    medium: [],   // 160T - 380T
    light: [],    // < 160T
    summary: {
      heavyCount: 0,
      mediumCount: 0,
      lightCount: 0,
      totalMachines: machines.length
    }
  };

  for (const machine of machines) {
    const tonnage = machine.tonnage || (machine.spec && machine.spec.tonnage) || 0;
    
    if (tonnage >= 380) {
      layout.heavy.push({
        ...machine,
        tonnageGroup: 'heavy',
        reason: 'Heavy-duty machine for large molds'
      });
    } else if (tonnage >= 160) {
      layout.medium.push({
        ...machine,
        tonnageGroup: 'medium',
        reason: 'Medium-range machine for standard molds'
      });
    } else {
      layout.light.push({
        ...machine,
        tonnageGroup: 'light',
        reason: 'Light machine for small parts'
      });
    }
  }

  layout.summary = {
    heavyCount: layout.heavy.length,
    mediumCount: layout.medium.length,
    lightCount: layout.light.length,
    totalMachines: machines.length
  };

  // Calculate factory utilization
  const runningCount = machines.filter(m => m.status === 'running').length;
  layout.utilization = {
    running: runningCount,
    idle: machines.length - runningCount,
    percentage: Math.round((runningCount / machines.length) * 100)
  };

  return layout;
}

/**
 * Production simulation
 * Estimates daily output based on cycle time and cavities
 */
function simulateProduction(machine, mold, workingHours = 8) {
  const spec = machine.spec || machine;
  const cycleTime = spec.dry_cycle_time_sec || 30;
  const cavities = mold.cavities || 1;
  
  const cyclesPerHour = 3600 / cycleTime;
  const cyclesPerDay = cyclesPerHour * workingHours;
  const dailyOutput = Math.floor(cyclesPerDay * cavities);
  
  const efficiency = calculateEfficiency(spec, cycleTime);
  
  return {
    machineCode: machine.code || machine.name,
    moldCode: mold.code,
    cycleTime,
    cavities,
    cyclesPerHour: Math.round(cyclesPerHour),
    estimatedDailyOutput: dailyOutput,
    efficiency: Math.round(efficiency),
    workingHours
  };
}

module.exports = {
  calculateEfficiency,
  calculateEnergyScore,
  recommendMachines,
  optimizeFactoryLayout,
  simulateProduction
};