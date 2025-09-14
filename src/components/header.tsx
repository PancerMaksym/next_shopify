import Link from "next/link";
import "@/style/header.scss"

export default function Header () {
    return(
        <header className="header">
            <Link href={"/"}><h2>Home</h2></Link>
            <Link href={"/orders"}><h2>Orders</h2></Link>
        </header>
    )
}