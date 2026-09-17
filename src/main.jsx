import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowUpRight, ChevronDown, CircleAlert, Mail, MapPin, Phone, Search } from 'lucide-react'
import './styles.css'
import logo from './Logo.jpeg'

const API = import.meta.env.VITE_API_BASE || 'https://teamsircleserver-4.onrender.com/api'

async function fetchJson(path) {
  const response = await fetch(`${API}${path}`)
  if (!response.ok) throw new Error('Catalog unavailable right now')
  return response.json()
}

function App() {
  const [apps, setApps] = useState([])
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [banners, setBanners] = useState([])
  const [selectedApp, setSelectedApp] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState('home')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchJson('/apps')
      .then(data => {
        setApps(Array.isArray(data) ? data : [])
        if (data?.length) setSelectedApp(data[0]._id)
      })
      .catch(error => setError(error.message))
  }, [])

  useEffect(() => {
    if (!selectedApp) return
    setLoading(true)
    setSelectedCategory('All')
    Promise.all([
      fetchJson(`/categories?app=${encodeURIComponent(selectedApp)}`),
      fetchJson(`/products?app=${encodeURIComponent(selectedApp)}`),
      fetchJson(`/banners?app=${encodeURIComponent(selectedApp)}`),
    ])
      .then(([categoryData, productData, bannerData]) => {
        setCategories(Array.isArray(categoryData) ? categoryData : [])
        setProducts(Array.isArray(productData) ? productData : [])
        setBanners(Array.isArray(bannerData) ? bannerData.filter(item => item.active !== false) : [])
        setError('')
      })
      .catch(error => setError(error.message))
      .finally(() => setLoading(false))
  }, [selectedApp])

  const visibleProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || `${product.name} ${product.brand || ''} ${product.description || ''}`.toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  })

  const activeApp = apps.find(app => app._id === selectedApp)

  return (
    <div className="site-shell">
      <header className="nav-wrap">
        <a className="brand" href="#top" aria-label="Dee International home">
          <img src={logo} className="project-logo" alt="Project Logo" />
          <span><strong>Dee</strong> International</span>
          
        </a>
        <nav className="nav-links">
          <button className={page === 'home' ? 'nav-link active' : 'nav-link'} onClick={() => setPage('home')}>Catalog</button>
          <button className={page === 'about' ? 'nav-link active' : 'nav-link'} onClick={() => setPage('about')}>About</button>
          <button className={page === 'contact' ? 'nav-link active' : 'nav-link'} onClick={() => setPage('contact')}>Contact</button>
        </nav>
        <a className="nav-contact" href="tel:+977 - 9705407460">Talk to us <ArrowUpRight size={16} /></a>
      </header>

      <main id="top">
        {page === 'home' && <section className="catalog-section" id="catalog">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Browse the family</p>
              <h2>Find your next favorite.</h2>
            </div>
            <span className="result-count">{visibleProducts.length} products</span>
          </div>

          <div className="app-filter" role="tablist" aria-label="Brand filter">
            {apps.map(app => <button key={app._id} className={selectedApp === app._id ? 'filter-pill active' : 'filter-pill'} onClick={() => setSelectedApp(app._id)}><span className="filter-icon app-icon">{app.url ? <img className="filter-image app-image" src={app.url} alt="" /> : <span className="app-image-placeholder">DI</span>}</span><span className="filter-label">{app.name}</span></button>)}
          </div>

          <div className="catalog-tools">
            <div className="category-filter">
              <button className={selectedCategory === 'All' ? 'category-chip active' : 'category-chip'} onClick={() => setSelectedCategory('All')}>All</button>
              {categories.map(category => <button key={category._id} className={selectedCategory === category.name ? 'category-chip active' : 'category-chip'} onClick={() => setSelectedCategory(category.name)}>{category.name}</button>)}
            </div>
            <label className="search-box"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search the collection" /></label>
          </div>

          {activeApp && <div className="collection-line"><span>{activeApp.name}</span><span>{activeApp.description}</span></div>}
          {error && <div className="state error"><CircleAlert size={18} />{error}</div>}
          {!loading && banners.length > 0 && <BannerStrip banners={banners} />}
          {loading ? <div className="state">Loading the collection...</div> : visibleProducts.length ? <div className="product-grid">{visibleProducts.map(product => <ProductCard key={product._id} product={product} />)}</div> : <div className="state">No products match this selection.</div>}
        </section>}

        {page === 'about' && <section className="about-section" id="about">
          <div className="about-label"><span>01</span><span>About us</span></div>
          <div className="about-copy"><h2>Built around<br /><em>better everyday.</em></h2><p>Dee International brings distinct retail experiences together under one thoughtful umbrella. We look for useful products, honest value, and details that make daily life feel a little more considered.</p></div>
        </section>}

        {page === 'contact' && <section className="contact-section" id="contact">
          <div><p className="eyebrow">02 / Contact</p><h2>Let’s make<br /><em>something useful.</em></h2></div>
          <div className="contact-details"><a href="mailto:sales@deeinternational.com.np"><Mail size={18} /> sales@deeinternational.com.np</a><a href="tel:+977-9705407460"><Phone size={18} /> +977 9705407460</a><span><MapPin size={18} /> Golchha Chowk , Biratnagar , Morang , Province 1 , Nepal </span></div>
        </section>}
      </main>
      <footer><span>© 2026 Dee International</span><span>Authorized Distributor</span></footer>
    </div>
  )
}

function BannerStrip({ banners }) {
  const banner = banners[0]
  return <div className="banner-strip" aria-label="Promotion">
    <div className="catalog-banner">
      {banner.url && <img src={banner.url} alt={banner.title || 'Dee International promotion'} />}
      <div className="banner-overlay"><span>Dee International</span><strong>{banner.title || 'Featured collection'}</strong></div>
    </div>
  </div>
}

function ProductCard({ product }) {
  return <article className="product-card">
    <div className="product-image">{product.url ? <img src={product.url} alt={product.name} /> : <div className="image-placeholder"><ChevronDown size={22} /></div>}{product.offer && <span className="offer-tag">Offer</span>}</div>
    <div className="product-info"><div><p className="product-category">{product.category || product.brand || 'Collection'}</p><h3>{product.name}</h3><p className="product-description">{product.description || 'A considered choice for everyday living.'}</p></div><div className="product-price">{product.offer ? <><span className="was">Rs. {product.price}</span><strong>Rs. {product.offerPrice}</strong></> : <strong>Rs. {product.price}</strong>}</div></div>
  </article>
}

createRoot(document.getElementById('root')).render(<App />)
