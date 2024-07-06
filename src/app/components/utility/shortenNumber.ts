export function shortenNumber(num: number): string {
  if (num < 10) {
    return num.toString();
  } else if (num < 1000) {
    return "9+";
  } else {
    const units = ["k", "m", "b", "t"];
    let unitIndex = -1;
    let reducedNum = num;

    while (reducedNum >= 1000 && unitIndex < units.length - 1) {
      reducedNum /= 1000;
      unitIndex++;
    }

    return `${Math.floor(reducedNum)}${units[unitIndex]}`;
  }
}
