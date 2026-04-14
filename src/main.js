import './style.css'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { mockContent } from './mockContent.js'

const FORM_SUBMIT_AJAX = 'https://formsubmit.co/ajax/Maria.solaar@yandex.ru'

/** Превью в карточках видео: кадр из файла (тот же origin). */
function initVideoReviewPosters(trackEl) {
  const fallbackPoster =
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280"><rect fill="#0f1628" width="720" height="1280"/><path fill="#c9a96e" fill-opacity="0.2" d="M300 580h120v80H300z"/><path fill="#c9a96e" d="M360 610l40 24v-48z"/></svg>',
    )
  const seen = new WeakSet()
  trackEl.querySelectorAll('video').forEach((video) => {
    if (seen.has(video)) return
    seen.add(video)
    video.muted = true
    const applyFallback = () => {
      video.poster = fallbackPoster
    }
    const failTimer = window.setTimeout(applyFallback, 12000)
    const capture = () => {
      window.clearTimeout(failTimer)
      try {
        const w = video.videoWidth
        const h = video.videoHeight
        if (!w || !h) {
          applyFallback()
          return
        }
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          applyFallback()
          return
        }
        ctx.drawImage(video, 0, 0, w, h)
        video.poster = canvas.toDataURL('image/jpeg', 0.82)
      } catch {
        applyFallback()
      }
    }
    const onCanPaint = () => {
      const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0
      const seekTo = Math.max(0.04, Math.min(0.15, dur * 0.02 || 0.06))
      const onSeeked = () => {
        capture()
        video.removeEventListener('seeked', onSeeked)
      }
      video.addEventListener('seeked', onSeeked, { once: true })
      try {
        video.currentTime = seekTo
      } catch {
        applyFallback()
      }
    }
    if (video.readyState >= 2) onCanPaint()
    else video.addEventListener('loadeddata', onCanPaint, { once: true })
  })
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function initStartupSplash() {
  const splash = document.getElementById('startup-splash')
  if (!splash) return

  const isMobile = window.matchMedia('(max-width: 767px)').matches
  if (!isMobile) {
    splash.remove()
    return
  }

  const holdMs = 3000
  const fadeMs = 700
  if (reducedMotion) {
    window.setTimeout(() => splash.remove(), holdMs)
    return
  }

  window.setTimeout(() => {
    splash.classList.add('is-hiding')
    window.setTimeout(() => splash.remove(), fadeMs)
  }, holdMs)
}

initStartupSplash()

const staggerSections = document.querySelectorAll('.js-stagger-section')
staggerSections.forEach((section) => {
  const nodes = section.querySelectorAll(
    'h1, h2, h3, p, article, li, blockquote, .interactive-btn, .video-card, .video-nav, .text-review-card, .review-carousel-card, .review-nav, .festival-gallery__item, .master-card, .team-carousel-nav',
  )
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

const teamIntroEl = document.getElementById('mock-team-intro')
if (teamIntroEl) teamIntroEl.textContent = mockContent.teamIntro

const registerLeadEl = document.getElementById('mock-register-lead')
if (registerLeadEl) registerLeadEl.textContent = mockContent.registerLead

const nameInput = document.getElementById('reg-name')
const phoneInput = document.getElementById('reg-phone')
const emailInput = document.getElementById('reg-email')
const messageInput = document.getElementById('reg-message')
if (nameInput) nameInput.placeholder = mockContent.form.namePlaceholder
if (phoneInput) phoneInput.placeholder = mockContent.form.phonePlaceholder
if (emailInput) emailInput.placeholder = mockContent.form.emailPlaceholder
if (messageInput) messageInput.placeholder = mockContent.form.messagePlaceholder

const textReviewsGrid = document.getElementById('text-reviews-grid')
if (textReviewsGrid && mockContent.extraTextReviews.length) {
  for (const { quote, footnote } of mockContent.extraTextReviews) {
    const bq = document.createElement('blockquote')
    bq.className =
      'text-review-card interactive-card rounded-2xl border border-[#162040] bg-[#0f1628] p-7'
    bq.dataset.aos = 'fade-up'
    bq.dataset.aosDuration = '650'
    const p = document.createElement('p')
    p.className = 'text-lg italic leading-relaxed text-[#e8d5b0]'
    p.textContent = quote
    const footer = document.createElement('footer')
    footer.className = 'mt-4 font-sans text-xs uppercase tracking-[0.18em] text-[#4e6080]'
    footer.textContent = footnote
    bq.appendChild(p)
    bq.appendChild(footer)
    textReviewsGrid.appendChild(bq)
  }
      AOS.refresh()
}

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

    initVideoReviewPosters(track)

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

    const AUTO_SLIDE_MS = 1500
    let autoSlideTimer = null
    const stopAutoSlide = () => {
      if (autoSlideTimer !== null) {
        clearInterval(autoSlideTimer)
        autoSlideTimer = null
      }
    }
    const startAutoSlide = () => {
      stopAutoSlide()
      if (reducedMotion || slides.length <= 1) return
      autoSlideTimer = window.setInterval(() => go(1), AUTO_SLIDE_MS)
    }
    const restartAutoSlide = () => {
      stopAutoSlide()
      startAutoSlide()
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

    prevBtn.addEventListener('click', () => {
      restartAutoSlide()
      go(-1)
    })
    nextBtn.addEventListener('click', () => {
      restartAutoSlide()
      go(1)
    })
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
          restartAutoSlide()
          go(dx > 0 ? -1 : 1)
        }
      },
      { passive: true },
    )
    window.addEventListener('resize', () => setPosition(false))
    setPosition(false)
    startAutoSlide()
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoSlide()
      else startAutoSlide()
    })
  }
}

