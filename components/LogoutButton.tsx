// components/LogoutButton.tsx
import Link from 'next/link';

const LogoutButton = () => (
    <Link href="/logout" passHref>
        <button>Logout</button>
    </Link>
);

export default LogoutButton;