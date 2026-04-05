/**
 * Настройка отправки формы. Значения можно задать через .env (см. .env.example).
 *
 * mode:
 * - mock — только UI успеха (для вёрстки)
 * - web3forms — письма на почту через api.web3forms.com (нужен VITE_WEB3FORMS_ACCESS_KEY)
 * - formspree — POST на endpoint Formspree / Getform
 * - webhook — POST JSON на ваш URL (Sheets Apps Script, CRM)
 * - whatsapp — открывает чат с текстом заявки
 */
const env = import.meta.env

export const formConfig = {
  mode: env.VITE_FORM_MODE || 'mock',
  /** Ключ с https://web3forms.com — почта получателя задаётся при создании ключа */
  web3formsAccessKey: env.VITE_WEB3FORMS_ACCESS_KEY || '',
  /** URL для formspree / getform: https://formspree.io/f/xxxx */
  formEndpoint: env.VITE_FORM_ENDPOINT || '',
  /** POST JSON { name, phone, email } */
  webhookUrl: env.VITE_WEBHOOK_URL || '',
  /** Номер в международном формате без +, например 79991234567 */
  whatsappPhone: env.VITE_WHATSAPP_PHONE || '',
}
