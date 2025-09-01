import Image from "next/image";
import "@/style/card.scss"
import Link from "next/link";

const Card = ({photo, title, id}:{photo?:string, title:string, id:string}) => {
    const image = photo ? photo.split('?')[0] : "/placeholder.jpg";
    return(
        <Link href={`/card/${encodeURIComponent(id)}`} className="card" >
            <Image src={image} alt={title} width={900} height={1600}/>
            <h3>{title}</h3>
        </Link>
    )
}

export default Card