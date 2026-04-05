import './style.css'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { formConfig } from './config.js'

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

AOS.init({
  duration: 650,
  easing: 'ease-out-cubic',
  once: true,
  offset: 32,
  delay: 0,
  disable: reducedMotion,
})

function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
}

document.querySelectorAll('[data-scroll-to]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-scroll-to')
    if (id) scrollToId(id)
  })
})

/* Lightbox */
const lightbox = document.getElementById('lightbox')
const lightboxImg = document.getElementById('lightbox-img')
const lightboxClose = document.getElementById('lightbox-close')

function openLightbox(src, alt) {
  if (!lightbox || !lightboxImg) return
  lightboxImg.src = src
  lightboxImg.alt = alt || 'Фото в полном размере'
  lightbox.classList.remove('hidden')
  lightbox.classList.add('flex')
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  if (!lightbox || !lightboxImg) return
  lightbox.classList.add('hidden')
  lightbox.classList.remove('flex')
  lightboxImg.src = ''
  document.body.style.overflow = ''
}

document.querySelectorAll('.gallery-thumb[data-lightbox]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const src = btn.getAttribute('data-lightbox')
    const img = btn.querySelector('img')
    openLightbox(src, img?.getAttribute('alt') || '')
  })
})

lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox()
})

lightboxClose?.addEventListener('click', (e) => {
  e.stopPropagation()
  closeLightbox()
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox && !lightbox.classList.contains('hidden')) {
    closeLightbox()
  }
})

/* Отзывы: слайдер — 1 карточка на экране до md, 3 карточки с md (768px) */
const REVIEWS_GAP_PX = 16
const REVIEWS_MD_MIN = 768

