/**
 * FOMS Industrial Compatibility Engine
 * Validates mold-machine compatibility based on Haitian engineering constraints
 */

function parseTieBarSpacing(tieBarStr) {
  if (!tieBarStr || typeof tieBarStr !== 'string') return 0;
  const parts = tieBarStr.split('x');
  if (parts.length === 2) {
    return parseInt(parts[0].trim());
  }
  return parseInt(tieBarStr) || 0;
}

function isMoldCompatible(machineSpec, mold) {
  const reasons = [];
  let compatible = true;

  // 1. Check clamping force / tonnage
  if (machineSpec.tonnage < mold.required_tonnage) {
    compatible = false;
    reasons.push(`Machine tonnage (${machineSpec.tonnage}T) is insufficient for mold requirement (${mold.required_tonnage}T)`);
  }

  // 2. Check mold fits tie bar spacing
  const tieBarSpacing = parseTieBarSpacing(machineSpec.tie_bar_spacing_mm);
  const moldSize = Math.max(mold.width_mm || 0, mold.height_mm || 0);
  
  if (moldSize > tieBarSpacing) {
    compatible = false;
    reasons.push(`Mold size (${moldSize}mm) exceeds tie bar spacing (${tieBarSpacing}mm)`);
  }

  // 3. Check shot volume
  if (machineSpec.shot_volume_cm3 < mold.shot_volume_cm3) {
    compatible = false;
    reasons.push(`Machine shot volume (${machineSpec.shot_volume_cm3}cm³) is less than mold requirement (${mold.shot_volume_cm3}cm³)`);
  }

  return {
    compatible,
    reasons,
    details: {
      machine_tonnage: machineSpec.tonnage,
      required_tonnage: mold.required_tonnage,
      tie_bar_spacing: tieBarSpacing,
      mold_size: moldSize,
      machine_shot_volume: machineSpec.shot_volume_cm3,
      required_shot_volume: mold.shot_volume_cm3
    }
  };
}

function checkMoldCompatibility(machine, mold) {
  const spec = machine.spec || {};
  return isMoldCompatible(spec, mold);
}

function findCompatibleMachines(mold, machines) {
  const compatible = [];
  const incompatible = [];

  for (const machine of machines) {
    const result = checkMoldCompatibility(machine, mold);
    if (result.compatible) {
      compatible.push({
        machine,
        score: machine.spec.tonnage - mold.required_tonnage,
        tieBarMargin: parseTieBarSpacing(machine.spec.tie_bar_spacing_mm) - Math.max(mold.width_mm, mold.height_mm)
      });
    } else {
      incompatible.push({
        machine,
        reasons: result.reasons
      });
    }
  }

  // Sort by smallest tonnage that fits (most efficient)
  compatible.sort((a, b) => a.score - b.score);

  return {
    compatible: compatible.map(c => c.machine),
    incompatible,
    totalAvailable: machines.length,
    totalCompatible: compatible.length
  };
}

module.exports = {
  isMoldCompatible,
  checkMoldCompatibility,
  findCompatibleMachines,
  parseTieBarSpacing
};