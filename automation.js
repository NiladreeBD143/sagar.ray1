javascript:(function () {
    'use strict';

    // 💠 Common Utilities
    const getToken = () => document.querySelector('input[name="_token"]')?.value || new URLSearchParams(document.cookie).get('XSRF-TOKEN');

    const postForm = (url, data) => {
        const form = new URLSearchParams();
        for (let key in data) form.append(key, data[key]);
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: form.toString()
        }).then(res => res.json());
    };

    // 🌑 Dark Mode Panel Styling
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.top = '50px';
    panel.style.left = '20px';
    panel.style.zIndex = '9999';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.alignItems = 'flex-start';
    panel.style.padding = '20px';
    panel.style.borderRadius = '16px';
    panel.style.background = 'rgba(20, 20, 20, 0.75)';
    panel.style.backdropFilter = 'blur(10px)';
    panel.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
    panel.style.color = '#fff';
    panel.style.cursor = 'move';
    panel.id = 'custom-floating-panel';
    document.body.appendChild(panel);

    // 🟥 Close Button
    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '6px';
    closeBtn.style.right = '10px';
    closeBtn.style.fontSize = '18px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = '#fff';
    closeBtn.style.fontWeight = 'bold';
    panel.appendChild(closeBtn);
    closeBtn.onclick = () => panel.remove();

    // 🟨 Make Panel Draggable
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    panel.addEventListener('mousedown', function (e) {
        if (e.target !== panel && e.target !== closeBtn) return;
        isDragging = true;
        offsetX = e.clientX - panel.getBoundingClientRect().left;
        offsetY = e.clientY - panel.getBoundingClientRect().top;
    });

    document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        panel.style.left = (e.clientX - offsetX) + 'px';
        panel.style.top = (e.clientY - offsetY) + 'px';
    });

    document.addEventListener('mouseup', function () {
        isDragging = false;
    });

    // 📌 Notification Stack
    const notifyStack = document.createElement('div');
    notifyStack.style.position = 'fixed';
    notifyStack.style.top = '50px';
    notifyStack.style.right = '20px';
    notifyStack.style.display = 'flex';
    notifyStack.style.flexDirection = 'column';
    notifyStack.style.gap = '10px';
    notifyStack.style.zIndex = '99999';
    document.body.appendChild(notifyStack);

    const pushNotification = (msg, type = 'info') => {
        const note = document.createElement('div');
        note.textContent = msg;
        note.style.padding = type === 'success' ? '14px 20px' : '10px 16px';
        note.style.borderRadius = '12px';
        note.style.fontSize = type === 'success' ? '16px' : '14px';
        note.style.fontWeight = 'bold';
        note.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
        note.style.backdropFilter = 'blur(6px)';
        note.style.color = 'white';
        note.style.maxWidth = '320px';
        note.style.lineHeight = '1.4';
        note.style.background = {
            success: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
            error: 'rgba(220,53,69,0.9)',
            info: 'rgba(0,123,255,0.8)'
        }[type] || 'rgba(0,0,0,0.7)';
        notifyStack.appendChild(note);
        setTimeout(() => note.remove(), type === 'success' ? 6000 : 4000);
    };

    // 💠 Glass Button Styling
    const glassStyle = `
        position: relative;
        margin: 8px 0;
        padding: 10px 20px;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 6px;
        backdrop-filter: blur(8px);
    `;

    const createButton = (label, onClick) => {
        const btn = document.createElement('button');
        btn.innerHTML = label;
        btn.style = glassStyle;
        btn.onclick = onClick;
        panel.appendChild(btn);
    };

    // ✅ OTP Input
    const otpInput = document.createElement('input');
    otpInput.type = 'text';
    otpInput.id = 'otpBox';
    otpInput.placeholder = 'Enter OTP';
    otpInput.style = `
        padding: 8px;
        margin: 8px 0;
        width: 140px;
        border-radius: 10px;
        border: 1px solid #555;
        font-size: 14px;
        background: rgba(255,255,255,0.1);
        color: white;
        backdrop-filter: blur(8px);
    `;
    panel.appendChild(otpInput);

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.id = 'appointment_date';
    dateInput.value = '2025-04-17';
    dateInput.style = otpInput.style;
    panel.appendChild(dateInput);

    const timeSelect = document.createElement('select');
    timeSelect.id = 'appointment_time';
    timeSelect.style = otpInput.style;
    ['10', '11', '12'].forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        const hour = parseInt(time);
        option.textContent = `${hour}:00 - ${hour}:59`;
        timeSelect.appendChild(option);
    });
    panel.appendChild(timeSelect);

    // ✅ Functional Buttons
    createButton('📩 Send OTP', () => {
        postForm('/pay-otp-sent', { _token: getToken() }).then(res => pushNotification('Send OTP: ' + res.message, res.success ? 'success' : 'error'));
    });

    createButton('♻️ Resend OTP', () => {
        postForm('/pay-otp-sent', { _token: getToken(), resend: 1 }).then(res => pushNotification('Resend OTP: ' + res.message, res.success ? 'success' : 'error'));
    });

    createButton('🔐 Verify OTP', () => {
        const otp = otpInput.value;
        if (!otp) return pushNotification('Please enter OTP!', 'error');
        postForm('/pay-otp-verify', { _token: getToken(), otp }).then(res => pushNotification('Verify OTP: ' + (res.success ? 'Success' : 'Failed'), res.success ? 'success' : 'error'));
    });

    createButton('📅 Set Appointment', () => {
        const date = dateInput.value;
        postForm('/pay-slot-time', { _token: getToken(), appointment_date: date }).then(res => {
            console.log('Slot response:', res);
            pushNotification('Slot Fetch: ' + (res.success ? 'Available' : 'Unavailable'), res.success ? 'success' : 'error');
        });
    });

    createButton('📍 Show reCAPTCHA', function () {
        if (document.getElementById('hash-param')) return pushNotification('Already visible', 'info');
        window.setRecaptchaTokenPay = function (token) {
            console.log('Captcha Token received:', token);
            document.body.setAttribute('data-hash-param', token);
            pushNotification('Captcha verified ✅', 'success');
        };
        const captchaContainer = document.createElement('div');
        captchaContainer.id = 'hash-param';
        captchaContainer.className = 'g-recaptcha';
        captchaContainer.setAttribute('data-sitekey', '6LdOCpAqAAAAAOLNB3Vwt_H7Nw4GGCAbdYm5Brsb');
        captchaContainer.setAttribute('data-callback', 'setRecaptchaTokenPay');
        captchaContainer.style.marginTop = '12px';
        panel.appendChild(captchaContainer);
        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
    });

    createButton('💳 Pay Now', () => {
        const date = dateInput.value;
        const time = timeSelect.value;
        const hash_param = document.body.getAttribute('data-hash-param');
        if (!hash_param) return pushNotification('Please complete CAPTCHA first to generate hash_param!', 'error');
        postForm('/paynow', {
            _token: getToken(),
            appointment_date: date,
            appointment_time: time,
            hash_param: hash_param,
            'selected_payment[name]': 'VISA',
            'selected_payment[slug]': 'visacard',
            'selected_payment[link]': 'https://securepay.sslcommerz.com/gwprocess/v4/image/gw1/visa.png'
        }).then(res => {
            console.log('PayNow Response:', res);
            if (res.success && res.url) {
                pushNotification('✅ Redirecting to payment gateway...', 'success');
                window.open(res.url, '_blank');
            } else {
                pushNotification('❌ PayNow Failed: ' + (res.message || 'Unknown error'), 'error');
            }
        });
    });

})();
