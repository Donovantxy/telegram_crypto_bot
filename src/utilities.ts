export const formattedPrice = (price: number): string => {
  let maximumFractionDigits = 0;
  switch ( true ) {
    case price <= 0.00009:
      maximumFractionDigits = 6
      break;
    case price <= 0.0009:
      maximumFractionDigits = 5
      break;
    case price <= 0.009:
      maximumFractionDigits = 4
      break;
    case price < 1:
      maximumFractionDigits = 3
      break;
    case price >= 1 && price < 10:
      maximumFractionDigits = 2
      break;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits, minimumFractionDigits: 0 }).format(price);
}

export const trunkPrice = (price: number): string => {
  let pow = ['K', 'Mln', 'Bln', 'Tln'];
  for ( let i=0; i<pow.length; i++ ) {
    const trunkedPrice = price/Math.pow(1000, i+2);
    if ( trunkedPrice < 1 ) {
      return `${formattedPrice(price/Math.pow(1000, i+1))} ${pow[i]}`;
    }
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}