import './style.css'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { formConfig } from './config.js'

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const staggerSections = document.querySelectorAll('.js-stagger-section')
staggerSections.forEach((section) => {
  const nodes = section.querySelectorAll(
    'h1, h2, h3, p, article, li, blockquote, .interactive-btn, .video-card, .video-nav, .text-review-card, .master-card, .archive-video-card, .archive-nav',
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

    const AUTO_SLIDE_MS = 6000
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

const archiveLightbox = document.getElementById('archive-video-lightbox')
const archivePlayer = document.getElementById('archive-lightbox-player')
const archiveCloseBtn = document.querySelector('[data-archive-lightbox-close]')

let archiveAutoplayStop = () => {}
let archiveAutoplayStart = () => {}

function closeArchiveLightbox() {
  if (!archiveLightbox || !archivePlayer) return
  archivePlayer.pause()
  archivePlayer.removeAttribute('src')
  archivePlayer.load()
  archiveLightbox.classList.add('hidden')
  archiveLightbox.classList.remove('flex')
  document.body.style.overflow = ''
  archiveAutoplayStart()
}

function openArchiveLightbox(src) {
  if (!archiveLightbox || !archivePlayer || !src) return
  archiveAutoplayStop()
  archivePlayer.src = src
  archiveLightbox.classList.remove('hidden')
  archiveLightbox.classList.add('flex')
  document.body.style.overflow = 'hidden'
  archivePlayer.play().catch(() => {})
}

const archiveVideos = document.querySelector('[data-archive-videos]')
if (archiveVideos) {
  const viewport = archiveVideos.querySelector('#archive-viewport')
  const track = archiveVideos.querySelector('#archive-track')
  const prevBtn = archiveVideos.querySelector('.archive-nav--prev')
  const nextBtn = archiveVideos.querySelector('.archive-nav--next')
  if (viewport && track && prevBtn && nextBtn) {
    let slides = Array.from(track.children)
    const originalCount = slides.length
    const visible = 5
    if (originalCount > 1) {
      const firstClones = slides.slice(0, visible).map((el) => el.cloneNode(true))
      const lastClones = slides.slice(-visible).map((el) => el.cloneNode(true))
      lastClones.forEach((c) => track.insertBefore(c, track.firstChild))
      firstClones.forEach((c) => track.appendChild(c))
      slides = Array.from(track.children)
    }

    const syncArchiveSlideWidths = () => {
      slides = Array.from(track.children)
      const vw = viewport.getBoundingClientRect().width
      const isLg = window.matchMedia('(min-width: 1024px)').matches
      const isMd = window.matchMedia('(min-width: 768px)').matches
      const count = isLg ? 5 : isMd ? 3 : 2
      const gap = isMd ? 16 : 12
      const w = Math.max(112, (vw - (count - 1) * gap) / count)
      slides.forEach((el) => {
        el.style.flex = `0 0 ${w}px`
      })
    }

    let index = visible
    let isAnimating = false

    const slideWidth = () => {
      const el = slides[0]
      if (!el) return 0
      const g = window.getComputedStyle(track).gap
      const gap = parseFloat(g) || 16
      return el.getBoundingClientRect().width + gap
    }

    const archiveSlideTransition = 'transform 0.65s cubic-bezier(0.33, 1, 0.32, 1)'

    const setPosition = (animate = true) => {
      const w = slideWidth()
      const x = -index * w
      track.style.transition = animate ? archiveSlideTransition : 'none'
      track.style.transform = `translate3d(${x}px,0,0)`
    }

    const go = (dir) => {
      if (isAnimating) return
      isAnimating = true
      index += dir
      setPosition(true)
    }

    const AUTO_ARCHIVE_MS = 6000
    let archiveAutoTimer = null
    const stopArchiveAutoSlide = () => {
      if (archiveAutoTimer !== null) {
        clearInterval(archiveAutoTimer)
        archiveAutoTimer = null
      }
    }
    const startArchiveAutoSlide = () => {
      stopArchiveAutoSlide()
      if (reducedMotion || slides.length <= 1) return
      if (archiveLightbox && !archiveLightbox.classList.contains('hidden')) return
      archiveAutoTimer = window.setInterval(() => go(1), AUTO_ARCHIVE_MS)
    }
    const restartArchiveAutoSlide = () => {
      stopArchiveAutoSlide()
      startArchiveAutoSlide()
    }

    archiveAutoplayStop = stopArchiveAutoSlide
    archiveAutoplayStart = startArchiveAutoSlide

    track.addEventListener('transitionend', (e) => {
      if (e.target !== track || e.propertyName !== 'transform') return
      if (index >= originalCount + visible) {
        index = visible
        setPosition(false)
      } else if (index <= visible - 1) {
        index = originalCount + visible - 1
        setPosition(false)
      }
      isAnimating = false
    })

    prevBtn.addEventListener('click', () => {
      restartArchiveAutoSlide()
      go(-1)
    })
    nextBtn.addEventListener('click', () => {
      restartArchiveAutoSlide()
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
          restartArchiveAutoSlide()
          go(dx > 0 ? -1 : 1)
        }
      },
      { passive: true },
    )

    const onResizeArchive = () => {
      syncArchiveSlideWidths()
      setPosition(false)
    }
    window.addEventListener('resize', onResizeArchive)
    syncArchiveSlideWidths()
    setPosition(false)
    startArchiveAutoSlide()
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopArchiveAutoSlide()
      else startArchiveAutoSlide()
    })

    viewport.addEventListener('click', (e) => {
      const btn = e.target.closest('.archive-video-card[data-archive-src]')
      if (btn) {
        const src = btn.getAttribute('data-archive-src')
        if (src) openArchiveLightbox(src)
      }
    })
  }
}

