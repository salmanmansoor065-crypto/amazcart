import Link from 'next/link'
import Image from 'next/image'

const CAT_STYLES = {
  Tech:    { pill: 'pill-orange', bg: '#FFF8F5', dot: '#FFCDB8' },
  Home:    { pill: 'pill-green',  bg: '#F5FFF8', dot: '#B8EFCC' },
  Fashion: { pill: 'pill-blue',   bg: '#F0F7FF', dot: '#B8D1FF' },
  Books:   { pill: 'pill-blue',   bg: '#F0F7FF', dot: '#B8D1FF' },
  Sports:  { pill: 'pill-green',  bg: '#F5FFF8', dot: '#B8EFCC' },
  Beauty:  { pill: 'pill-orange', bg: '#FFF8F5', dot: '#FFCDB8' },
  default: { pill: 'pill-gray',   bg: '#F7F5F2', dot: '#E8E4DE' },
}

export default function ProductCard({ product }) {
  const style = CAT_STYLES[product.category] || CAT_STYLES.default
  const stars = Math.round(product.avg_rating || 5)

  return (
    <Link href={`/product/${product.id}`} className="product-card">
      <div style={{ height: 180, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 60, height: 60, borderRadius: 12, background: style.dot }} />
        )}
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <span className={`pill ${style.pill}`} style={{ marginBottom: 8, display: 'inline-flex' }}>{product.category || 'General'}</span>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, lineHeight: 1.35, color: '#1A1A1A' }}>{product.name}</h3>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 10, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <span className="stars" style={{ fontSize: 12 }}>{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
          <span style={{ fontSize: 11, color: '#aaa' }}>({product.comment_count || 0} reviews)</span>
        </div>
        <button
          className="btn-primary"
          style={{ width: '100%', fontSize: 13, padding: '9px 0' }}
          onClick={e => { e.preventDefault(); window.open(product.affiliate_link, '_blank', 'noopener,noreferrer') }}
        >
          Buy on Amazon
        </button>
      </div>
    </Link>
  )
}
