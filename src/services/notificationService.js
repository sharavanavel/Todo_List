// ============================================================
// notificationService.js
// ------------------------------------------------------------
// Everything related to REMINDERS and EMAIL NOTIFICATIONS lives
// in this one file, so beginners only have to edit here.
// ============================================================
import emailjs from '@emailjs/browser';

// ==========================================
// 🔑 EMAILJS & GMAIL CONFIGURATION
// Fill in your credentials from https://www.emailjs.com/
// ==========================================
// Step-by-step guide with screenshots-level detail: see README.md,
// the section "How to send real emails with EmailJS".
export const EMAILJS_SERVICE_ID = 'service_1jbuare';     // 👈 paste your Service ID (e.g. 'service_abc123')
export const EMAILJS_TEMPLATE_ID = 'template_om944zj';   // 👈 paste your Template ID (e.g. 'template_xyz789')
export const EMAILJS_PUBLIC_KEY = '6U-0Knw8O0qBlYPYF';     // 👈 paste your Public Key (e.g. 'AbCdEfGhIjKlMnOp')

// 👉 CONFIGURE YOUR GMAIL ADDRESS HERE:
export const USER_GMAIL = 'sharavanavelvarshini@gmail.com';
// ^^^ Replace the text above (keep the quotes) with your own Gmail
//     address, for example: const USER_GMAIL = 'sharavanavel@gmail.com';

// A tiny helper that tells us whether the keys above are still placeholders.
// When they are, we skip the real email and just explain it in the console.
function emailJsIsConfigured() {
  const placeholders = ['YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', 'YOUR_PUBLIC_KEY'];
  const values = [EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY];
  return values.every((value, i) => value && value !== placeholders[i]);
}

// ------------------------------------------------------------
// 1. Browser notification permission
// ------------------------------------------------------------
// Browsers only show notifications after the user says "Allow".
// We ask once, when the app starts.
export function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('[notifications] This browser does not support notifications.');
    return;
  }
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// ------------------------------------------------------------
// 2. Show a browser notification (falls back to alert())
// ------------------------------------------------------------
export function showBrowserNotification(title, body) {
  const canNotify =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted';

  if (canNotify) {
    new Notification(title, { body });
  } else {
    // Fallback so the reminder is never silently missed.
    window.alert(`${title}\n\n${body}`);
  }
}

// ------------------------------------------------------------
// 3. Turn a task's dueDate + dueTime into a real Date object
// ------------------------------------------------------------
// dueDate looks like "2026-09-19" and dueTime like "14:30".
// If there is no date we cannot schedule anything, so we return null.
// If there is a date but no time, we assume 09:00 in the morning.
export function getTaskDueDateTime(task) {
  if (!task.dueDate) return null;
  const time = task.dueTime ? task.dueTime : '09:00';
  const due = new Date(`${task.dueDate}T${time}`);
  return isNaN(due.getTime()) ? null : due;
}

// ------------------------------------------------------------
// 4. Human friendly text, e.g. "19/09/2026 at 02:30 PM"
// ------------------------------------------------------------
export function formatDueDateTime(task) {
  if (!task.dueDate) return '';
  const [year, month, day] = task.dueDate.split('-');
  let text = `${day}/${month}/${year}`;

  if (task.dueTime) {
    const [hourString, minute] = task.dueTime.split(':');
    const hour24 = Number(hourString);
    const suffix = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    text += ` at ${String(hour12).padStart(2, '0')}:${minute} ${suffix}`;
  }

  return text;
}

// ------------------------------------------------------------
// 5. Build the email that would be sent to your Gmail address
// ------------------------------------------------------------
export function buildEmailPayload(task) {
  return {
    to: USER_GMAIL,
    subject: `Task reminder: ${task.title}`,
    body:
      `Hi!\n\nThis is your reminder for the task "${task.title}".\n` +
      (task.description ? `Details: ${task.description}\n` : '') +
      `Scheduled for: ${formatDueDateTime(task)}\n` +
      `Priority: ${task.priority || 'Normal'}   Category: ${task.category || 'General'}\n\n` +
      `— Personal Daily Task Manager`,
  };
}

export function buildMailtoLink(task) {
  const { to, subject, body } = buildEmailPayload(task);
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ------------------------------------------------------------
// 6. SEND A REAL EMAIL through EmailJS + Gmail
// ------------------------------------------------------------
// This calls emailjs.send() with the keys you pasted at the top of
// this file. The template variables ({{task_title}} etc.) must match
// the template you create on emailjs.com — see the README guide.
//
// Returns one of:
//   'sent'        → the email really went out
//   'not-configured' → keys are still placeholders (nothing sent)
//   'failed'      → EmailJS was configured but the send errored
export async function sendTaskEmailReminder(task) {
  // Friendly message instead of a scary error when keys are missing.
  if (!emailJsIsConfigured()) {
    console.log(
      '[notifications] ✉️ EmailJS is not configured yet, so no real email was sent.\n' +
        '  To enable real Gmail reminders, open\n' +
        '  src/services/notificationService.js (lines 15–17) and paste your\n' +
        '  Service ID, Template ID and Public Key from https://www.emailjs.com/\n' +
        '  A step-by-step guide is in the README.'
    );
    console.log('[notifications] Email payload that would have been sent →', buildEmailPayload(task));
    return 'not-configured';
  }

  // These names MUST match the {{variables}} in your EmailJS template.
  const templateParams = {
    task_title: task.title,
    task_description: task.description || '(no description)',
    due_date: task.dueDate || '(no date)',
    due_time: task.dueTime || '(no time)',
    priority: task.priority || 'Normal',
    category: task.category || 'General',
    to_email: USER_GMAIL,
  };

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, {
      publicKey: EMAILJS_PUBLIC_KEY,
    });
    console.log('[notifications] ✅ Email sent via EmailJS to', USER_GMAIL);
    return 'sent';
  } catch (error) {
    console.error('[notifications] ❌ EmailJS send failed:', error);
    return 'failed';
  }
}

// ------------------------------------------------------------
// 7. Fire the whole reminder: notification + real email attempt
// ------------------------------------------------------------
// Returns the email result ('sent' | 'not-configured' | 'failed') so
// App.jsx can mark the task with emailSent: true and show a status.
export async function sendTaskReminder(task) {
  const when = formatDueDateTime(task);

  // (a) Browser notification / alert
  showBrowserNotification('⏰ Task reminder', `${task.title}\nDue: ${when}`);

  // (b) Real email via EmailJS (graceful no-op until keys are filled in)
  const emailResult = await sendTaskEmailReminder(task);

  // (c) Returning the mailto link lets the UI offer a 1-click email button.
  return { emailResult, mailtoLink: buildMailtoLink(task) };
}
