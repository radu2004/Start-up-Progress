export function compareByOrderNo(
  a: { orderNo: number },
  b: { orderNo: number },
) {
  return a.orderNo - b.orderNo;
}