if (archiveCloseBtn) archiveCloseBtn.addEventListener('click', closeArchiveLightbox)
if (archiveLightbox) {
  archiveLightbox.addEventListener('click', (e) => {
    if (e.target === archiveLightbox) closeArchiveLightbox()
  })
}
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeArchiveLightbox()
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

const accessKeyInput = document.querySelector('#register-form input[name="access_key"]')
if (accessKeyInput && formConfig.web3formsAccessKey) {
  accessKeyInput.value = formConfig.web3formsAccessKey
}

const registerForm = document.getElementById('register-form')
const regStatus = document.getElementById('reg-status')
const regSubmit = document.getElementById('reg-submit')

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

if (registerForm && regStatus) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    regStatus.textContent = ''

    const name = registerForm.querySelector('#reg-name')
    const phone = registerForm.querySelector('#reg-phone')
    const email = registerForm.querySelector('#reg-email')
    const message = registerForm.querySelector('#reg-message')

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

    const payload = {
      access_key: formConfig.web3formsAccessKey || accessKeyInput?.value || '',
      subject: 'Новая заявка SIYAI.FEST',
      name: name?.value.trim() || '',
      phone: phone?.value.trim() || '',
      email: email?.value.trim() || '',
      message: message?.value.trim() || '',
    }

    if (!payload.access_key) {
      regStatus.textContent =
        'Не задан ключ Web3Forms: добавьте VITE_WEB3FORMS_ACCESS_KEY в файл .env и перезапустите сборку.'
      return
    }

    if (regSubmit) regSubmit.disabled = true
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (data.success) {
        const stub = formConfig.instagramAfterFormStubUrl || '#'
        regStatus.innerHTML = `Спасибо, мы свяжемся с вами. Далее - переход в Instagram: <a href="${stub}" class="text-[#c9a96e] underline underline-offset-4" data-instagram-stub>@siai.fest</a> (ссылка-заглушка).`
        registerForm.reset()
      } else {
        regStatus.textContent = data.message || 'Не удалось отправить. Попробуйте позже.'
      }
    } catch {
      regStatus.textContent = 'Ошибка сети. Попробуйте позже.'
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
