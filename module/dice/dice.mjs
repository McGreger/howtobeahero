/* -------------------------------------------- */
/* D100 Roll                                     */
/* -------------------------------------------- */

export async function d100Roll({
  formula,
  data = {},
  critical = 1,
  fumble = 100,
  targetValue,
  baseValue,
  bonusValue,
  inspired,
  chatMessage = true,
  messageData = {},
  flavor,
  ...options
} = {}) {
  const roll = new CONFIG.Dice.D100Roll(formula, data, {
    flavor: options.title,
    critical,
    fumble,
    targetValue,
    inspired
  });

  await roll.evaluate({async: true});

  const inspirationBonus = inspired ? data.actor.baseattributes.inspiration.value : 0;
  const totalTargetValue = targetValue;

  const criticalThreshold = Math.floor(totalTargetValue * 0.1);
  const fumbleThreshold = Math.ceil(100 - (100 - totalTargetValue) * 0.1);

  const total = roll.total;

  roll.isSuccess = total <= totalTargetValue;
  roll.isCriticalSuccess = total <= criticalThreshold;
  roll.isCriticalFailure = total >= fumbleThreshold;

  if (chatMessage) {
    const rollDetails = `
      <div class="roll-details">
        <p>Roll: ${total}</p>
        <p>Target: ${totalTargetValue}</p> 
        <p>(Base: ${baseValue}, Bonus: ${bonusValue}, Inspiration: +${inspirationBonus})</p>
        <p>Critical Success: ≤ ${criticalThreshold}</p>
        <p>Critical Failure: ≥ ${fumbleThreshold}</p>
      </div>
    `;

    let resultMessage = roll.isCriticalSuccess ? '<span style="color: #00ff00;"><strong>Critical Success!</strong></span>'
      : roll.isCriticalFailure ? '<span style="color: #ff0000;"><strong>Critical Failure!</strong></span>'
      : roll.isSuccess ? '<span style="color: #0000ff;"><strong>Success</strong></span>'
      : '<span style="color: #ff8800;"><strong>Failure</strong></span>';

    messageData.content = (messageData.content || "") + `${rollDetails}<br>${resultMessage}`;
    await roll.toMessage(messageData);
  }

  return roll;
}