import Link from 'next/link';
  
const LoginButton = () => (
  <Link href="/auth/openstreetmap" passHref>
    <button>Log in with OpenStreetMap</button>
  </Link>
);  
export default LoginButton;