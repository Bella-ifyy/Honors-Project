type AssertFn = ((value: unknown, message?: string) => asserts value) & {
  ok: (value: unknown, message?: string) => asserts value;
};

const assertFn = ((value: unknown, message?: string) => {
  if (!value) {
    throw new Error(message || "Assertion failed");
  }
}) as AssertFn;

assertFn.ok = assertFn;

export default assertFn;
