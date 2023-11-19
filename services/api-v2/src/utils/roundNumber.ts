export function roundNumber(value: any, numberOfDecimals: number = 2): number {
  {
    if (value) {
      if (!isNaN(value)) {
        switch (numberOfDecimals) {
          case 0:
            return Math.round(value * 1) / 1
          case 1:
            return Math.round(value * 10) / 10
          case 2:
            return Math.round(value * 100) / 100
          case 3:
            return Math.round(value * 1000) / 1000
          case 4:
            return Math.round(value * 10000) / 10000
          case 5:
            return Math.round(value * 100000) / 100000
          case 6:
            return Math.round(value * 1000000) / 1000000
          default:
            return Math.round(value * 100) / 100
        }
      } else {
        return parseFloat(value.toFixed(numberOfDecimals))
      }
    } else {
      if (value === 0) {
        return 0
      }
    }
  }
}