const reviewCarousel = document.querySelector('[data-review-carousel]')
if (reviewCarousel) {
  const viewport = reviewCarousel.querySelector('#review-carousel-viewport')
  const track = reviewCarousel.querySelector('#review-carousel-track')
  const prevBtn = reviewCarousel.querySelector('.review-nav--prev')
  const nextBtn = reviewCarousel.querySelector('.review-nav--next')
  if (viewport && track && prevBtn && nextBtn) {
    let slides = Array.from(track.children)
    const originalCount = slides.length
    const maxVisible = 3
    if (originalCount > 1) {
      const firstClones = slides.slice(0, maxVisible).map((el) => el.cloneNode(true))
      const lastClones = slides.slice(-maxVisible).map((el) => el.cloneNode(true))
      lastClones.forEach((c) => track.insertBefore(c, track.firstChild))
      firstClones.forEach((c) => track.appendChild(c))
      slides = Array.from(track.children)
    }

    let index = originalCount > 1 ? maxVisible : 0
    let isAnimating = false

    const slideWidth = () => {
      const el = slides[0]
      if (!el) return 0
      const g = window.getComputedStyle(track).gap
      const gap = parseFloat(g) || 16
      return el.getBoundingClientRect().width + gap
    }

    const setPosition = (animate = true) => {
      const w = slideWidth()
      const x = -index * w
      track.style.transition = animate ? 'transform 0.55s cubic-bezier(0.33, 1, 0.32, 1)' : 'none'
      track.style.transform = `translate3d(${x}px,0,0)`
    }

    const go = (dir) => {
      if (isAnimating) return
      track.querySelectorAll('video').forEach((v) => v.pause())
      isAnimating = true
      index += dir
      setPosition(true)
    }

    const getVisibleCount = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) return 3
      if (window.matchMedia('(min-width: 640px)').matches) return 2
      return 1
    }

    const syncReviewSlideWidths = () => {
      slides = Array.from(track.children)
      const vw = viewport.getBoundingClientRect().width
      const count = getVisibleCount()
      const g = window.getComputedStyle(track).gap
      const gap = parseFloat(g) || 16
      const w = Math.max(220, (vw - (count - 1) * gap) / count)
      slides.forEach((el) => {
        el.style.flex = `0 0 ${w}px`
      })
    }

    const AUTO_REVIEW_MS = 8000
    let reviewAutoTimer = null
    const stopReviewAuto = () => {
      if (reviewAutoTimer !== null) {
        clearInterval(reviewAutoTimer)
        reviewAutoTimer = null
      }
    }
    const startReviewAuto = () => {
      stopReviewAuto()
      if (reducedMotion || originalCount <= 1) return
      reviewAutoTimer = window.setInterval(() => go(1), AUTO_REVIEW_MS)
    }
    const restartReviewAuto = () => {
      stopReviewAuto()
      startReviewAuto()
    }

    track.addEventListener('transitionend', (e) => {
      if (e.target !== track || e.propertyName !== 'transform') return
      if (originalCount > 1) {
        if (index >= originalCount + maxVisible) {
          index = maxVisible
          setPosition(false)
        } else if (index <= maxVisible - 1) {
          index = originalCount + maxVisible - 1
          setPosition(false)
        }
      }
      isAnimating = false
    })

    prevBtn.addEventListener('click', () => {
      restartReviewAuto()
      go(-1)
    })
    nextBtn.addEventListener('click', () => {
      restartReviewAuto()
      go(1)
    })

    let reviewTouchStartX = 0
    viewport.addEventListener(
      'touchstart',
      (e) => {
        reviewTouchStartX = e.changedTouches[0].clientX
      },
      { passive: true },
    )
    viewport.addEventListener(
      'touchend',
      (e) => {
        const dx = e.changedTouches[0].clientX - reviewTouchStartX
        if (Math.abs(dx) > 40) {
          restartReviewAuto()
          go(dx > 0 ? -1 : 1)
        }
      },
      { passive: true },
    )

    const onResizeReview = () => {
      syncReviewSlideWidths()
      setPosition(false)
    }
    window.addEventListener('resize', onResizeReview)
    syncReviewSlideWidths()
    setPosition(false)
    startReviewAuto()
    track.querySelectorAll('video').forEach((v) => {
      v.addEventListener('play', () => stopReviewAuto())
      v.addEventListener('pause', () => startReviewAuto())
      v.addEventListener('ended', () => startReviewAuto())
    })
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopReviewAuto()
      else startReviewAuto()
    })
  }
}

