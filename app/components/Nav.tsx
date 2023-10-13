import Link from 'next/link';
import React from 'react';

function Nav() {
  return (
    <nav>
      <Link href="/">Prove Verify</Link>
      <Link href="/Page1">Elgamal Encryption</Link>
      <Link href="/Page2">Posiedon Hash</Link>
      <Link href="/Page3">Field Element Utils</Link>
      <Link href="/Page4">In-browser EVM Verification</Link>
    </nav>
  );
}

export default Nav;