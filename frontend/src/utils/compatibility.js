export const calculateCompatibility = (mold, machines) => {
  if (!mold || !machines) return [];

  const compatibleMachines = machines
    .filter(machine => {
      const tonnageOk = machine.tonnage >= mold.machine_tonnage_min && 
                        machine.tonnage <= mold.machine_tonnage_max;
      return tonnageOk;
    })
    .map(machine => {
      let score = 0;
      let reasons = [];

      const tonnageMatch = machine.tonnage >= mold.machine_tonnage_min && 
                          machine.tonnage <= mold.machine_tonnage_max;
      if (tonnageMatch) {
        score += 60;
        reasons.push('Tonnage match');
      }

      const optimalTonnage = (mold.machine_tonnage_min + mold.machine_tonnage_max) / 2;
      const tonnageDiff = Math.abs(machine.tonnage - optimalTonnage);
      if (tonnageDiff <= 30) {
        score += 20;
        reasons.push('Optimal tonnage');
      } else if (tonnageDiff <= 50) {
        score += 10;
      }

      if (machine.status === 'running') {
        score += 15;
        reasons.push('Currently running');
      } else if (machine.status === 'idle') {
        score += 15;
        reasons.push('Idle and ready');
      } else if (machine.status === 'maintenance' || machine.status === 'broken') {
        score -= 30;
        reasons.push('Under maintenance');
      }

      const efficiencyBonus = Math.floor(machine.efficiency / 10);
      score += efficiencyBonus;
      if (machine.efficiency >= 85) {
        reasons.push('High efficiency');
      }

      return {
        ...machine,
        compatibilityScore: Math.max(0, Math.min(100, score)),
        compatibilityReasons: reasons,
        isOptimal: score >= 75,
        isRecommended: score >= 50 && score < 75,
        isNotOptimal: score < 50
      };
    })
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  return compatibleMachines;
};

export const getBestMachine = (mold, machines) => {
  const compatible = calculateCompatibility(mold, machines);
  return compatible.find(m => m.status !== 'maintenance' && m.status !== 'broken') || compatible[0] || null;
};

export const getMoldCompatibilityStatus = (mold, machine) => {
  if (!mold || !machine) return 'unknown';
  
  const tonnageOk = machine.tonnage >= mold.machine_tonnage_min && 
                    machine.tonnage <= mold.machine_tonnage_max;
  
  if (tonnageOk && machine.status !== 'maintenance' && machine.status !== 'broken') {
    return 'compatible';
  } else if (tonnageOk) {
    return 'warning';
  }
  return 'incompatible';
};