const festivalPhotoLightbox = document.getElementById('festival-photo-lightbox')
const festivalLightboxImg = document.getElementById('festival-lightbox-img')
const festivalLightboxCloseBtn = document.querySelector('[data-festival-lightbox-close]')

function closeFestivalPhotoLightbox() {
  if (!festivalPhotoLightbox || !festivalLightboxImg) return
  festivalLightboxImg.removeAttribute('src')
  festivalLightboxImg.alt = ''
  festivalPhotoLightbox.classList.add('hidden')
  festivalPhotoLightbox.classList.remove('flex')
  document.body.style.overflow = ''
}

function openFestivalPhotoLightbox(src, alt = '') {
  if (!festivalPhotoLightbox || !festivalLightboxImg || !src) return
  festivalLightboxImg.src = src
  festivalLightboxImg.alt = alt || 'Фото с фестиваля Siai.fest'
  festivalPhotoLightbox.classList.remove('hidden')
  festivalPhotoLightbox.classList.add('flex')
  document.body.style.overflow = 'hidden'
}

const festivalGallery = document.querySelector('[data-festival-gallery]')
if (festivalGallery) {
  const viewport = festivalGallery.querySelector('#festival-gallery-viewport')
  const track = festivalGallery.querySelector('#festival-gallery-track')
  const prevBtn = festivalGallery.querySelector('.festival-gallery-nav--prev')
  const nextBtn = festivalGallery.querySelector('.festival-gallery-nav--next')
  if (viewport && track && prevBtn && nextBtn) {
    let slides = Array.from(track.children)
    const originalCount = slides.length
    const maxVisible = 3
    if (originalCount > 1) {
      const firstClones = slides.slice(0, maxVisible).map((el) => el.cloneNode(true))
      const lastClones = slides.slice(-maxVisible).map((el) => el.cloneNode(true))
      lastClones.forEach((c) => track.insertBefore(c, track.firstChild))
      firstClones.forEach((c) => track.appendChild(c))
      slides = Array.from(track.children)
    }

    const getVisibleCount = () => {
      if (window.matchMedia('(min-width: 768px)').matches) return 3
      if (window.matchMedia('(min-width: 480px)').matches) return 2
      return 1
    }

    const syncGallerySlideWidths = () => {
      slides = Array.from(track.children)
      const vw = viewport.getBoundingClientRect().width
      const count = getVisibleCount()
      const g = window.getComputedStyle(track).gap
      const gap = parseFloat(g) || 12
      const w = Math.max(120, (vw - (count - 1) * gap) / count)
      slides.forEach((el) => {
        el.style.flex = `0 0 ${w}px`
      })
    }

    let index = maxVisible
    let isAnimating = false

    const slideWidth = () => {
      const el = slides[0]
      if (!el) return 0
      const g = window.getComputedStyle(track).gap
      const gap = parseFloat(g) || 12
      return el.getBoundingClientRect().width + gap
    }

    const setPosition = (animate = true) => {
      const w = slideWidth()
      const x = -index * w
      track.style.transition = animate ? 'transform 0.55s cubic-bezier(0.33, 1, 0.32, 1)' : 'none'
      track.style.transform = `translate3d(${x}px,0,0)`
    }

    const go = (dir) => {
      if (isAnimating) return
      isAnimating = true
      index += dir
      setPosition(true)
    }

    const AUTO_FESTIVAL_GALLERY_MS = 2600
    let galleryAutoTimer = null
    const stopGalleryAuto = () => {
      if (galleryAutoTimer !== null) {
        clearInterval(galleryAutoTimer)
        galleryAutoTimer = null
      }
    }
    const startGalleryAuto = () => {
      stopGalleryAuto()
      if (reducedMotion || originalCount <= 1) return
      galleryAutoTimer = window.setInterval(() => go(1), AUTO_FESTIVAL_GALLERY_MS)
    }
    const restartGalleryAuto = () => {
      stopGalleryAuto()
      startGalleryAuto()
    }

    track.addEventListener('transitionend', (e) => {
      if (e.target !== track || e.propertyName !== 'transform') return
      if (index >= originalCount + maxVisible) {
        index = maxVisible
        setPosition(false)
      } else if (index <= maxVisible - 1) {
        index = originalCount + maxVisible - 1
        setPosition(false)
      }
      isAnimating = false
    })

    prevBtn.addEventListener('click', () => {
      restartGalleryAuto()
      go(-1)
    })
    nextBtn.addEventListener('click', () => {
      restartGalleryAuto()
      go(1)
    })

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
        if (Math.abs(dx) > 30) {
          restartGalleryAuto()
          go(dx > 0 ? -1 : 1)
        }
      },
      { passive: true },
    )

    const onResizeGallery = () => {
      syncGallerySlideWidths()
      setPosition(false)
    }
    window.addEventListener('resize', onResizeGallery)
    syncGallerySlideWidths()
    setPosition(false)
    startGalleryAuto()
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopGalleryAuto()
      else startGalleryAuto()
    })

    const openFromCard = (card) => {
      const img = card.querySelector('img')
      if (!img) return
      const src = img.currentSrc || img.src
      if (!src) return
      openFestivalPhotoLightbox(src, img.alt)
    }

    track.addEventListener('click', (e) => {
      const card = e.target.closest('.festival-gallery-card')
      if (!card || !track.contains(card)) return
      openFromCard(card)
    })

    track.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      const card = e.target.closest('.festival-gallery-card')
      if (!card || !track.contains(card)) return
      e.preventDefault()
      openFromCard(card)
    })
  }
}

