function generateSecureMockPassword(): string {
  const array = new Uint8Array(8); // 8 bytes = 64 bits
  crypto.getRandomValues(array);
  return 'mock-' + Array.from(array, byte => byte.toString(36)).join('');
}

export const MOCK_USER_PASSWORD = generateSecureMockPassword();
