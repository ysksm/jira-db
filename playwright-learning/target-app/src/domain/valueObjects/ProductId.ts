export type ProductId = string & { readonly __brand: unique symbol };

export function createProductId(value: string): ProductId {
  if (!value || value.trim().length === 0) {
    throw new Error('ProductId cannot be empty');
  }
  return value as ProductId;
}