function initReviewsSlider() {
  const viewport = document.getElementById('reviews-viewport')
  const track = document.getElementById('reviews-track')
  const prevBtn = document.getElementById('reviews-prev')
  const nextBtn = document.getElementById('reviews-next')
  const dotsContainer = document.getElementById('reviews-dots')
  const statusEl = document.getElementById('reviews-status')
  const sliderRoot = document.querySelector('[data-reviews-slider]')
  if (!viewport || !track || !dotsContainer || !sliderRoot) return

  const slides = Array.from(track.querySelectorAll('.reviews-slide'))
  if (slides.length === 0) return

  let index = 0
  let touchStartX = null
  let lastMaxIndex = -1

  function visibleCount() {
    return window.innerWidth >= REVIEWS_MD_MIN ? 3 : 1
  }

  function maxIndex() {
    const v = visibleCount()
    return Math.max(0, slides.length - v)
  }

  function cardWidthPx() {
    const vw = viewport.offsetWidth
    const v = visibleCount()
    if (v === 1) return vw
    return (vw - REVIEWS_GAP_PX * (v - 1)) / v
  }

  function buildDots() {
    const mx = maxIndex()
    if (mx === lastMaxIndex && dotsContainer.querySelector('[data-review-dot]')) return
    lastMaxIndex = mx
    dotsContainer.innerHTML = ''
    for (let i = 0; i <= mx; i++) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.setAttribute('role', 'tab')
      btn.setAttribute('data-review-dot', '')
      btn.setAttribute(
        'aria-label',
        visibleCount() === 3 ? `Показать отзывы, начиная с ${i + 1}-го` : `Показать отзыв ${i + 1} из ${slides.length}`,
      )
      btn.className =
        'h-2 shrink-0 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ' +
        (i === index ? 'w-8 bg-accent' : 'w-2 bg-stone-300')
      btn.addEventListener('click', () => goTo(i))
      dotsContainer.appendChild(btn)
    }
  }

  function updateNav() {
    const mx = maxIndex()
    if (prevBtn) {
      prevBtn.disabled = index <= 0
      prevBtn.setAttribute('aria-disabled', index <= 0 ? 'true' : 'false')
    }
    if (nextBtn) {
      nextBtn.disabled = index >= mx
      nextBtn.setAttribute('aria-disabled', index >= mx ? 'true' : 'false')
    }
  }

  function updateDots() {
    const dots = dotsContainer.querySelectorAll('[data-review-dot]')
    dots.forEach((dot, i) => {
      const active = i === index
      dot.setAttribute('aria-selected', active ? 'true' : 'false')
      dot.classList.toggle('bg-accent', active)
      dot.classList.toggle('w-8', active)
      dot.classList.toggle('bg-stone-300', !active)
      dot.classList.toggle('w-2', !active)
    })
    const v = visibleCount()
    if (statusEl) {
      if (v === 1) {
        statusEl.textContent = `Отзыв ${index + 1} из ${slides.length}`
      } else {
        statusEl.textContent = `Показаны отзывы ${index + 1}–${Math.min(index + v, slides.length)} из ${slides.length}`
      }
    }
  }

  function setAriaHidden() {
    const v = visibleCount()
    slides.forEach((slide, i) => {
      const visible = i >= index && i < index + v
      slide.setAttribute('aria-hidden', visible ? 'false' : 'true')
    })
  }

  function goTo(nextIndex, animate = true) {
    const mx = maxIndex()
    index = Math.max(0, Math.min(nextIndex, mx))
    const cw = cardWidthPx()
    const offset = index * (cw + REVIEWS_GAP_PX)
    const useMotion = animate && !reducedMotion
    track.style.transition = useMotion ? 'transform 0.45s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
    track.style.transform = `translate3d(-${offset}px, 0, 0)`

    slides.forEach((slide) => {
      slide.style.flexShrink = '0'
      slide.style.width = `${cw}px`
      slide.style.minWidth = `${cw}px`
      slide.style.flexBasis = `${cw}px`
    })

    setAriaHidden()
    updateDots()
    updateNav()
  }

  function layout() {
    buildDots()
    const mx = maxIndex()
    if (index > mx) index = mx
    goTo(index, false)
  }

  prevBtn?.addEventListener('click', () => goTo(index - 1))
  nextBtn?.addEventListener('click', () => goTo(index + 1))

  viewport.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.changedTouches[0].screenX
    },
    { passive: true },
  )
  viewport.addEventListener(
    'touchend',
    (e) => {
      if (touchStartX === null) return
      const dx = e.changedTouches[0].screenX - touchStartX
      if (Math.abs(dx) > 48) {
        if (dx > 0) goTo(index - 1)
        else goTo(index + 1)
      }
      touchStartX = null
    },
    { passive: true },
  )

  sliderRoot.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goTo(index - 1)
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      goTo(index + 1)
    }
  })

  const ro = new ResizeObserver(() => layout())
  ro.observe(viewport)
  layout()
}

initReviewsSlider()

/* Form */
const form = document.getElementById('registration-form')
const formSuccess = document.getElementById('form-success')
const formError = document.getElementById('form-error')
const formFields = document.getElementById('form-fields')
const submitBtn = document.getElementById('form-submit')

const nameInput = document.getElementById('name')
const phoneInput = document.getElementById('phone')
const emailInput = document.getElementById('email')
const nameFieldError = document.getElementById('name-field-error')
const phoneFieldError = document.getElementById('phone-field-error')
const emailFieldError = document.getElementById('email-field-error')

function showError(msg) {
  if (!formError) return
  formError.textContent = msg
  formError.classList.remove('hidden')
}

function hideError() {
  formError?.classList.add('hidden')
}

function phoneDigits(value) {
  return value.replace(/\D/g, '')
}

function validateName(value) {
  const t = value.trim()
  if (t.length < 2) return 'Введите имя (не короче 2 символов).'
  if (t.length > 120) return 'Слишком длинное имя.'
  if (!/[\p{L}]/u.test(t)) return 'Имя должно содержать буквы.'
  return null
}

function validatePhone(value) {
  const d = phoneDigits(value)
  if (d.length < 10) return 'Введите номер полностью — не меньше 10 цифр.'
  if (d.length > 15) return 'Проверьте номер: слишком много цифр.'
  return null
}

function validateEmailOptional(value) {
  const t = value.trim()
  if (!t) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) {
    return 'Проверьте формат email, например name@mail.ru'
  }
  return null
}

