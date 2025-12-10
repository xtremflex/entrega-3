const ROULETTE_NUMBERS = {
    0: 'verde',
    1: 'rojo', 2: 'negro', 3: 'rojo', 4: 'negro', 5: 'rojo', 6: 'negro',
    7: 'rojo', 8: 'negro', 9: 'rojo', 10: 'negro', 11: 'negro', 12: 'rojo',
    13: 'negro', 14: 'rojo', 15: 'negro', 16: 'rojo', 17: 'negro', 18: 'rojo',
    19: 'rojo', 20: 'negro', 21: 'rojo', 22: 'negro', 23: 'rojo', 24: 'negro',
    25: 'rojo', 26: 'negro', 27: 'rojo', 28: 'negro', 29: 'negro', 30: 'rojo',
    31: 'negro', 32: 'rojo', 33: 'negro', 34: 'rojo', 35: 'negro', 36: 'rojo'
};

module.exports = {
  getNumberData(number) {
    const color = ROULETTE_NUMBERS[number];
    return {
      number,
      color,
      isEven: number !== 0 && number % 2 === 0,
      isOdd: number !== 0 && number % 2 !== 0,
      isLow: number >= 1 && number <= 18,
      isHigh: number >= 19 && number <= 36,
      dozen: number >= 1 && number <= 12 ? 1 :
             number >= 13 && number <= 24 ? 2 :
             number >= 25 && number <= 36 ? 3 : null,
      column: number !== 0 && number % 3 === 1 ? 1 :
              number !== 0 && number % 3 === 2 ? 2 :
              number !== 0 && number % 3 === 0 ? 3 : null
    };
  },

  getPayoutRate(betType) {
    if (betType.startsWith("Pleno")) return 35;
    if (betType.startsWith("Split")) return 17;
    if (betType.startsWith("Calle")) return 11;
    if (betType.startsWith("Cuadrada")) return 8;
    if (betType.startsWith("Linea")) return 5;

    if (["Docena 1", "Docena 2", "Docena 3"].includes(betType)) return 2;
    if (["Columna 1", "Columna 2", "Columna 3"].includes(betType)) return 2;

    if (["Rojo", "Negro", "Par", "Impar", "Falta (1-18)", "Pasa (19-36)"].includes(betType)) return 1;

    return 0;
  },

  checkWin(betType, d) {
    const { number, color, isEven, isOdd, isLow, isHigh, dozen, column } = d;

    if (betType === `Pleno ${number}`) return true;
    if (betType === 'Rojo' && color === 'rojo') return true;
    if (betType === 'Negro' && color === 'negro') return true;
    if (betType === 'Par' && isEven) return true;
    if (betType === 'Impar' && isOdd) return true;
    if (betType === 'Falta (1-18)' && isLow) return true;
    if (betType === 'Pasa (19-36)' && isHigh) return true;

    if (betType === 'Docena 1' && dozen === 1) return true;
    if (betType === 'Docena 2' && dozen === 2) return true;
    if (betType === 'Docena 3' && dozen === 3) return true;

    if (betType === 'Columna 1' && column === 1) return true;
    if (betType === 'Columna 2' && column === 2) return true;
    if (betType === 'Columna 3' && column === 3) return true;

    return false;
  }
};
