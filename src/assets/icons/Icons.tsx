import IdCardIcon from "../../../public/id-card-svgrepo-com.svg";
import IdCartIcon from "../../../public/cart-svgrepo-com.svg";
export {
    IdCardIcon
};
export {
    IdCartIcon
};
type IconProps = {
    width?: string;
    height?: string;
    className?: string;
};

export const ShoppingBasketIcon = ({
    width = "24",
    height = "24",
    className = "",
}: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m15 11-1 9" />
        <path d="m19 11-4-7" />
        <path d="M2 11h20" />
        <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" />
        <path d="M4.5 15.5h15" />
        <path d="m5 11 4-7" />
        <path d="m9 11 1 9" />
    </svg>
);

export const NavMenuIcon = ({
    width = "24",
    height = "24",
    className = "",
}: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#f4a22f"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M4 5h16" />
        <path d="M4 12h16" />
        <path d="M4 19h16" />
    </svg>
);