function setFieldError(input, errorEl, message) {
  if (!input || !errorEl) return
  if (message) {
    errorEl.textContent = message
    errorEl.classList.remove('hidden')
    input.setAttribute('aria-invalid', 'true')
    input.classList.add('form-input-register--invalid')
  } else {
    errorEl.textContent = ''
    errorEl.classList.add('hidden')
    input.setAttribute('aria-invalid', 'false')
    input.classList.remove('form-input-register--invalid')
  }
}

function validateFormFields() {
  const errName = validateName(nameInput?.value ?? '')
  const errPhone = validatePhone(phoneInput?.value ?? '')
  const errEmail = validateEmailOptional(emailInput?.value ?? '')

  setFieldError(nameInput, nameFieldError, errName)
  setFieldError(phoneInput, phoneFieldError, errPhone)
  setFieldError(emailInput, emailFieldError, errEmail)

  if (errName || errPhone || errEmail) {
    if (errName) nameInput?.focus()
    else if (errPhone) phoneInput?.focus()
    else emailInput?.focus()
    return false
  }
  return true
}

nameInput?.addEventListener('input', () => {
  hideError()
  setFieldError(nameInput, nameFieldError, null)
})
phoneInput?.addEventListener('input', () => {
  hideError()
  setFieldError(phoneInput, phoneFieldError, null)
})
emailInput?.addEventListener('input', () => {
  hideError()
  setFieldError(emailInput, emailFieldError, null)
})

async function submitForm(data) {
  const { mode, web3formsAccessKey, formEndpoint, webhookUrl, whatsappPhone } = formConfig

  if (mode === 'mock') {
    console.info('[Сияй] mock submit:', data)
    return
  }

  if (mode === 'web3forms') {
    if (!web3formsAccessKey) {
      throw new Error('Не задан VITE_WEB3FORMS_ACCESS_KEY в .env (получите ключ на web3forms.com)')
    }
    const name = data.name?.trim() || '—'
    const email = data.email?.trim()
    const message = [
      'Заявка с лендинга «Сияй».',
      '',
      `Имя: ${name}`,
      `Телефон: ${data.phone}`,
      email ? `Email: ${email}` : 'Email в форме не указан.',
    ].join('\n')

    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: web3formsAccessKey,
        subject: 'Заявка с сайта «Сияй»',
        name,
        email: email || 'not-provided@example.com',
        message,
        phone: data.phone,
      }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok || json.success === false) {
      throw new Error(json.message || 'Ошибка отправки заявки')
    }
    return
  }

  if (mode === 'whatsapp') {
    if (!whatsappPhone) {
      throw new Error('Не задан VITE_WHATSAPP_PHONE в .env')
    }
    const text = encodeURIComponent(
      `Заявка «Сияй»: ${data.name}, тел. ${data.phone}${data.email ? `, ${data.email}` : ''}`,
    )
    window.open(`https://wa.me/${whatsappPhone.replace(/\D/g, '')}?text=${text}`, '_blank', 'noopener,noreferrer')
    return
  }

  if (mode === 'formspree') {
    if (!formEndpoint) throw new Error('Не задан VITE_FORM_ENDPOINT')
    const res = await fetch(formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        email: data.email || '',
        _subject: 'Заявка с сайта Сияй',
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Ошибка отправки')
    }
    return
  }

  if (mode === 'webhook') {
    if (!webhookUrl) throw new Error('Не задан VITE_WEBHOOK_URL')
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        email: data.email || '',
        source: 'siyay-landing',
      }),
    })
    if (!res.ok) throw new Error('Сервер отклонил заявку')
    return
  }

  throw new Error(`Неизвестный режим формы: ${mode}`)
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault()
  hideError()

  if (!validateFormFields()) return

  const name = nameInput?.value.trim() || ''
  const phone = phoneInput?.value.trim() || ''
  const email = emailInput?.value.trim() || ''

  submitBtn.disabled = true
  try {
    await submitForm({ name, phone, email })
    formFields?.classList.add('hidden')
    formSuccess?.classList.remove('hidden')
  } catch (err) {
    console.error(err)
    showError(err.message || 'Не удалось отправить. Попробуйте позже или напишите нам в мессенджер.')
  } finally {
    submitBtn.disabled = false
  }
})