const teamCarousel = document.querySelector('[data-team-carousel]')
if (teamCarousel) {
  const viewport = teamCarousel.querySelector('#team-carousel-viewport')
  const track = teamCarousel.querySelector('#team-carousel-track')
  const prevBtn = teamCarousel.querySelector('.team-carousel-nav--prev')
  const nextBtn = teamCarousel.querySelector('.team-carousel-nav--next')
  if (viewport && track && prevBtn && nextBtn) {
    let slides = Array.from(track.children)
    const originalCount = slides.length
    const maxVisible = 3
    if (originalCount > 1) {
      const firstClones = slides.slice(0, maxVisible).map((el) => el.cloneNode(true))
      const lastClones = slides.slice(-maxVisible).map((el) => el.cloneNode(true))
      lastClones.forEach((c) => track.insertBefore(c, track.firstChild))
      firstClones.forEach((c) => track.appendChild(c))
      slides = Array.from(track.children)
    }

    const getVisibleCount = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) return 3
      if (window.matchMedia('(min-width: 640px)').matches) return 2
      return 1
    }

    const syncTeamSlideWidths = () => {
      slides = Array.from(track.children)
      const vw = viewport.getBoundingClientRect().width
      const count = getVisibleCount()
      const g = window.getComputedStyle(track).gap
      const gap = parseFloat(g) || 16
      const w = Math.max(200, (vw - (count - 1) * gap) / count)
      slides.forEach((el) => {
        el.style.flex = `0 0 ${w}px`
      })
    }

    let index = originalCount > 1 ? maxVisible : 0
    let isAnimating = false

    const slideWidth = () => {
      const el = slides[0]
      if (!el) return 0
      const g = window.getComputedStyle(track).gap
      const gap = parseFloat(g) || 16
      return el.getBoundingClientRect().width + gap
    }

    const setPosition = (animate = true) => {
      const w = slideWidth()
      const x = -index * w
      track.style.transition = animate ? 'transform 0.55s cubic-bezier(0.33, 1, 0.32, 1)' : 'none'
      track.style.transform = `translate3d(${x}px,0,0)`
    }

    const go = (dir) => {
      if (isAnimating) return
      isAnimating = true
      index += dir
      setPosition(true)
    }

    const AUTO_TEAM_MS = 6000
    let teamAutoTimer = null
    const stopTeamAuto = () => {
      if (teamAutoTimer !== null) {
        clearInterval(teamAutoTimer)
        teamAutoTimer = null
      }
    }
    const startTeamAuto = () => {
      stopTeamAuto()
      if (reducedMotion || originalCount <= 1) return
      teamAutoTimer = window.setInterval(() => go(1), AUTO_TEAM_MS)
    }
    const restartTeamAuto = () => {
      stopTeamAuto()
      startTeamAuto()
    }

    track.addEventListener('transitionend', (e) => {
      if (e.target !== track || e.propertyName !== 'transform') return
      if (originalCount > 1) {
        if (index >= originalCount + maxVisible) {
          index = maxVisible
          setPosition(false)
        } else if (index <= maxVisible - 1) {
          index = originalCount + maxVisible - 1
          setPosition(false)
        }
      }
      isAnimating = false
    })

    prevBtn.addEventListener('click', () => {
      restartTeamAuto()
      go(-1)
    })
    nextBtn.addEventListener('click', () => {
      restartTeamAuto()
      go(1)
    })

    let teamTouchStartX = 0
    viewport.addEventListener(
      'touchstart',
      (e) => {
        teamTouchStartX = e.changedTouches[0].clientX
      },
      { passive: true },
    )
    viewport.addEventListener(
      'touchend',
      (e) => {
        const dx = e.changedTouches[0].clientX - teamTouchStartX
        if (Math.abs(dx) > 40) {
          restartTeamAuto()
          go(dx > 0 ? -1 : 1)
        }
      },
      { passive: true },
    )

    const onResizeTeam = () => {
      syncTeamSlideWidths()
      setPosition(false)
    }
    window.addEventListener('resize', onResizeTeam)
    syncTeamSlideWidths()
    setPosition(false)
    startTeamAuto()
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopTeamAuto()
      else startTeamAuto()
    })
  }
}

