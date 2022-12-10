import { NftRow } from "./NftRow"

type HolaNft = {
    address: String,
    name: String,
    sellerFeeBasisPoints: Number,
    mintAddress: String,
    tokenAccountAddress: String,
    primarySaleHappened: Boolean,
    updateAuthorityAddress: String,
    description: String,
    category: String,
    parser: String,
    image: string,
    imageOriginal: String,
    animationUrl: String,
    externalUrl: String,
    creators: any[],
    attributes: any[],
    owner: any,
    files: any[]
}


interface NftGridProps {
    nfts: any[]
    setSelected: any
    selected: number[]
}

export const NftGrid = (props: NftGridProps) => {
    console.log("NFT GRID")
    console.log("WE GOT SOME NFTS")
    console.log(props.nfts.length)

    console.log("selected list")
    console.log(props.selected)
    return (
        <>
            <div className="grid grid-cols-4 gap-4 ">
                {props.nfts.map((nft: HolaNft, i) => <NftRow key={i} image={nft.image} name={nft.name} select={() => {
                    let _selected = props.selected
                    _selected.push(i)
                    props.setSelected(_selected)
                    console.log(`select: ${nft.name}`)
                }} unselect={() => {
                    console.log("unselect")
                    let _selected = props.selected
                    const index = _selected.indexOf(i);
                    _selected.splice(index, 1)
                    props.setSelected(_selected)
                }} selected={props.selected.includes(i)} />)}

            </div>
        </>
    )
}

export default NftGrid
