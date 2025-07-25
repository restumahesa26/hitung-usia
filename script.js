// --- NEW: Anti-Copy/Paste Measures ---
// Disable right-click menu
document.addEventListener('contextmenu', event => event.preventDefault());
// Disable DevTools shortcuts
document.addEventListener('keydown', function (e) {
	if (e.key === 'F12' || 
		(e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
		(e.ctrlKey && e.key === 'U')) {
		e.preventDefault();
	}
});
// DOM Elements 
const birthdateInput = document.getElementById('birthdate');
const calculateBtn = document.getElementById('calculateBtn');
const messageDiv = document.getElementById('message');
const loadingAnimation = document.getElementById('loadingAnimation');
const ageResultDiv = document.getElementById('ageResult');
const ageDisplayDiv = document.getElementById('ageDisplay');
const zodiacShioResultDiv = document.getElementById('zodiacShioResult');
const zodiacDisplayDiv = document.getElementById('zodiacDisplay');
const shioDisplayDiv = document.getElementById('shioDisplay');

let ageInterval;

// --- Initialize Flatpickr ---
flatpickr("#birthdate", {
	dateFormat: "Y-m-d", maxDate: "today", altInput: true, altFormat: "j F Y", "disableMobile": true,
});

// --- HELPER FUNCTIONS ---
// Changed padding and font size for better mobile view
function createTimeUnitBox(label, unitId) {
	return `<div class="bg-amber-100/50 p-3 sm:p-4 rounded-lg border border-amber-300 shadow-inner"><div id="${unitId}" class="text-3xl sm:text-4xl font-bold text-amber-900">0</div><div class="text-sm uppercase tracking-wider">${label}</div></div>`;
}

function animateValue(element, start, end, duration) {
	let startTimestamp = null;
	const step = (timestamp) => {
		if (!startTimestamp) startTimestamp = timestamp;
		const progress = Math.min((timestamp - startTimestamp) / duration, 1);
		element.innerHTML = Math.floor(progress * (end - start) + start);
		if (progress < 1) { window.requestAnimationFrame(step); } 
		else { element.innerHTML = end; }
	};
	window.requestAnimationFrame(step);
}

function getZodiac(day, month) {
	if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
	if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Pisces";
	if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
	if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
	if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
	if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
	if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
	if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
	if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
	if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
	if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
	if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
}

function getShio(year) {
	const animals = ['Tikus', 'Kerbau', 'Macan', 'Kelinci', 'Naga', 'Ular', 'Kuda', 'Kambing', 'Monyet', 'Ayam', 'Anjing', 'Babi'];
	return animals[(year - 4) % 12];
}

// --- MAIN CALCULATION FUNCTION ---
function calculateDetails() {
	const birthDateString = birthdateInput.value;
	if (!birthDateString) {
		messageDiv.textContent = 'Silakan pilih tanggal lahir Anda terlebih dahulu.';
		return;
	}
	
	messageDiv.textContent = '';
	if (ageInterval) clearInterval(ageInterval);

	// Hide previous results and show loading animation
	ageResultDiv.classList.add('hidden');
	zodiacShioResultDiv.classList.add('hidden');
	loadingAnimation.classList.remove('hidden');
	loadingAnimation.classList.add('flex');
	calculateBtn.disabled = true;
	calculateBtn.classList.add('opacity-50');

	setTimeout(() => {
		// Hide loading animation and show result containers
		loadingAnimation.classList.add('hidden');
		loadingAnimation.classList.remove('flex');
		ageResultDiv.classList.remove('hidden');
		zodiacShioResultDiv.classList.remove('hidden');
		calculateBtn.disabled = false;
		calculateBtn.classList.remove('opacity-50');

		const birthDate = new Date(birthDateString);

		// --- 1. Zodiac and Shio Calculation ---
		const day = birthDate.getDate();
		const month = birthDate.getMonth() + 1;
		const year = birthDate.getFullYear();
		const zodiac = getZodiac(day, month);
		const shio = getShio(year);

		zodiacDisplayDiv.innerHTML = `<div class="text-xl font-bold mb-1">Zodiak Anda</div><div class="text-3xl">${zodiac}</div>`;
		shioDisplayDiv.innerHTML = `<div class="text-xl font-bold mb-1">Shio Anda</div><div class="text-3xl">${shio}</div>`;

		// --- 2. Setup for Animation ---
		ageDisplayDiv.innerHTML = 
			createTimeUnitBox('Tahun', 'age-years') + createTimeUnitBox('Bulan', 'age-months') +
			createTimeUnitBox('Hari', 'age-days') + createTimeUnitBox('Jam', 'age-hours') +
			createTimeUnitBox('Menit', 'age-minutes') + createTimeUnitBox('Detik', 'age-seconds');
		
		const numberElements = {
			years: document.getElementById('age-years'), months: document.getElementById('age-months'),
			days: document.getElementById('age-days'), hours: document.getElementById('age-hours'),
			minutes: document.getElementById('age-minutes'), seconds: document.getElementById('age-seconds')
		};

		// --- 3. Live Age Calculation & Animation ---
		function updateAge() {
			const now = new Date();
			let diff = now - birthDate;
			const results = {};
			results.years = Math.floor(diff / 31557600000); diff -= results.years * 31557600000;
			results.months = Math.floor(diff / 2629800000); diff -= results.months * 2629800000;
			results.days = Math.floor(diff / 86400000); diff -= results.days * 86400000;
			results.hours = Math.floor(diff / 3600000); diff -= results.hours * 3600000;
			results.minutes = Math.floor(diff / 60000); diff -= results.minutes * 60000;
			results.seconds = Math.floor(diff / 1000);
			return results;
		}

		const finalAge = updateAge();
		animateValue(numberElements.years, 0, finalAge.years, 1500);
		animateValue(numberElements.months, 0, finalAge.months, 1500);
		animateValue(numberElements.days, 0, finalAge.days, 1500);
		animateValue(numberElements.hours, 0, finalAge.hours, 1500);
		animateValue(numberElements.minutes, 0, finalAge.minutes, 1500);
		animateValue(numberElements.seconds, 0, finalAge.seconds, 1500);

		setTimeout(() => {
			ageInterval = setInterval(() => {
				const currentAge = updateAge();
				for (const unit in currentAge) {
					numberElements[unit].textContent = currentAge[unit];
				}
			}, 1000);
		}, 1600);

	}, 2500); // Animation duration
}

calculateBtn.addEventListener('click', calculateDetails);

// Set dynamic copyright year
document.getElementById('copyright-year').textContent = new Date().getFullYear();