if (festivalLightboxCloseBtn) festivalLightboxCloseBtn.addEventListener('click', closeFestivalPhotoLightbox)
if (festivalPhotoLightbox) {
  festivalPhotoLightbox.addEventListener('click', (e) => {
    if (e.target === festivalPhotoLightbox) closeFestivalPhotoLightbox()
  })
}
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeFestivalPhotoLightbox()
})

document.querySelectorAll('video').forEach((video) => {
  video.addEventListener('play', () => {
    document.querySelectorAll('video').forEach((v) => {
      if (v !== video) v.pause()
    })
  })
})

document.body.addEventListener('click', (e) => {
  const stub = e.target.closest?.('[data-instagram-stub]')
  if (stub) e.preventDefault()
})

const registerForm = document.getElementById('register-form')
const regSubmit = document.getElementById('reg-submit')

function showFormMessage(message) {
  if (message) window.alert(message)
}

function setFieldInvalid(input, invalid, messageId, message) {
  input.setAttribute('aria-invalid', invalid ? 'true' : 'false')
  if (messageId) {
    let hint = document.getElementById(messageId)
    if (!hint && message) {
      hint = document.createElement('p')
      hint.id = messageId
      hint.className = 'mt-1 text-sm text-red-400'
      input.parentElement?.appendChild(hint)
    }
    if (hint) hint.textContent = invalid ? message : ''
  }
  input.classList.toggle('border-red-500', invalid)
  input.classList.toggle('focus:border-red-500', invalid)
}

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const name = registerForm.querySelector('#reg-name')
    const phone = registerForm.querySelector('#reg-phone')
    const email = registerForm.querySelector('#reg-email')
    const message = registerForm.querySelector('#reg-message')
    const captchaTokenInput = registerForm.querySelector('input[name="cf-turnstile-response"]')

    let ok = true
    if (name && !name.value.trim()) {
      setFieldInvalid(name, true, 'reg-name-hint', 'Укажите имя')
      ok = false
    } else if (name) setFieldInvalid(name, false, 'reg-name-hint', '')

    if (phone && !phone.value.trim()) {
      setFieldInvalid(phone, true, 'reg-phone-hint', 'Укажите телефон')
      ok = false
    } else if (phone) setFieldInvalid(phone, false, 'reg-phone-hint', '')

    if (email && email.value.trim()) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!re.test(email.value.trim())) {
        setFieldInvalid(email, true, 'reg-email-hint', 'Проверьте формат email')
        ok = false
      } else setFieldInvalid(email, false, 'reg-email-hint', '')
    } else if (email) setFieldInvalid(email, false, 'reg-email-hint', '')

    if (!ok) return

    if (captchaTokenInput && !captchaTokenInput.value.trim()) {
      showFormMessage('Подтвердите, что вы не робот.')
      return
    }

    const nameVal = name?.value.trim() || ''
    const phoneVal = phone?.value.trim() || ''
    const emailVal = email?.value.trim() || ''
    const messageVal = message?.value.trim() || ''
    const turnstileVal = captchaTokenInput?.value.trim() || ''

    const messageLines = [messageVal, `Телефон: ${phoneVal}`, emailVal ? `Email: ${emailVal}` : 'Email не указан']
      .filter(Boolean)
      .join('\n\n')

    const fd = new FormData(registerForm)
    fd.set('name', nameVal)
    fd.set('email', emailVal || '—')
    fd.set('phone', phoneVal)
    fd.set('message', messageLines)
    fd.set('_subject', 'Новая заявка Siai.fest')
    fd.set('_captcha', 'false')
    if (turnstileVal) fd.set('cf-turnstile-response', turnstileVal)

    if (regSubmit) regSubmit.disabled = true
    try {
      const res = await fetch(FORM_SUBMIT_AJAX, {
        method: 'POST',
        body: fd,
        headers: { Accept: 'application/json' },
      })
      const data = await res.json().catch(() => ({}))
      const ok = res.ok && (data.success === true || data.success === 'true')
      if (ok) {
        showFormMessage('Спасибо, заявка отправлена. Мы свяжемся с вами. Instagram: @siai.fest.')
        registerForm.reset()
        if (window.turnstile) window.turnstile.reset()
      } else {
        showFormMessage(
          (typeof data.message === 'string' && data.message) ||
            'Не удалось отправить. Проверьте данные или напишите на Maria.solaar@yandex.ru.',
        )
      }
    } catch {
      showFormMessage('Ошибка сети. Попробуйте позже или напишите на Maria.solaar@yandex.ru.')
    } finally {
      if (regSubmit) regSubmit.disabled = false
    }
  })
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
