import './style.css'
import AOS from 'aos'
import 'aos/dist/aos.css'

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const staggerSections = document.querySelectorAll('.js-stagger-section')
staggerSections.forEach((section) => {
  const nodes = section.querySelectorAll('h1, h2, h3, p, article, li, .interactive-btn, .video-card, .video-nav')
  nodes.forEach((node, index) => {
    if (!node.dataset.aos) node.dataset.aos = 'fade-up'
    node.dataset.aosDelay = String(index * 80)
    node.dataset.aosDuration = '650'
  })
})

AOS.init({
  once: true,
  easing: 'ease-out-cubic',
  offset: 34,
  duration: 650,
  disable: reducedMotion,
})

const videoSlider = document.querySelector('[data-video-slider]')
if (videoSlider) {
  const viewport = videoSlider.querySelector('#video-viewport')
  const track = videoSlider.querySelector('#video-track')
  const prevBtn = videoSlider.querySelector('.video-nav--prev')
  const nextBtn = videoSlider.querySelector('.video-nav--next')
  if (viewport && track && prevBtn && nextBtn) {
    let slides = Array.from(track.children)
    if (slides.length > 1) {
      const visible = 3
      const firstClones = slides.slice(0, visible).map((el) => el.cloneNode(true))
      const lastClones = slides.slice(-visible).map((el) => el.cloneNode(true))
      lastClones.forEach((c) => track.insertBefore(c, track.firstChild))
      firstClones.forEach((c) => track.appendChild(c))
      slides = Array.from(track.children)
    }

    let index = 3
    let isAnimating = false

    const slideWidth = () => (slides[0] ? slides[0].getBoundingClientRect().width + 12 : 0)
    const setPosition = (animate = true) => {
      const x = -index * slideWidth()
      track.style.transition = animate ? 'transform 0.45s ease' : 'none'
      track.style.transform = `translate3d(${x}px,0,0)`
    }

    const go = (dir) => {
      if (isAnimating) return
      isAnimating = true
      index += dir
      setPosition(true)
    }

    track.addEventListener('transitionend', () => {
      const originalCount = slides.length - 6
      if (index >= originalCount + 3) {
        index = 3
        setPosition(false)
      } else if (index <= 2) {
        index = originalCount + 2
        setPosition(false)
      }
      isAnimating = false
    })

    prevBtn.addEventListener('click', () => go(-1))
    nextBtn.addEventListener('click', () => go(1))
    let touchStartX = 0
    viewport.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.changedTouches[0].clientX
      },
      { passive: true },
    )
    viewport.addEventListener(
      'touchend',
      (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX
        if (Math.abs(dx) > 40) {
          go(dx > 0 ? -1 : 1)
        }
      },
      { passive: true },
    )
    window.addEventListener('resize', () => setPosition(false))
    setPosition(false)
  }
}

const interactiveCards = document.querySelectorAll('.interactive-card, .benefits-grid article')
interactiveCards.forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    card.style.transform = `perspective(700px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`
  })
  card.addEventListener('mouseleave', () => {
    card.style.transform = ''
  })
})

const interactiveButtons = document.querySelectorAll('.interactive-btn')
interactiveButtons.forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    btn.style.transform = `translate(${x * 0.07}px, ${y * 0.07}px)`
  })
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = ''
  })
})

const siteDecor = document.querySelector('.site-decor')
if (siteDecor && !reducedMotion) {
  const stars = siteDecor.querySelector('.site-decor__stars')
  const starsFar = siteDecor.querySelector('.site-decor__stars--far')
  const orbA = siteDecor.querySelector('.site-decor__orb--a')
  const orbB = siteDecor.querySelector('.site-decor__orb--b')

  window.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth - 0.5
    const y = e.clientY / window.innerHeight - 0.5
    if (stars) stars.style.transform = `translate(${(x * 16).toFixed(2)}px, ${(y * 14).toFixed(2)}px)`
    if (starsFar) starsFar.style.transform = `translate(${(x * 26).toFixed(2)}px, ${(y * 22).toFixed(2)}px) scale(1.08)`
    if (orbA) orbA.style.transform = `translate(${(x * -18).toFixed(2)}px, ${(y * -14).toFixed(2)}px)`
    if (orbB) orbB.style.transform = `translate(${(x * 14).toFixed(2)}px, ${(y * 12).toFixed(2)}px)`
  })
}
